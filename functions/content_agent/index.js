const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { jwtVerify } = require('jose');
const OpenAI = require('openai');

initializeApp();
const db = getFirestore();

const JWT_SECRET = new TextEncoder().encode(process.env.SIWE_JWT_SECRET || 'dev-secret');

exports.contentAgent = onRequest({ cors: true, region: 'us-central1' }, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing auth' });
      return;
    }

    const token = auth.slice(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const wallet = payload && payload.wallet;
    if (!wallet) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const input = (req.body && req.body.input) || {};
    const isAsync = !!(req.body && req.body.async);

    const now = new Date().toISOString();
    const jobRef = db.collection('agent_jobs').doc();
    const jobId = jobRef.id;

    await jobRef.set({
      id: jobId,
      userId: `user_${wallet}`,
      agentType: 'content',
      status: isAsync ? 'queued' : 'running',
      input,
      async: isAsync,
      createdAt: now,
      updatedAt: now
    });

    if (isAsync) {
      res.status(200).json({ jobId, status: 'queued' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: 'OPENAI_API_KEY missing' });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are an expert crypto marketing copywriter. Return strict JSON with keys: title, thread[]. Tone: ${input.tone || 'professional'}. Length: ${input.length || 'short'}.`;
    const user = input.prompt || 'Write a short crypto thread.';

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `${user}\n\nRespond in JSON only: {"title": "...", "thread": ["...","..."]}` }
      ],
      temperature: 0.7,
      max_tokens: 700
    });

    const text = (completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { title: 'Generated Content', thread: [text] };
    }

    const resultRef = db.collection('job_results').doc();
    const resultId = resultRef.id;
    const result = {
      id: resultId,
      jobId,
      userId: `user_${wallet}`,
      output: parsed,
      model: completion.model,
      createdAt: new Date().toISOString()
    };

    await resultRef.set(result);

    const usage = completion.usage || {};
    const tokens = usage.total_tokens || null;
    const usdCost = tokens ? Number(tokens) * 0.000002 : null;

    await jobRef.update({
      status: 'completed',
      resultRef: `job_results/${resultId}`,
      updatedAt: new Date().toISOString(),
      tokens,
      usdCost
    });

    res.status(200).json({ jobId, status: 'completed', result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e && e.message) || 'Internal error' });
  }
});

/* Local:
   firebase emulators:start --only functions,firestore
   curl -X POST http://localhost:5001/PROJECT_ID/us-central1/contentAgent -H "authorization: Bearer <jwt>" -H "content-type: application/json" -d '{"input":{"prompt":"Hello"},"async":false}'
*/
