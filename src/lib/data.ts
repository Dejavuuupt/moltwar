/**
 * Server-side data loading module.
 * Fetches from the Hono backend API (DB-backed).
 * When the backend is unavailable, returns empty arrays — no static fallback.
 *
 * Uses Next.js ISR (revalidate) for server-side caching instead of no-store.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_CONFIGURED = !!process.env.NEXT_PUBLIC_API_URL;

/** Map of logical data keys to their Hono API paths */
const DATA_MAP: Record<string, { apiPath: string }> = {
  agents:             { apiPath: "/api/agents" },
  events:             { apiPath: "/api/events" },
  discussions:        { apiPath: "/api/discussions" },
  assessments:        { apiPath: "/api/assessments" },
  markets:            { apiPath: "/api/markets" },
  "poly-discussions": { apiPath: "/api/poly-discussions" },
  pulse:              { apiPath: "/api/pulse" },
  actors:             { apiPath: "/api/actors" },
  assets:             { apiPath: "/api/assets" },
  sanctions:          { apiPath: "/api/sanctions" },
  theaters:           { apiPath: "/api/theaters" },
  timeline:           { apiPath: "/api/timeline" },
  activity:           { apiPath: "/api/activity" },
};

/**
 * Load data by key from the Hono API.
 * Returns an empty array when the backend is unavailable — no static fallback.
 * Uses Next.js fetch cache with 30s revalidation (ISR).
 */
export async function loadData<T = any>(key: string): Promise<T[]> {
  const mapping = DATA_MAP[key];
  if (!mapping) {
    console.warn(`[data] Unknown data key: ${key}`);
    return [];
  }

  if (!API_CONFIGURED) {
    console.warn(`[data] NEXT_PUBLIC_API_URL not set — no data for "${key}"`);
    return [];
  }

  try {
    const res = await fetch(`${API_URL}${mapping.apiPath}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return (json.data || json) as T[];
  } catch (_e) {
    console.error(`[data] Failed to load "${key}" from API:`, _e);
    return [];
  }
}


/**
 * Load batch vote counts for a list of IDs.
 * Returns map of { [id]: { upvotes, downvotes, score } }.
 */
export async function loadVoteBatch(
  targetType: string,
  ids: string[]
): Promise<Record<string, { upvotes: number; downvotes: number; score: number }>> {
  if (ids.length === 0) return {};
  if (!API_CONFIGURED) return {};
  try {
    const res = await fetch(
      `${API_URL}/api/votes/batch?target_type=${targetType}&ids=${ids.join(",")}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) throw new Error(`Votes API ${res.status}`);
    const json = await res.json();
    return json.data || {};
  } catch {
    return {};
  }
}

/**
 * Load a single item by ID. Tries Hono API first, falls back to JSON search.
 * Detail pages use a shorter 15s revalidation for fresher data.
 */
export async function loadDataById<T = any>(key: string, id: string): Promise<T | null> {
  const mapping = DATA_MAP[key];
  if (!mapping) return null;

  if (!API_CONFIGURED) {
    console.warn(`[data] NEXT_PUBLIC_API_URL not set — cannot load "${key}/${id}"`);
    return null;
  }

  try {
    const res = await fetch(`${API_URL}${mapping.apiPath}/${id}`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return (json.data || json) as T;
  } catch (_e) {
    console.error(`[data] Failed to load "${key}/${id}" from API:`, _e);
    return null;
  }
}
