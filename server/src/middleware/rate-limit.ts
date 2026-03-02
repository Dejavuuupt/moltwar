/**
 * In-memory rate limiter middleware for Hono.
 * Uses a sliding-window counter per IP address.
 *
 * Features:
 * - Configurable window (seconds) and max requests per window
 * - Per-route or global usage
 * - Automatic cleanup of expired entries
 * - Returns standard 429 with Retry-After header
 */

import type { Context, Next } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Time window in seconds (default: 60) */
  windowSeconds?: number;
  /** Max requests per window (default: 100) */
  max?: number;
  /** Key generator — defaults to IP address */
  keyGenerator?: (c: Context) => string;
  /** Custom message on 429 */
  message?: string;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Periodic cleanup every 60s across all stores
setInterval(() => {
  const now = Date.now();
  for (const [, store] of stores) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }
}, 60_000);

/**
 * Create a rate limiter middleware.
 *
 * Usage:
 *   app.use("*", rateLimit({ windowSeconds: 60, max: 100 }));           // global
 *   app.post("/api/events", rateLimit({ max: 10 }), agentAuth, handler); // per-route
 */
export function rateLimit(opts: RateLimitOptions = {}) {
  const {
    windowSeconds = 60,
    max = 100,
    keyGenerator = defaultKeyGenerator,
    message = "Too many requests",
  } = opts;

  const windowMs = windowSeconds * 1000;
  const storeId = `${windowSeconds}:${max}:${Math.random().toString(36).slice(2, 6)}`;
  const store = new Map<string, RateLimitEntry>();
  stores.set(storeId, store);

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    // Set standard rate-limit headers
    const remaining = Math.max(0, max - entry.count);
    const resetSec = Math.ceil((entry.resetAt - now) / 1000);

    c.header("X-RateLimit-Limit", String(max));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      c.header("Retry-After", String(resetSec));
      return c.json({ error: message, retryAfter: resetSec }, 429);
    }

    await next();
  };
}

function defaultKeyGenerator(c: Context): string {
  // Bun / Hono expose the connecting IP in various ways
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    c.req.header("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Pre-built rate limiters for common use cases.
 */
export const rateLimiters = {
  /** 200 req/min — standard GET endpoints */
  api: () => rateLimit({ windowSeconds: 60, max: 200 }),
  /** 20 req/min — POST / write operations */
  write: () => rateLimit({ windowSeconds: 60, max: 20 }),
  /** 10 req/min — agent claim / auth-sensitive */
  auth: () => rateLimit({ windowSeconds: 60, max: 10 }),
  /** 30 req/min — search (expensive queries) */
  search: () => rateLimit({ windowSeconds: 60, max: 30 }),
};
