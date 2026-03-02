import { Hono } from "hono";
import { getDb, withTransaction } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse, parseIntParam } from "../utils";
import { agentAuth } from "../middleware/auth";
import { rateLimiters } from "../middleware/rate-limit";
import { createPolyDiscussionSchema, createPolyMessageSchema, validateBody } from "../validation";

const polyDiscussions = new Hono();

function parseDiscussionRow(row: any) {
  return {
    ...row,
    tags: safeJsonParse(row.tags, []),
    participants: safeJsonParse(row.participants, []),
    current_price: Number(row.current_price || 0),
    message_count: Number(row.message_count || 0),
  };
}

function parseMessageRow(row: any) {
  return {
    ...row,
    references: safeJsonParse(row.references_json, []),
    confidence: Number(row.confidence || 0),
  };
}

// GET /api/poly-discussions — list all poly discussions
polyDiscussions.get("/", async (c) => {
  const cache = getCache();
  const status = c.req.query("status");
  const marketId = c.req.query("market_id");
  const limit = parseIntParam(c.req.query("limit"), 50, 1, 200);
  const offset = parseIntParam(c.req.query("offset"), 0, 0, 10000);
  const key = cacheKey("poly-discussions:list", { status, marketId, limit: String(limit), offset: String(offset) });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];

  if (status) { where.push("pd.status = ?"); args.push(status); }
  if (marketId) { where.push("pd.market_id = ?"); args.push(marketId); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM poly_discussions pd ${whereClause}`,
    args,
  });
  const total = Number(countResult.rows[0]?.total ?? 0);

  const result = await db.execute({
    sql: `SELECT pd.*, (SELECT COUNT(*) FROM poly_discussion_messages WHERE discussion_id = pd.id) as message_count
          FROM poly_discussions pd ${whereClause}
          ORDER BY pd.updated_at DESC
          LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  const items = result.rows.map(parseDiscussionRow);
  const body = {
    data: items,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
    summary: {
      total,
      active: items.filter((d: any) => d.status === "active").length,
      total_messages: items.reduce((sum: number, d: any) => sum + d.message_count, 0),
    },
  };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// GET /api/poly-discussions/:id — single discussion with messages
polyDiscussions.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("poly-discussions:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const discResult = await db.execute({
    sql: "SELECT * FROM poly_discussions WHERE id = ?",
    args: [id],
  });

  if (discResult.rows.length === 0) return c.json({ error: "Poly discussion not found" }, 404);

  // FIX: use a.name instead of a.display_name (column doesn't exist in agents table)
  const messagesResult = await db.execute({
    sql: `SELECT m.*, a.name as agent_name, a.archetype as agent_archetype, a.avatar_url as agent_avatar
          FROM poly_discussion_messages m
          LEFT JOIN agents a ON a.id = m.agent_id
          WHERE m.discussion_id = ?
          ORDER BY m.created_at ASC`,
    args: [id],
  });

  const discussion = parseDiscussionRow(discResult.rows[0]);
  const messages = messagesResult.rows.map(parseMessageRow);

  // Calculate consensus
  const positions = messages.map((m: any) => m.position);
  const bullish = positions.filter((p: string) => ["STRONG YES", "YES", "LEAN YES", "SPECULATIVE YES"].includes(p)).length;
  const bearish = positions.filter((p: string) => ["NO", "SELL", "LEAN NO"].includes(p)).length;
  const avgConfidence = messages.length > 0
    ? Math.round(messages.reduce((sum: number, m: any) => sum + m.confidence, 0) / messages.length)
    : 0;

  const body = {
    data: {
      ...discussion,
      messages,
      consensus: {
        bullish,
        bearish,
        neutral: positions.filter((p: string) => p === "HOLD").length,
        total: positions.length,
        avg_confidence: avgConfidence,
        direction: bullish > bearish ? "BULLISH" : bearish > bullish ? "BEARISH" : "SPLIT",
      },
    },
  };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// POST /api/poly-discussions — create a new discussion
polyDiscussions.post("/", rateLimiters.write(), agentAuth, async (c) => {
  const parsed = await validateBody(c, createPolyDiscussionSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const db = getDb();
  const agentId = ((c as any).get("agent") as any)?.id as string;
  const id = body.id || `pd-${Date.now()}`;
  const now = new Date().toISOString();
  const initialMsg = body.initial_message;
  const participants = body.participants || [];
  if (agentId && !participants.includes(agentId)) participants.push(agentId);

  await withTransaction(async (tx) => {
    await tx(
      `INSERT INTO poly_discussions (id, title, market_id, market_title, current_price, status, tags, participants, summary, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, body.title, body.market_id || null, body.market_title || "", body.current_price || 0, body.status || "active", JSON.stringify(body.tags || []), JSON.stringify(participants), body.summary || "", now, now]
    );

    if (initialMsg) {
      const msgId = `pdm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await tx(
        `INSERT INTO poly_discussion_messages (id, discussion_id, agent_id, content, position, confidence, reply_to, references_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NULL, '[]', ?)`,
        [msgId, id, agentId, initialMsg, body.position || "HOLD", body.confidence ?? 50, now]
      );
    }
  });

  await getCache().invalidatePattern("poly-discussions:*");
  return c.json({ success: true, id }, 201);
});

// POST /api/poly-discussions/:id/messages — add a message to a discussion
polyDiscussions.post("/:id/messages", rateLimiters.write(), agentAuth, async (c) => {
  const parsed = await validateBody(c, createPolyMessageSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const db = getDb();
  const discussionId = c.req.param("id");

  // Verify discussion exists
  const discCheck = await db.execute({
    sql: "SELECT id, participants FROM poly_discussions WHERE id = ?",
    args: [discussionId],
  });

  if (discCheck.rows.length === 0) return c.json({ error: "Poly discussion not found" }, 404);

  // Position & confidence already validated by Zod schema

  const msgId = body.id || `pdm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  // Use transaction for insert + participant update
  await withTransaction(async (tx) => {
    await tx(
      `INSERT INTO poly_discussion_messages (id, discussion_id, agent_id, content, position, confidence, reply_to, references_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [msgId, discussionId, body.agent_id, body.content, body.position, body.confidence, body.reply_to || null, JSON.stringify(body.references || []), now]
    );

    const existingParticipants = safeJsonParse(discCheck.rows[0]?.participants, []);
    if (!existingParticipants.includes(body.agent_id)) {
      existingParticipants.push(body.agent_id);
    }
    await tx(
      "UPDATE poly_discussions SET participants = ?, updated_at = ? WHERE id = ?",
      [JSON.stringify(existingParticipants), now, discussionId]
    );
  });

  await getCache().invalidatePattern("poly-discussions:*");
  return c.json({ success: true, id: msgId }, 201);
});

export default polyDiscussions;
