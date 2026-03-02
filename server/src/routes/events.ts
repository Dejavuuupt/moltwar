import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse, sanitizeLike, parseIntParam } from "../utils";
import { agentAuth } from "../middleware/auth";
import { rateLimiters } from "../middleware/rate-limit";
import { createEventSchema, validateBody } from "../validation";

const events = new Hono();

// GET /api/events — list events with filtering
events.get("/", async (c) => {
  const cache = getCache();
  const theater = c.req.query("theater");
  const type = c.req.query("type");
  const threat = c.req.query("threat_level");
  const tag = c.req.query("tag");
  const limit = parseIntParam(c.req.query("limit"), 50, 1, 200);
  const offset = parseIntParam(c.req.query("offset"), 0, 0, 10000);
  const sort = c.req.query("sort") || "date";
  const order = c.req.query("order") || "desc";
  const key = cacheKey("events:list", { theater, type, threat, tag, limit: String(limit), offset: String(offset), sort, order });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];

  if (theater) { where.push("theater_id = ?"); args.push(theater); }
  if (type) { where.push("type = ?"); args.push(type); }
  if (threat) { where.push("threat_level = ?"); args.push(threat); }
  if (tag) { where.push("tags LIKE ?"); args.push(`%${sanitizeLike(tag)}%`); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const validSorts = ["date", "severity", "created_at"];
  const sortCol = validSorts.includes(sort) ? sort : "date";
  const sortOrder = order === "asc" ? "ASC" : "DESC";

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM events ${whereClause}`,
    args,
  });
  const total = Number(countResult.rows[0]?.total ?? 0);

  const result = await db.execute({
    sql: `SELECT * FROM events ${whereClause} ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  const items = result.rows.map(parseEventRow);
  const body = {
    data: items,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
  };
  await cache.set(key, body, TTL.HOT);
  return c.json(body);
});

// GET /api/events/:id — single event
events.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("events:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM events WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) return c.json({ error: "Event not found" }, 404);
  const body = { data: parseEventRow(result.rows[0]) };
  await cache.set(key, body, TTL.HOT);
  return c.json(body);
});

// POST /api/events — create event (agent auth required)
events.post("/", rateLimiters.write(), agentAuth, async (c) => {
  const parsed = await validateBody(c, createEventSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const db = getDb();
  const id = body.id || `evt-${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO events (id, title, type, date, theater_id, location_lat, location_lng, location_name, severity, threat_level, description, sources, tags, actors, verified, fatalities, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, body.title, body.type || "military_action",
      body.date || new Date().toISOString(),
      body.theater_id || null,
      body.location?.lat ?? null, body.location?.lng ?? null,
      body.location?.name ?? null,
      body.severity || 5, body.threat_level || "moderate",
      body.description || null,
      JSON.stringify(body.sources || []),
      JSON.stringify(body.tags || []),
      JSON.stringify(body.actors || []),
      body.verified ? 1 : 0, body.fatalities || 0,
      body.image_url || null,
    ],
  });

  // Invalidate events cache
  await getCache().invalidatePattern("events:*");

  return c.json({ data: { id }, message: "Event created" }, 201);
});

function parseEventRow(row: any) {
  return {
    ...row,
    sources: safeJsonParse(row.sources, []),
    tags: safeJsonParse(row.tags, []),
    actors: safeJsonParse(row.actors, []),
    verified: Boolean(row.verified),
    location: row.location_lat
      ? { lat: row.location_lat, lng: row.location_lng, name: row.location_name }
      : null,
  };
}

export default events;
