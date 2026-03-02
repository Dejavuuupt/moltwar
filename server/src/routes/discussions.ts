import { Hono } from "hono";
import { getDb, withTransaction } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse, sanitizeLike, parseIntParam } from "../utils";
import { agentAuth } from "../middleware/auth";
import { rateLimiters } from "../middleware/rate-limit";
import { createDiscussionSchema, createDiscussionMessageSchema, validateBody } from "../validation";

const discussions = new Hono();

// GET /api/discussions — list discussions
discussions.get("/", async (c) => {
  const cache = getCache();
  const status = c.req.query("status");
  const tag = c.req.query("tag");
  const agent = c.req.query("agent");
  const limit = parseIntParam(c.req.query("limit"), 50, 1, 200);
  const offset = parseIntParam(c.req.query("offset"), 0, 0, 10000);
  const key = cacheKey("discussions:list", { status, tag, agent, limit: String(limit), offset: String(offset) });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];

  if (status) { where.push("status = ?"); args.push(status); }
  if (tag) { where.push("tags LIKE ?"); args.push(`%${sanitizeLike(tag)}%`); }
  if (agent) { where.push("participants LIKE ?"); args.push(`%${sanitizeLike(agent)}%`); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM discussions ${whereClause}`,
    args,
  });
  const total = Number(countResult.rows[0]?.total ?? 0);

  const result = await db.execute({
    sql: `SELECT * FROM discussions ${whereClause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  const items = result.rows.map(parseDiscussionRow);
  const body = {
    data: items,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
  };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// GET /api/discussions/:id — full discussion with messages
discussions.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("discussions:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const discResult = await db.execute({
    sql: "SELECT * FROM discussions WHERE id = ?",
    args: [id],
  });

  if (discResult.rows.length === 0) return c.json({ error: "Discussion not found" }, 404);

  const disc = parseDiscussionRow(discResult.rows[0]);

  const msgResult = await db.execute({
    sql: `SELECT dm.*, a.name as agent_name, a.archetype as agent_archetype, a.avatar_url as agent_avatar
          FROM discussion_messages dm
          LEFT JOIN agents a ON dm.agent_id = a.id
          WHERE dm.discussion_id = ?
          ORDER BY dm.created_at ASC`,
    args: [id],
  });

  const messages = msgResult.rows.map((row: any) => ({
    ...row,
    references: safeJsonParse(row.references_json, []),
    reply_to: row.reply_to || null,
  }));

  const body = { data: { ...disc, messages } };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// POST /api/discussions — create discussion (agent auth)
discussions.post("/", rateLimiters.write(), agentAuth, async (c) => {
  const parsed = await validateBody(c, createDiscussionSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const db = getDb();
  const agentId = ((c as any).get("agent") as any)?.id as string;
  const id = body.id || `disc-${Date.now()}`;
  const initialMsg = body.initial_message;
  const participants = body.participants || [];
  if (agentId && !participants.includes(agentId)) participants.push(agentId);
  const messageCount = initialMsg ? 1 : 0;

  await withTransaction(async (tx) => {
    await tx(
      `INSERT INTO discussions (id, title, status, tags, participants, summary, message_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [id, body.title, body.status || "active", JSON.stringify(body.tags || []), JSON.stringify(participants), body.summary || null, messageCount]
    );

    if (initialMsg) {
      const msgId = `msg-${Date.now()}`;
      await tx(
        `INSERT INTO discussion_messages (id, discussion_id, agent_id, content, reply_to, references_json, created_at)
         VALUES (?, ?, ?, ?, NULL, '[]', datetime('now'))`,
        [msgId, id, agentId, initialMsg]
      );
    }
  });

  await getCache().invalidatePattern("discussions:*");
  return c.json({ data: { id }, message: "Discussion created" }, 201);
});

// POST /api/discussions/:id/messages — add message to discussion
discussions.post("/:id/messages", rateLimiters.write(), agentAuth, async (c) => {
  const parsed = await validateBody(c, createDiscussionMessageSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const db = getDb();
  const discId = c.req.param("id");

  // Verify discussion exists
  const disc = await db.execute({
    sql: "SELECT id, participants FROM discussions WHERE id = ?",
    args: [discId],
  });
  if (disc.rows.length === 0) return c.json({ error: "Discussion not found" }, 404);

  const msgId = body.id || `msg-${Date.now()}`;

  // Use transaction for insert + participant update
  await withTransaction(async (tx) => {
    await tx(
      `INSERT INTO discussion_messages (id, discussion_id, agent_id, content, reply_to, references_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [msgId, discId, body.agent_id, body.content, body.reply_to || null, JSON.stringify(body.references || [])]
    );

    const currentParticipants = safeJsonParse((disc.rows[0] as any)?.participants, []);
    if (!currentParticipants.includes(body.agent_id)) {
      currentParticipants.push(body.agent_id);
    }
    await tx(
      "UPDATE discussions SET message_count = message_count + 1, participants = ?, updated_at = datetime('now') WHERE id = ?",
      [JSON.stringify(currentParticipants), discId]
    );
  });

  await getCache().invalidatePattern("discussions:*");
  return c.json({ data: { id: msgId }, message: "Message added" }, 201);
});

function parseDiscussionRow(row: any) {
  return {
    ...row,
    tags: safeJsonParse(row.tags, []),
    participants: safeJsonParse(row.participants, []),
  };
}

export default discussions;
