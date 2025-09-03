// Next.js API route for Google Gemini with feature flag, rate limiting, and SIWE auth
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBearerToken, verifySiweJwtOrThrow } from '../../../lib/auth';
import { checkAndConsumeQuota } from '../../../lib/quota';

// Feature flag - disable Gemini if not enabled
const GEMINI_FEATURE_ENABLED = process.env.GEMINI_FEATURE_ENABLED === 'true';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

function getRateLimitKey(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.connection.remoteAddress;
  return ip || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = ip;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    // Reset or first request
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: current.resetTime };
  }

  current.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - current.count, resetAt: current.resetTime };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check feature flag
  if (!GEMINI_FEATURE_ENABLED) {
    return res.status(503).json({ error: 'Gemini feature is currently disabled' });
  }

  // Check API key
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'Service configuration error' });
  }

  // Rate limiting (per IP)
  const ip = getRateLimitKey(req);
  const rateLimit = checkRateLimit(ip);
  
  if (!rateLimit.allowed) {
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toString());
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
    });
  }

  // SIWE Authentication
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  let wallet: string;
  try {
    wallet = await verifySiweJwtOrThrow(token);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Per-wallet quota check
  try {
    const quota = await checkAndConsumeQuota(wallet, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50 // 50 requests per hour per wallet
    });

    res.setHeader('X-Quota-Limit', quota.limit.toString());
    res.setHeader('X-Quota-Remaining', quota.remaining.toString());
    res.setHeader('X-Quota-Reset', quota.resetAt.toString());

    if (!quota.allowed) {
      return res.status(429).json({ 
        error: 'Quota exceeded. Please try again later.',
        retryAfter: Math.ceil((quota.resetAt - Date.now()) / 1000)
      });
    }
  } catch (error) {
    console.error('Quota check failed:', error);
    return res.status(500).json({ error: 'Quota service error' });
  }

  // Input validation
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required and must be a non-empty string' });
  }

  if (prompt.length > 1000) {
    return res.status(400).json({ error: 'Prompt must be 1000 characters or less' });
  }

  try {
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response format:', data);
      return res.status(502).json({ error: 'AI service returned invalid response' });
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    // Return structured response
    return res.status(200).json({
      success: true,
      model: 'gemini-pro',
      content: generatedText,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      },
      metadata: {
        wallet,
        timestamp: new Date().toISOString(),
        rateLimitRemaining: rateLimit.remaining
      }
    });

  } catch (error) {
    console.error('Gemini API request failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
