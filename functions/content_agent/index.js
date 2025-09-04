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
  orion: {
    persona: 'You are Orion, The Strategist. A world-class SEO and market trend analyst. Your task is to analyze a user\'s prompt and generate a strategic brief for creating viral content. Identify the core topic, the target audience, and a list of 5-7 high-impact SEO keywords. Respond in strict JSON format: {\"strategy_brief\": \"...\", \"seo_keywords\": [\"...\"]}',
  },
  echo: {
    persona: 'You are Echo, The Copywriter. A master viral content creator. Your task is to take a strategic brief and write a compelling, engaging Twitter thread. The tone should be professional and insightful. You must also create a \"visual_concept\" which is a detailed, literal, and vivid description of an image suitable for a text-to-image AI. Respond in strict JSON format: {\"title\": \"...\", \"thread\": [\"...\"], \"visual_concept\": \"...\"}',
  },
  nova: {
    persona: 'You are Nova, The Visionary. An artistic AI that generates stunning visuals. Your only task is to create an image based on a visual concept.',
  },
  cygnus: {
    persona: 'You are Cygnus, The Amplifier. A social media expert specializing in reach maximization. Analyze the following content and generate a list of 10-15 optimized hashtags for Twitter/X. Respond in strict JSON format: {\"hashtags\": [\"...\"]}',
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
    await jobRef.set({ id: jobRef.id, userId: `user_${payload.wallet}`, agentType: 'agent_os_v1', status: 'running', input, createdAt: now, updatedAt: now });

    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // --- Agent Orchestration --- //
    const orionResult = await callChatAgent(openai, agents.orion, userPrompt);
    const echoResult = await callChatAgent(openai, agents.echo, `Strategic Brief: ${JSON.stringify(orionResult)}`);
    const cygnusResult = await callChatAgent(openai, agents.cygnus, `Content: ${JSON.stringify(echoResult)}`);
    const novaResultUrl = await callImageAgent(openai, echoResult.visual_concept || 'A futuristic abstract image representing artificial intelligence.');

    const finalOutput = {
      title: echoResult.title,
      strategy_brief: orionResult.strategy_brief,
      seo_keywords: orionResult.seo_keywords,
      thread: echoResult.thread,
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
