import type { Firestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';

type RunArgs = {
  db: Firestore;
  wallet: string;
  input: {
    prompt?: string;
    tone?: string;
    length?: 'short' | 'medium' | 'long';
  };
  async: boolean;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function runContentAgent(args: RunArgs) {
  const { db, wallet, input, async } = args;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing');
  }

  const now = new Date().toISOString();
  const jobRef = db.collection('agent_jobs').doc();
  const jobId = jobRef.id;

  const jobDoc = {
    id: jobId,
    userId: `user_${wallet}`,
    agentType: 'content',
    status: async ? 'queued' : 'running',
    input: input || {},
    async,
    createdAt: now,
    updatedAt: now
  } as const;

  await jobRef.set(jobDoc);

  if (async) {
    // Placeholder: enqueue to a worker or Pub/Sub
    return { jobId, status: 'queued' };
  }

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

  const text = completion.choices?.[0]?.message?.content || '{}';

  let parsed: any;
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

  const usage: any = (completion as any).usage || {};
  const tokens = usage.total_tokens || null;
  const usdCost = tokens ? Number(tokens) * 0.000002 : null;

  await jobRef.update({
    status: 'completed',
    resultRef: `job_results/${resultId}`,
    updatedAt: new Date().toISOString(),
    tokens,
    usdCost
  });

  return { jobId, status: 'completed', result };
}

/* How to run:
   - Provide GOOGLE_APPLICATION_CREDENTIALS and OPENAI_API_KEY
   - curl localhost:4000/api/agent/content/run -H "authorization: Bearer <jwt>" -d '{"input":{"prompt":"..."},"async":false}'
*/
