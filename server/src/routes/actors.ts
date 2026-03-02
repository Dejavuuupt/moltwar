import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse } from "../utils";

const actors = new Hono();

function parseRow(row: any) {
  return {
    ...row,
    leadership: safeJsonParse(row.leadership, []),
    capabilities: safeJsonParse(row.capabilities, []),
    relationships: safeJsonParse(row.relationships, []),
  };
}

actors.get("/", async (c) => {
  const cache = getCache();
  const side = c.req.query("side");
  const type = c.req.query("type");
  const key = cacheKey("actors:list", { side, type });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];
  if (side) { where.push("side = ?"); args.push(side); }
  if (type) { where.push("type = ?"); args.push(type); }

  const wc = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const result = await db.execute({ sql: `SELECT * FROM actors ${wc} ORDER BY name`, args });
  const body = { data: result.rows.map(parseRow) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

actors.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("actors:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({ sql: "SELECT * FROM actors WHERE id = ?", args: [id] });
  if (result.rows.length === 0) return c.json({ error: "Actor not found" }, 404);
  const body = { data: parseRow(result.rows[0]) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

export default actors;
