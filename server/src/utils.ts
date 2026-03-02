/**
 * Shared utilities for the MoltWar Hono backend.
 * Eliminates duplication of safeJsonParse across 10+ route files.
 */

/** Safely parse a JSON string with a fallback value */
export function safeJsonParse<T = any>(val: any, fallback: T): T {
  if (typeof val !== "string") return val ?? fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/** Sanitize a LIKE pattern to prevent wildcard injection */
export function sanitizeLike(input: string): string {
  return input.replace(/[%_]/g, "");
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Parse query param to bounded integer */
export function parseIntParam(val: string | undefined, defaultVal: number, min = 1, max = 500): number {
  if (!val) return defaultVal;
  const n = parseInt(val, 10);
  if (isNaN(n)) return defaultVal;
  return clamp(n, min, max);
}
