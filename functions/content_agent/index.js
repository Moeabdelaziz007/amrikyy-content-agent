const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { jwtVerify } = require('jose');
const OpenAI = require('openai');

initializeApp();
const db = getFirestore();

const JWT_SECRET = new TextEncoder().encode(process.env.SIWE_JWT_SECRET || 'dev-secret');

// --- Virtual Agent Definitions ---
const agents = {
  aura: {
    persona: 'You are Aura, The Empath. An AI expert in sentiment analysis. Analyze the user\'s prompt and determine the sentiment (e.g., Positive, Negative, Neutral, Excited, Urgent). Respond in strict JSON format: {\"sentiment\": \"...\"}',
  },
  orion: {
    persona: 'You are Orion, The Strategist. A world-class SEO and market trend analyst. Using the user\'s prompt and the detected sentiment, generate a strategic brief. Respond in strict JSON format: {\"strategy_brief\": \"...\", \"seo_keywords\": [\"...\"]}',
  },
  echo: {
    persona: 'You are Echo, The Copywriter. A master viral content creator. Write a compelling Twitter thread based on the provided strategy, matching the detected sentiment. Create a \"visual_concept\" for an image. Respond in strict JSON format: {\"title\": \"...\", \"thread_draft\": [\"...\"], \"visual_concept\": \"...\"}',
  },
  helios: {
    persona: 'You are Helios, The Editor. A specialist in creating viral hooks. Review the provided thread draft and rewrite the first tweet to be more engaging and impactful. The rest of the thread remains the same. Respond in strict JSON format: {\"final_thread\": [\"...\"]}',
  },
  nova: {
    persona: 'You are Nova, The Visionary. An artistic AI that generates stunning visuals based on a concept.',
  },
  cygnus: {
    persona: 'You are Cygnus, The Amplifier. A social media expert. Analyze the final content and generate optimized hashtags. Respond in strict JSON format: {\"hashtags\": [\"...\"]}',
  },
};

// --- OpenAI API Callers ---
async function callChatAgent(openai, agent, userContent) {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: agent.persona },
      { role: 'user', content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });
  return JSON.parse(completion.choices[0].message.content || '{}');
}

async function callImageAgent(openai, prompt) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Create a visually stunning image based on this concept: "${prompt}" Style: futuristic, digital art, high quality.`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });
  return response.data[0].url;
}

// --- Main Orchestrator Function ---
exports.contentAgent = onRequest({ cors: true, region: 'us-central1' }, async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' });

    const token = auth.slice(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || !payload.wallet) return res.status(401).json({ error: 'Invalid token' });

    const input = req.body.input || {};
    const userPrompt = input.prompt || 'The future of decentralized AI';

    const now = new Date().toISOString();
    const jobRef = db.collection('agent_jobs').doc();
    await jobRef.set({ id: jobRef.id, userId: `user_${payload.wallet}`, agentType: 'agent_os_v2', status: 'running', input, createdAt: now, updatedAt: now });

    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // --- Agent Orchestration --- //
    const auraResult = await callChatAgent(openai, agents.aura, userPrompt);
    const orionResult = await callChatAgent(openai, agents.orion, `Sentiment: ${auraResult.sentiment}. Prompt: ${userPrompt}`);
    const echoResult = await callChatAgent(openai, agents.echo, `Sentiment: ${auraResult.sentiment}. Strategy: ${JSON.stringify(orionResult)}`);
    const heliosResult = await callChatAgent(openai, agents.helios, `Draft: ${JSON.stringify(echoResult.thread_draft)}`);
    const cygnusResult = await callChatAgent(openai, agents.cygnus, `Content: ${JSON.stringify(heliosResult.final_thread)}`);
    const novaResultUrl = await callImageAgent(openai, echoResult.visual_concept || 'A futuristic abstract image representing artificial intelligence.');

    const finalOutput = {
      title: echoResult.title,
      sentiment: auraResult.sentiment,
      strategy_brief: orionResult.strategy_brief,
      seo_keywords: orionResult.seo_keywords,
      thread: heliosResult.final_thread,
      hashtags: cygnusResult.hashtags,
      visual_concept: echoResult.visual_concept,
      image_url: novaResultUrl,
    };

    const resultRef = db.collection('job_results').doc();
    await resultRef.set({ id: resultRef.id, jobId: jobRef.id, userId: `user_${payload.wallet}`, output: finalOutput, createdAt: new Date().toISOString() });

    await jobRef.update({ status: 'completed', resultRef: resultRef.path, updatedAt: new Date().toISOString() });

    res.status(200).json({ jobId: jobRef.id, status: 'completed', result: { output: finalOutput } });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e && e.message) || 'Internal error' });
  }
});
