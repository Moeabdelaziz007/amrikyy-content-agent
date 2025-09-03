import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.SIWE_JWT_SECRET || 'dev-secret');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    const cookieJwt = cookies().get('siwe_jwt')?.value;
    const jwt = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7) : cookieJwt;

    if (!jwt) {
      return NextResponse.json({ error: 'Missing JWT' }, { status: 401 });
    }

    const { payload } = await jwtVerify(jwt, JWT_SECRET);
    const wallet = (payload as any).wallet;

    if (!wallet) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const targetUrl =
      process.env.FUNCTIONS_BASE_URL ||
      'http://localhost:5001/PROJECT_ID/us-central1/contentAgent';

    const r = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        agentType: 'content',
        input: body?.input || {},
        async: body?.async ?? false
      })
    });

    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

/* Local:
   curl -X POST http://localhost:3000/api/agent/run -H "authorization: Bearer <JWT>" -H "content-type: application/json" -d '{"input":{"prompt":"Hello"}}'
*/
