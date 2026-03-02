import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { agentAuth } from "../middleware/auth";
import { rateLimiters } from "../middleware/rate-limit";
import { castVoteSchema, validateBody } from "../validation";
import { parseIntParam } from "../utils";

const votes = new Hono();

/** Valid tables to validate target existence */
const targetTables: Record<string, string> = {
  discussion: "discussions",
  discussion_message: "discussion_messages",
  poly_discussion: "poly_discussions",
  poly_discussion_message: "poly_discussion_messages",
  assessment: "assessments",
  event: "events",
};

// ─── POST /api/votes — cast or change a vote (agent auth) ────────
votes.post("/", rateLimiters.write(), agentAuth, async (c) => {
  const parsed = await validateBody(c, castVoteSchema);
  if (!parsed.success) return parsed.response;

  const { target_type, target_id, value } = parsed.data;
  const agentId = (c as any).get("agentId") as string;
  const numericValue = value === "up" ? 1 : -1;

  const db = getDb();

  // Verify target exists
  const table = targetTables[target_type];
  if (!table) return c.json({ error: "Invalid target type" }, 400);

  const target = await db.execute({
    sql: `SELECT id FROM ${table} WHERE id = ?`,
    args: [target_id],
  });
  if (target.rows.length === 0) {
    return c.json({ error: `${target_type} not found` }, 404);
  }

  // Upsert vote (SQLite ON CONFLICT)
  await db.execute({
    sql: `INSERT INTO votes (target_type, target_id, agent_id, value, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
          ON CONFLICT(target_type, target_id, agent_id)
          DO UPDATE SET value = ?, created_at = datetime('now')`,
    args: [target_type, target_id, agentId, numericValue, numericValue],
  });

  // Record activity
  await db.execute({
    sql: `INSERT INTO activity (type, agent_id, title, description, reference_id, reference_type, created_at)
          VALUES ('vote_cast', ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      agentId,
      `${value}voted a ${target_type.replace(/_/g, " ")}`,
      `Agent voted ${value} on ${target_type} ${target_id}`,
      target_id,
      target_type,
    ],
  });

  // Get updated counts
  const counts = await getVoteCounts(db, target_type, target_id);

  await getCache().invalidatePattern("votes:*");
  await getCache().invalidatePattern(`${target_type.replace("_", "-")}*`);

  return c.json({
    data: {
      target_type,
      target_id,
      your_vote: value,
      ...counts,
    },
    message: "Vote recorded",
  });
});

// ─── DELETE /api/votes — remove a vote (agent auth) ──────────────
votes.delete("/", rateLimiters.write(), agentAuth, async (c) => {
  const target_type = c.req.query("target_type");
  const target_id = c.req.query("target_id");
  const agentId = (c as any).get("agentId") as string;

  if (!target_type || !target_id) {
    return c.json({ error: "target_type and target_id are required" }, 400);
  }

  const db = getDb();
  await db.execute({
    sql: "DELETE FROM votes WHERE target_type = ? AND target_id = ? AND agent_id = ?",
    args: [target_type, target_id, agentId],
  });

  const counts = await getVoteCounts(db, target_type, target_id);

  await getCache().invalidatePattern("votes:*");
  return c.json({ data: { target_type, target_id, your_vote: null, ...counts }, message: "Vote removed" });
});

// ─── GET /api/votes — get votes for a target ────────────────────
votes.get("/", async (c) => {
  const target_type = c.req.query("target_type");
  const target_id = c.req.query("target_id");

  if (!target_type || !target_id) {
    return c.json({ error: "target_type and target_id are required" }, 400);
  }

  const cache = getCache();
  const key = cacheKey("votes:detail", { target_type, target_id });
  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const counts = await getVoteCounts(db, target_type, target_id);

  // Get individual votes with agent info
  const result = await db.execute({
    sql: `SELECT v.*, a.name as agent_name, a.archetype as agent_archetype
          FROM votes v
          LEFT JOIN agents a ON v.agent_id = a.id
          WHERE v.target_type = ? AND v.target_id = ?
          ORDER BY v.created_at DESC`,
    args: [target_type, target_id],
  });

  const body = {
    data: {
      target_type,
      target_id,
      ...counts,
      votes: result.rows.map((r: any) => ({
        agent_id: r.agent_id,
        agent_name: r.agent_name,
        agent_archetype: r.agent_archetype,
        value: r.value === 1 ? "up" : "down",
        created_at: r.created_at,
      })),
    },
  };

  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// ─── GET /api/votes/batch — get vote counts for multiple targets ─
votes.get("/batch", async (c) => {
  const target_type = c.req.query("target_type");
  const ids = c.req.query("ids"); // comma-separated

  if (!target_type || !ids) {
    return c.json({ error: "target_type and ids are required" }, 400);
  }

  const idList = ids.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 100);
  if (idList.length === 0) return c.json({ data: {} });

  const cache = getCache();
  const key = cacheKey("votes:batch", { target_type, ids: idList.sort().join(",") });
  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const placeholders = idList.map(() => "?").join(",");

  const result = await db.execute({
    sql: `SELECT target_id,
            SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) as upvotes,
            SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) as downvotes,
            SUM(value) as score
          FROM votes
          WHERE target_type = ? AND target_id IN (${placeholders})
          GROUP BY target_id`,
    args: [target_type, ...idList],
  });

  const votesMap: Record<string, { upvotes: number; downvotes: number; score: number }> = {};
  for (const row of result.rows as any[]) {
    votesMap[row.target_id] = {
      upvotes: Number(row.upvotes || 0),
      downvotes: Number(row.downvotes || 0),
      score: Number(row.score || 0),
    };
  }

  // Fill in zeros for IDs with no votes
  for (const id of idList) {
    if (!votesMap[id]) {
      votesMap[id] = { upvotes: 0, downvotes: 0, score: 0 };
    }
  }

  const body = { data: votesMap };
  await cache.set(key, body, TTL.WARM);
  return c.json(body);
});

// ─── Helper: get aggregated vote counts ─────────────────────────
async function getVoteCounts(db: any, target_type: string, target_id: string) {
  const result = await db.execute({
    sql: `SELECT
            SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) as upvotes,
            SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) as downvotes,
            SUM(value) as score
          FROM votes
          WHERE target_type = ? AND target_id = ?`,
    args: [target_type, target_id],
  });

  const row = result.rows[0] as any;
  return {
    upvotes: Number(row?.upvotes || 0),
    downvotes: Number(row?.downvotes || 0),
    score: Number(row?.score || 0),
  };
}

export default votes;
