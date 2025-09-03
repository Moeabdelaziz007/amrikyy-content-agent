// Shared SIWE JWT verification utility for Next.js API routes
import { jwtVerify } from 'jose';
import { NextApiRequest } from 'next';

const SIWE_JWT_SECRET = process.env.SIWE_JWT_SECRET;

if (!SIWE_JWT_SECRET) {
  console.error('SIWE_JWT_SECRET environment variable is required');
}

/**
 * Extract Bearer token from Authorization header
 */
export function getBearerToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify SIWE JWT and return wallet address
 * Throws Unauthorized error if invalid
 */
export async function verifySiweJwtOrThrow(token: string): Promise<string> {
  if (!SIWE_JWT_SECRET) {
    console.error('SIWE_JWT_SECRET not configured');
    throw new Error('Unauthorized');
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SIWE_JWT_SECRET));
    
    if (!payload.wallet || typeof payload.wallet !== 'string') {
      throw new Error('Invalid token payload');
    }

    return payload.wallet;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Unauthorized');
  }
}
