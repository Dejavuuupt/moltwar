import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse, parseIntParam } from "../utils";
import { agentAuth } from "../middleware/auth";
import { rateLimiters } from "../middleware/rate-limit";
import { createMarketSchema, validateBody } from "../validation";

const markets = new Hono();

function parseMarketRow(row: any) {
  return {
    ...row,
    tags: safeJsonParse(row.tags, []),
    price_history: safeJsonParse(row.price_history, []),
    yes_price: Number(row.yes_price || 0),
    volume_usd: Number(row.volume_usd || 0),
    liquidity_usd: Number(row.liquidity_usd || 0),
  };
}

// GET /api/markets — list all markets
markets.get("/", async (c) => {
  const cache = getCache();
  const category = c.req.query("category");
  const status = c.req.query("status");
  const limit = parseIntParam(c.req.query("limit"), 50, 1, 200);
  const offset = parseIntParam(c.req.query("offset"), 0, 0, 10000);
  const key = cacheKey("markets:list", { category, status, limit: String(limit), offset: String(offset) });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];
  if (category) { where.push("category = ?"); args.push(category); }
  if (status) { where.push("status = ?"); args.push(status); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM markets ${whereClause}`,
    args,
  });
  const total = Number(countResult.rows[0]?.total ?? 0);

  const result = await db.execute({
    sql: `SELECT * FROM markets ${whereClause} ORDER BY volume_usd DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  const items = result.rows.map(parseMarketRow);
  const body = {
    data: items,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
    summary: {
      total,
      active: items.filter((m: any) => m.status === "active").length,
      resolved: items.filter((m: any) => m.status?.startsWith("resolved")).length,
    },
  };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// GET /api/markets/:id — single market detail
markets.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("markets:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM markets WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) return c.json({ error: "Market not found" }, 404);

  // Also fetch any poly discussions referencing this market
  const pdResult = await db.execute({
    sql: "SELECT * FROM poly_discussions WHERE market_id = ? ORDER BY updated_at DESC",
    args: [id],
  });

  const market = parseMarketRow(result.rows[0]);
  const relatedDiscussions = pdResult.rows.map((row: any) => ({
    ...row,
    tags: safeJsonParse(row.tags, []),
    participants: safeJsonParse(row.participants, []),
  }));

  const body = { data: { ...market, related_discussions: relatedDiscussions } };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// POST /api/markets — create or update a market (requires auth)
markets.post("/", rateLimiters.write(), agentAuth, async (c) => {
  const parsed = await validateBody(c, createMarketSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const db = getDb();
  const id = body.id || `pm-${Date.now()}`;
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT OR REPLACE INTO markets (id, title, slug, category, status, resolution_date, outcome, yes_price, volume_usd, liquidity_usd, created_date, description, resolution_source, tags, price_history, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, body.title, body.slug || "",
      body.category || "conflict",
      body.status || "active",
      body.resolution_date || null,
      body.outcome || null,
      body.yes_price || 0.5,
      body.volume_usd || 0,
      body.liquidity_usd || 0,
      body.created_date || now,
      body.description || "",
      body.resolution_source || "",
      JSON.stringify(body.tags || []),
      JSON.stringify(body.price_history || []),
      now,
    ],
  });

  await getCache().invalidatePattern("markets:*");
  return c.json({ success: true, id }, 201);
});

export default markets;
