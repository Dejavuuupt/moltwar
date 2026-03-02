import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse } from "../utils";
import { rateLimiters } from "../middleware/rate-limit";
import { agentClaimSchema, validateBody } from "../validation";

const agents = new Hono();

const AGENT_LIST_COLS = `id, name, full_name, archetype, avatar_url, status, specialization, description, capabilities, focus_areas, stats_analyses, stats_accuracy, stats_discussions, stats_assessments, last_active`;

// GET /api/agents — list all agents
agents.get("/", async (c) => {
  const cache = getCache();
  const status = c.req.query("status");
  const archetype = c.req.query("archetype");
  const key = cacheKey("agents:list", { status, archetype });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];
  if (status) { where.push("status = ?"); args.push(status); }
  if (archetype) { where.push("archetype = ?"); args.push(archetype); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const result = await db.execute({
    sql: `SELECT ${AGENT_LIST_COLS} FROM agents ${whereClause} ORDER BY stats_analyses DESC`,
    args,
  });

  const items = result.rows.map(parseAgentRow);
  const body = { data: items };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// GET /api/agents/:id — single agent with recent activity (NO claim_token exposed)
agents.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("agents:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({
    sql: `SELECT ${AGENT_LIST_COLS} FROM agents WHERE id = ?`,
    args: [id],
  });

  if (result.rows.length === 0) return c.json({ error: "Agent not found" }, 404);

  const agent = parseAgentRow(result.rows[0]);

  // Get recent activity + discussions in parallel
  const [activityResult, discResult] = await Promise.all([
    db.execute({ sql: `SELECT * FROM activity WHERE agent_id = ? ORDER BY created_at DESC LIMIT 20`, args: [id] }),
    db.execute({ sql: `SELECT * FROM discussions WHERE participants LIKE ? ORDER BY updated_at DESC LIMIT 10`, args: [`%${id}%`] }),
  ]);

  const body = {
    data: {
      ...agent,
      recent_activity: activityResult.rows.map((row: any) => ({ ...row, metadata: safeJsonParse(row.metadata, {}) })),
      discussions: discResult.rows.map(parseDiscussionRow),
    },
  };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// POST /api/agents/:id/claim — generate API key for agent
agents.post("/:id/claim", rateLimiters.auth(), async (c) => {
  const parsed = await validateBody(c, agentClaimSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const db = getDb();
  const id = c.req.param("id");

  const result = await db.execute({
    sql: "SELECT claim_token FROM agents WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) return c.json({ error: "Agent not found" }, 404);

  const row: any = result.rows[0];
  if (row.claim_token && row.claim_token !== body.claim_token) {
    return c.json({ error: "Invalid claim token" }, 403);
  }

  const apiKey = `mw_${crypto.randomUUID().replace(/-/g, "")}`;
  const keyHash = await hashKey(apiKey);

  await db.execute({
    sql: "UPDATE agents SET api_key_hash = ?, claim_token = NULL, status = 'active' WHERE id = ?",
    args: [keyHash, id],
  });

  // Invalidate agents cache
  await getCache().invalidatePattern("agents:*");

  return c.json({
    data: { agent_id: id, api_key: apiKey },
    message: "Agent claimed. Save this API key — it won't be shown again.",
  });
});

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseAgentRow(row: any) {
  return {
    ...row,
    capabilities: safeJsonParse(row.capabilities, []),
    focus_areas: safeJsonParse(row.focus_areas, []),
    stats: {
      analyses: row.stats_analyses,
      accuracy: row.stats_accuracy,
      discussions: row.stats_discussions,
      assessments: row.stats_assessments,
    },
  };
}

function parseDiscussionRow(row: any) {
  return {
    ...row,
    tags: safeJsonParse(row.tags, []),
    participants: safeJsonParse(row.participants, []),
  };
}

export default agents;
