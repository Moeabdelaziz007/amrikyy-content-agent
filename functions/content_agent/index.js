const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { jwtVerify } = require('jose');
const OpenAI = require('openai');

initializeApp();
const db = getFirestore();

const JWT_SECRET = new TextEncoder().encode(process.env.SIWE_JWT_SECRET || 'dev-secret');

// Helper function for making OpenAI Chat API calls
async function callOpenAIChat(openai, messages, response_format = { type: "json_object" }) {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1500,
    response_format,
  });
  return completion;
}

// Helper function for making OpenAI Image API calls
async function callOpenAIImage(openai, prompt) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });
  return response.data[0].url;
}

exports.contentAgent = onRequest({ cors: true, region: 'us-central1' }, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing auth' });
    }

    const token = auth.slice(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const wallet = payload && payload.wallet;
    if (!wallet) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const input = req.body.input || {};
    const userPrompt = input.prompt || 'The future of decentralized AI';
    const userTone = input.tone || 'professional and insightful';

    const now = new Date().toISOString();
    const jobRef = db.collection('agent_jobs').doc();
    const jobId = jobRef.id;

    await jobRef.set({
      id: jobId,
      userId: `user_${wallet}`,
      agentType: 'viral_content_media_engineer_v1', // New agent type
      status: 'running',
      input,
      createdAt: now,
      updatedAt: now
    });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY missing' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // --- Agent Tool Chain --- //

    // Step 1: SEO & Search Tool
    const analysisMessages = [
      { role: 'system', content: 'You are a world-class SEO and market trend analyst. Your task is to analyze a user\'s prompt and generate a strategic brief for creating viral content. Identify the core topic, the target audience, and a list of 5-7 high-impact SEO keywords. Respond in strict JSON format: {\"strategy_brief\": \"...\", \"seo_keywords\": [\"...\"]}' },
      { role: 'user', content: userPrompt }
    ];
    const analysisCompletion = await callOpenAIChat(openai, analysisMessages);
    const analysisResult = JSON.parse(analysisCompletion.choices[0].message.content || '{}');

    // Step 2: Content & Visual Concept Generation Tool
    const contentMessages = [
      { role: 'system', content: `You are a master viral content creator. Your task is to take a strategic brief and write a compelling, engaging Twitter thread. The tone should be ${userTone}. You must also create a \"visual_concept\" which is a detailed, literal, and vivid description of an image suitable for a text-to-image AI like DALL-E. Respond in strict JSON format: {\"title\": \"...\", \"thread\": [\"...\"], \"visual_concept\": \"...\"}` },
      { role: 'user', content: `Strategic Brief: ${JSON.stringify(analysisResult)}` }
    ];
    const contentCompletion = await callOpenAIChat(openai, contentMessages);
    const contentResult = JSON.parse(contentCompletion.choices[0].message.content || '{}');

    // Step 3: Hashtag Tool
    const hashtagMessages = [
      { role: 'system', content: 'You are a social media expert specializing in reach maximization. Analyze the following content and generate a list of 10-15 optimized hashtags for Twitter/X. Respond in strict JSON format: {\"hashtags\": [\"...\"]}' },
      { role: 'user', content: `Content: ${JSON.stringify(contentResult)}` }
    ];
    const hashtagCompletion = await callOpenAIChat(openai, hashtagMessages);
    const hashtagResult = JSON.parse(hashtagCompletion.choices[0].message.content || '{}');

    // Step 4: Image Generation Tool
    const imageUrl = await callOpenAIImage(openai, contentResult.visual_concept || 'A futuristic abstract image representing artificial intelligence and cryptocurrency.');

    // --- Final Output Assembly ---
    const finalOutput = {
      title: contentResult.title,
      strategy_brief: analysisResult.strategy_brief,
      seo_keywords: analysisResult.seo_keywords,
      thread: contentResult.thread,
      hashtags: hashtagResult.hashtags,
      visual_concept: contentResult.visual_concept,
      image_url: imageUrl,
    };

    const resultRef = db.collection('job_results').doc();
    const resultId = resultRef.id;
    const result = {
      id: resultId,
      jobId,
      userId: `user_${wallet}`,
      output: finalOutput,
      model: contentCompletion.model, // Note: model for text part
      createdAt: new Date().toISOString()
    };
    await resultRef.set(result);

    const totalTokens = (analysisCompletion.usage?.total_tokens || 0) + (contentCompletion.usage?.total_tokens || 0) + (hashtagCompletion.usage?.total_tokens || 0);

    await jobRef.update({
      status: 'completed',
      resultRef: `job_results/${resultId}`,
      updatedAt: new Date().toISOString(),
      tokens: totalTokens,
    });

    res.status(200).json({ jobId, status: 'completed', result });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e && e.message) || 'Internal error' });
  }
});
