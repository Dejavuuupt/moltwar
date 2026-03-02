import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse } from "../utils";

const timeline = new Hono();

function parseRow(row: any) {
  return {
    ...row,
    actors: safeJsonParse(row.actors, []),
    tags: safeJsonParse(row.tags, []),
  };
}

timeline.get("/", async (c) => {
  const cache = getCache();
  const category = c.req.query("category");
  const significance = c.req.query("significance");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const key = cacheKey("timeline:list", { category, significance, from, to });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];
  if (category) { where.push("category = ?"); args.push(category); }
  if (significance) { where.push("significance = ?"); args.push(significance); }
  if (from) { where.push("date >= ?"); args.push(from); }
  if (to) { where.push("date <= ?"); args.push(to); }

  const wc = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const result = await db.execute({ sql: `SELECT * FROM timeline ${wc} ORDER BY date ASC`, args });
  const body = { data: result.rows.map(parseRow) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

timeline.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("timeline:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({ sql: "SELECT * FROM timeline WHERE id = ?", args: [id] });
  if (result.rows.length === 0) return c.json({ error: "Timeline entry not found" }, 404);
  const body = { data: parseRow(result.rows[0]) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

export default timeline;
