/**
 * Server-side data loading module.
 * Fetches from the Hono backend API (DB-backed) with a JSON file fallback
 * for build-time resilience when the backend isn't running.
 * 
 * Uses Next.js ISR (revalidate) for server-side caching instead of no-store.
 */

import { readFile } from "fs/promises";
import { join } from "path";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
/** Only attempt live API calls when a backend URL is explicitly configured. */
const API_CONFIGURED = !!process.env.NEXT_PUBLIC_API_URL;

/** Map of logical data keys to their Hono API paths and JSON file fallbacks */
const DATA_MAP: Record<string, { apiPath: string; jsonFile: string }> = {
  agents:           { apiPath: "/api/agents",           jsonFile: "agents.json" },
  events:           { apiPath: "/api/events",           jsonFile: "events.json" },
  discussions:      { apiPath: "/api/discussions",      jsonFile: "discussions.json" },
  assessments:      { apiPath: "/api/assessments",      jsonFile: "assessments.json" },
  markets:          { apiPath: "/api/markets",          jsonFile: "polymarket.json" },
  "poly-discussions": { apiPath: "/api/poly-discussions", jsonFile: "poly-discussions.json" },
  pulse:            { apiPath: "/api/pulse",            jsonFile: "pulse.json" },
  actors:           { apiPath: "/api/actors",           jsonFile: "actors.json" },
  assets:           { apiPath: "/api/assets",           jsonFile: "assets.json" },
  sanctions:        { apiPath: "/api/sanctions",        jsonFile: "sanctions.json" },
  theaters:         { apiPath: "/api/theaters",         jsonFile: "theaters.json" },
  timeline:         { apiPath: "/api/timeline",         jsonFile: "timeline.json" },
  activity:         { apiPath: "/api/activity",         jsonFile: "activity.json" },
};

/** Load JSON file from public/data as async fallback — non-blocking */
async function loadJsonFallback(file: string): Promise<any[]> {
  try {
    const raw = await readFile(join(process.cwd(), "public/data", file), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Load data by key. Tries Hono API first, falls back to JSON.
 * Uses Next.js fetch cache with 30s revalidation (ISR).
 */
export async function loadData<T = any>(key: string): Promise<T[]> {
  const mapping = DATA_MAP[key];
  if (!mapping) {
    console.warn(`[data] Unknown data key: ${key}`);
    return [];
  }

  if (!API_CONFIGURED) return (await loadJsonFallback(mapping.jsonFile)) as T[];

  try {
    const res = await fetch(`${API_URL}${mapping.apiPath}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return (json.data || json) as T[];
  } catch {
    return (await loadJsonFallback(mapping.jsonFile)) as T[];
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
    const all = await loadJsonFallback(mapping.jsonFile);
    return (all.find((item: any) => item.id === id) as T) || null;
  }

  try {
    const res = await fetch(`${API_URL}${mapping.apiPath}/${id}`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return (json.data || json) as T;
  } catch {
    const all = await loadJsonFallback(mapping.jsonFile);
    return (all.find((item: any) => item.id === id) as T) || null;
  }
}
