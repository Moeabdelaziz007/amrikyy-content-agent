// Shared per-wallet quota helper with in-memory and Firestore-backed implementations, switchable via env.
import type { Firestore } from 'firebase-admin/firestore';

// Quota config (server-only env)
const DEFAULT_WINDOW_MS = Number(process.env.QUOTA_WINDOW_MS || 60 * 60 * 1000); // 1 hour
const DEFAULT_MAX_REQUESTS = Number(process.env.QUOTA_MAX_REQUESTS || 50); // 50 req/hour
const QUOTA_BACKEND = (process.env.QUOTA_BACKEND || 'memory').toLowerCase(); // 'memory' | 'firestore'

// ------------------ In-memory implementation (good for dev only) ------------------
type CounterKey = string; // `${wallet}:${windowStart}`
const memoryCounters = new Map<CounterKey, number>();

export type QuotaCheckResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
};

function getWindowStart(now: number, windowMs: number): number {
  return now - (now % windowMs);
}

export async function checkAndConsumeQuotaMemory(
  wallet: string,
  options?: { windowMs?: number; maxRequests?: number }
): Promise<QuotaCheckResult> {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const max = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;

  const now = Date.now();
  const windowStart = getWindowStart(now, windowMs);
  const key = `${wallet.toLowerCase()}:${windowStart}`;
  const current = memoryCounters.get(key) || 0;

  if (current >= max) {
    return { allowed: false, remaining: 0, limit: max, resetAt: windowStart + windowMs };
  }
  memoryCounters.set(key, current + 1);
  return { allowed: true, remaining: Math.max(0, max - (current + 1)), limit: max, resetAt: windowStart + windowMs };
}

// ------------------ Firestore-backed implementation (production-ready) ------------------
// Collection: usage_quota, docId: `${wallet}:${windowStart}` with fields { count, windowStart, limit }
let adminInited = false;
function ensureAdminInit() {
  if (adminInited) return;
  // Lazy import to avoid bundling issues on edge environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const adminApp = require('firebase-admin/app');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const admin = require('firebase-admin');
  try {
    if (admin.apps && admin.apps.length === 0) {
      adminApp.initializeApp();
    }
  } catch (e) {
    // If already initialized or in restricted env, ignore
  }
  adminInited = true;
}

export async function checkAndConsumeQuotaFirestore(
  wallet: string,
  options?: { windowMs?: number; maxRequests?: number }
): Promise<QuotaCheckResult> {
  ensureAdminInit();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getFirestore } = require('firebase-admin/firestore') as { getFirestore: () => Firestore };
  const db = getFirestore();

  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const max = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;

  const now = Date.now();
  const windowStart = getWindowStart(now, windowMs);
  const docId = `${wallet.toLowerCase()}:${windowStart}`;
  const ref = db.collection('usage_quota').doc(docId);

  const result: QuotaCheckResult = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() as { count?: number; limit?: number; windowStart?: number } : {};
    const current = Number(data.count || 0);

    if (current >= max) {
      return { allowed: false, remaining: 0, limit: max, resetAt: windowStart + windowMs };
    }

    const next = current + 1;
    tx.set(ref, { count: next, limit: max, windowStart }, { merge: true });

    return { allowed: true, remaining: Math.max(0, max - next), limit: max, resetAt: windowStart + windowMs };
  });

  return result;
}

// ------------------ Unified entry point ------------------
export async function checkAndConsumeQuota(
  wallet: string,
  options?: { windowMs?: number; maxRequests?: number }
): Promise<QuotaCheckResult> {
  if (QUOTA_BACKEND === 'firestore') {
    return checkAndConsumeQuotaFirestore(wallet, options);
  }
  return checkAndConsumeQuotaMemory(wallet, options);
}
