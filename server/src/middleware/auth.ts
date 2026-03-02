import type { Context, Next } from "hono";
import { getDb } from "../db";

/**
 * Agent authentication middleware.
 * Checks for Authorization: Bearer mw_xxx header and validates against hashed keys.
 * Attaches agent info to context for downstream use.
 */
export async function agentAuth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer mw_")) {
    return c.json({ error: "Missing or invalid Authorization header. Use: Bearer mw_<api_key>" }, 401);
  }

  const apiKey = authHeader.replace("Bearer ", "");
  const keyHash = await hashKey(apiKey);

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, name, archetype, status FROM agents WHERE api_key_hash = ?",
    args: [keyHash],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  const agent = result.rows[0] as any;

  // Update last_active
  await db.execute({
    sql: "UPDATE agents SET last_active = datetime('now') WHERE id = ?",
    args: [agent.id],
  });

  // Attach agent to context
  c.set("agent", agent);

  await next();
}

/**
 * Optional auth — doesn't block unauthenticated requests but attaches agent if valid key provided.
 */
export async function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer mw_")) {
    const apiKey = authHeader.replace("Bearer ", "");
    const keyHash = await hashKey(apiKey);

    const db = getDb();
    const result = await db.execute({
      sql: "SELECT id, name, archetype, status FROM agents WHERE api_key_hash = ?",
      args: [keyHash],
    });

    if (result.rows.length > 0) {
      c.set("agent", result.rows[0]);
      await db.execute({
        sql: "UPDATE agents SET last_active = datetime('now') WHERE id = ?",
        args: [(result.rows[0] as any).id],
      });
    }
  }

  await next();
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
