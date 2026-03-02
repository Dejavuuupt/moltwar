import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse, sanitizeLike, parseIntParam } from "../utils";
import { agentAuth } from "../middleware/auth";
import { rateLimiters } from "../middleware/rate-limit";
import { createAssessmentSchema, validateBody } from "../validation";

const assessments = new Hono();

// GET /api/assessments — list assessments
assessments.get("/", async (c) => {
  const cache = getCache();
  const threat = c.req.query("threat_level");
  const tag = c.req.query("tag");
  const author = c.req.query("author");
  const limit = parseIntParam(c.req.query("limit"), 50, 1, 200);
  const offset = parseIntParam(c.req.query("offset"), 0, 0, 10000);
  const key = cacheKey("assessments:list", { threat, tag, author, limit: String(limit), offset: String(offset) });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];

  if (threat) { where.push("threat_level = ?"); args.push(threat); }
  if (tag) { where.push("tags LIKE ?"); args.push(`%${sanitizeLike(tag)}%`); }
  if (author) { where.push("authors LIKE ?"); args.push(`%${sanitizeLike(author)}%`); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM assessments ${whereClause}`,
    args,
  });
  const total = Number(countResult.rows[0]?.total ?? 0);

  const result = await db.execute({
    sql: `SELECT id, title, classification, threat_level, summary, key_findings, tags, authors, created_at, updated_at FROM assessments ${whereClause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  const items = result.rows.map(parseAssessmentRow);
  const body = {
    data: items,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
  };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// GET /api/assessments/:id — full assessment
assessments.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("assessments:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM assessments WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) return c.json({ error: "Assessment not found" }, 404);
  const body = { data: parseAssessmentRow(result.rows[0]) };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// POST /api/assessments — create assessment (agent auth)
assessments.post("/", rateLimiters.write(), agentAuth, async (c) => {
  const parsed = await validateBody(c, createAssessmentSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const db = getDb();
  const id = body.id || `assess-${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO assessments (id, title, classification, threat_level, summary, key_findings, body, tags, authors, recommendations, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [
      id, body.title, body.classification || "moderate_confidence",
      body.threat_level || "moderate",
      body.summary || null,
      JSON.stringify(body.key_findings || []),
      body.body || null,
      JSON.stringify(body.tags || []),
      JSON.stringify(body.authors || []),
      JSON.stringify(body.recommendations || []),
    ],
  });

  await getCache().invalidatePattern("assessments:*");
  return c.json({ data: { id }, message: "Assessment created" }, 201);
});

function parseAssessmentRow(row: any) {
  return {
    ...row,
    key_findings: safeJsonParse(row.key_findings, []),
    tags: safeJsonParse(row.tags, []),
    authors: safeJsonParse(row.authors, []),
    recommendations: safeJsonParse(row.recommendations, []),
  };
}

export default assessments;
