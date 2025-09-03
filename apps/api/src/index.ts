import Fastify from 'fastify';
import cors from '@fastify/cors';
import { jwtVerify } from 'jose';
import { runContentAgent } from './agents/content_agent.js';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const JWT_SECRET = new TextEncoder().encode(process.env.SIWE_JWT_SECRET || 'dev-secret');

initializeApp();
const db = getFirestore();

app.get('/health', async () => ({ ok: true }));

app.post('/api/agent/content/run', async (request, reply) => {
  try {
    const auth = request.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing auth' });
    }
    const token = auth.slice(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const wallet = (payload as any).wallet;
    if (!wallet) return reply.code(401).send({ error: 'Invalid token' });

    const body: any = request.body || {};
    const { input, async: isAsync } = body;

    const result = await runContentAgent({
      db,
      wallet,
      input,
      async: !!isAsync
    });

    return reply.code(200).send(result);
  } catch (e: any) {
    request.log.error(e);
    return reply.code(500).send({ error: e?.message || 'Internal error' });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`API listening on ${port}`);
});

/* Local:
   SIWE_JWT_SECRET=... OPENAI_API_KEY=... pnpm --filter @amrikyy/api dev
*/
