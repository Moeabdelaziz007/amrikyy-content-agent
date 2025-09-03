import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.SIWE_JWT_SECRET || 'dev-secret');
const JWT_TTL_SECONDS = 60 * 60; // 1 hour

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();

    if (!message || !signature) {
      return NextResponse.json({ error: 'Missing message or signature' }, { status: 400 });
    }

    const siwe = new SiweMessage(message);
    const domain = req.headers.get('host') || '';
    const nonce = siwe.nonce;

    const result = await siwe.verify({ signature, domain, nonce });
    if (!result.success) {
      return NextResponse.json({ error: 'SIWE verification failed' }, { status: 401 });
    }

    const walletAddress = siwe.address.toLowerCase();
    const payload = {
      sub: walletAddress,
      wallet: walletAddress,
      nonce,
      aud: domain,
      iat: Math.floor(Date.now() / 1000)
    } as const;

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime(`${JWT_TTL_SECONDS}s`)
      .sign(JWT_SECRET);

    cookies().set('siwe_jwt', jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: JWT_TTL_SECONDS,
      path: '/'
    });

    return NextResponse.json({ ok: true, jwt, walletAddress });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

/* Local:
   curl -X POST http://localhost:3000/api/siwe -H 'content-type: application/json' -d '{"message":"...","signature":"0x..."}'
*/
