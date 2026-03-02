/**
 * Unified cache layer — Redis with automatic in-memory LRU fallback.
 *
 * If REDIS_URL is set and Redis is reachable, uses Redis.
 * Otherwise, falls back to an in-memory LRU cache (TTL-aware, bounded size).
 *
 * Usage:
 *   import { cache } from "./cache";
 *   await cache.get("key");
 *   await cache.set("key", data, 60); // 60s TTL
 *   await cache.del("key");
 *   await cache.invalidatePattern("events:*");
 */

import Redis from "ioredis";

// ─── In-Memory LRU Cache ───────────────────────────────────────────

interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry>();
  private maxSize: number;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(maxSize = 2000) {
    this.maxSize = maxSize;
    // Periodic cleanup of expired entries every 30s
    this.cleanupInterval = setInterval(() => this.cleanup(), 30_000);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    // Move to end (LRU behavior — Map preserves insertion order)
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value as T;
  }

  async set<T = any>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // Evict oldest entries if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    let count = 0;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// ─── Redis Cache ───────────────────────────────────────────────────

class RedisCache {
  private client: Redis;
  private connected = false;
  private fallback: MemoryCache;

  constructor(url: string, fallback: MemoryCache) {
    this.fallback = fallback;
    this.client = new Redis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 200, 2000);
      },
      connectTimeout: 3000,
      commandTimeout: 2000,
      lazyConnect: true,
    });

    this.client.on("connect", () => {
      this.connected = true;
      console.log("[cache] Redis connected");
    });

    this.client.on("error", (err) => {
      if (this.connected) {
        console.warn("[cache] Redis error, falling back to memory:", err.message);
      }
      this.connected = false;
    });

    this.client.on("close", () => {
      this.connected = false;
    });

    // Attempt connection
    this.client.connect().catch(() => {
      console.log("[cache] Redis unavailable — using in-memory cache");
    });
  }

  private isReady(): boolean {
    return this.connected && this.client.status === "ready";
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isReady()) return this.fallback.get<T>(key);
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return this.fallback.get<T>(key);
    }
  }

  async set<T = any>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // Always write to memory cache as backup
    await this.fallback.set(key, value, ttlSeconds);
    if (!this.isReady()) return;
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // Memory fallback already written
    }
  }

  async del(key: string): Promise<void> {
    await this.fallback.del(key);
    if (!this.isReady()) return;
    try {
      await this.client.del(key);
    } catch {
      // Memory fallback already cleared
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    const memCount = await this.fallback.invalidatePattern(pattern);
    if (!this.isReady()) return memCount;
    try {
      let cursor = "0";
      let totalDeleted = 0;
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
          totalDeleted += keys.length;
        }
      } while (cursor !== "0");
      return totalDeleted;
    } catch {
      return memCount;
    }
  }

  async flush(): Promise<void> {
    await this.fallback.flush();
    if (!this.isReady()) return;
    try {
      await this.client.flushdb();
    } catch {
      // Memory already flushed
    }
  }

  get size(): number {
    return this.fallback.size;
  }

  async destroy(): Promise<void> {
    this.fallback.destroy();
    try {
      await this.client.quit();
    } catch {
      // Ignore
    }
  }
}

// ─── Cache Interface ───────────────────────────────────────────────

export interface ICache {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<number>;
  flush(): Promise<void>;
  readonly size: number;
}

// ─── Singleton Factory ─────────────────────────────────────────────

let _cache: ICache;

export function getCache(): ICache {
  if (_cache) return _cache;

  const memCache = new MemoryCache(2000);
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    console.log("[cache] Redis URL configured — attempting connection...");
    _cache = new RedisCache(redisUrl, memCache);
  } else {
    console.log("[cache] No REDIS_URL — using in-memory LRU cache");
    _cache = memCache;
  }

  return _cache;
}

// ─── Cache Key Helpers ─────────────────────────────────────────────

/** Default TTLs in seconds */
export const TTL = {
  /** Hot data: events, pulse, activity — 30 seconds */
  HOT: 30,
  /** Warm data: agents, discussions, assessments — 2 minutes */
  WARM: 120,
  /** Cold data: actors, assets, sanctions, theaters, timeline — 5 minutes */
  COLD: 300,
  /** Stats/aggregates — 1 minute */
  STATS: 60,
  /** Search results — 30 seconds */
  SEARCH: 30,
  /** Tags — 5 minutes */
  TAGS: 300,
} as const;

/** Build a cache key from route + query params */
export function cacheKey(prefix: string, params?: Record<string, string | undefined>): string {
  const parts = [prefix];
  if (params) {
    const sorted = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .sort(([a], [b]) => a.localeCompare(b));
    if (sorted.length > 0) {
      parts.push(sorted.map(([k, v]) => `${k}=${v}`).join("&"));
    }
  }
  return parts.join(":");
}

export { MemoryCache };
