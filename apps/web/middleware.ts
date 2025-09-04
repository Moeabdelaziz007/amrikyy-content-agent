import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ALPHA_MODE = process.env.ALPHA_MODE === 'true';
const WHITELIST = (process.env.ALPHA_WHITELIST || '').toLowerCase().split(',').map(a => a.trim()).filter(a => a.length > 0);
const SIWE_JWT_SECRET = process.env.SIWE_JWT_SECRET;

async function getWalletAddress(req: NextRequest): Promise<string | null> {
    const token = req.cookies.get('auth_token')?.value;
    if (!token || !SIWE_JWT_SECRET) {
        return null;
    }
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(SIWE_JWT_SECRET));
        return (payload.wallet as string)?.toLowerCase() || null;
    } catch (e) {
        console.error('JWT verification failed in middleware', e);
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const url = req.nextUrl.clone();

    // Allow access to the denied page and authentication API routes
    if (pathname.startsWith('/alpha-denied') || pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    if (!ALPHA_MODE) {
        return NextResponse.next();
    }

    if (WHITELIST.length === 0) {
        console.warn("ALPHA_MODE is true, but ALPHA_WHITELIST is empty. Allowing all traffic.");
        return NextResponse.next();
    }

    const walletAddress = await getWalletAddress(req);

    if (!walletAddress) {
        // Not logged in, redirect to home page to log in.
        if (pathname !== '/') {
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    if (!WHITELIST.includes(walletAddress)) {
        url.pathname = '/alpha-denied';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}