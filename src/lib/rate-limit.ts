/**
 * Simple in-memory sliding window rate limiter.
 * No external dependencies — works on Vercel free tier.
 *
 * Caveat: state is per-instance, not shared across serverless invocations.
 * This still protects against rapid-fire abuse within a single instance
 * (Vercel's Fluid Compute reuses instances across requests).
 * Upgrade to Upstash or Vercel WAF (Pro) for distributed rate limiting.
 */

interface Entry {
  timestamps: number[];
}

const stores = new Map<string, Map<string, Entry>>();

function getStore(prefix: string): Map<string, Entry> {
  let store = stores.get(prefix);
  if (!store) {
    store = new Map();
    stores.set(prefix, store);
  }
  return store;
}

export interface RateLimiter {
  limit(key: string): { success: boolean };
}

function createLimiter(
  maxRequests: number,
  windowMs: number,
  prefix: string
): RateLimiter {
  return {
    limit(key: string) {
      const store = getStore(prefix);
      const now = Date.now();
      const windowStart = now - windowMs;

      let entry = store.get(key);
      if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
      }

      // Remove expired timestamps
      entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

      if (entry.timestamps.length >= maxRequests) {
        return { success: false };
      }

      entry.timestamps.push(now);
      return { success: true };
    },
  };
}

// Periodically clean up stale entries to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [, store] of stores) {
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => t > now - 120_000);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }
}, 60_000);

// Checkout: 5 requests per 60s per user
export const checkoutLimiter = createLimiter(5, 60_000, "checkout");

// Auth actions: 10 requests per 60s per IP
export const authLimiter = createLimiter(10, 60_000, "auth");

// API routes: 30 requests per 60s per IP
export const apiLimiter = createLimiter(30, 60_000, "api");

// Account deletion: 2 attempts per 10 minutes per user
export const deleteAccountLimiter = createLimiter(2, 600_000, "deleteAccount");

// Billing actions (cancel, resume, portal): 5 requests per 60s per user
export const billingLimiter = createLimiter(5, 60_000, "billing");
