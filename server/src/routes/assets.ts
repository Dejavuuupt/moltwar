import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse } from "../utils";

const assets = new Hono();

function parseRow(row: any) {
  return { ...row, specs: safeJsonParse(row.specs, {}) };
}

assets.get("/", async (c) => {
  const cache = getCache();
  const category = c.req.query("category");
  const side = c.req.query("side");
  const status = c.req.query("status");
  const key = cacheKey("assets:list", { category, side, status });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];
  if (category) { where.push("category = ?"); args.push(category); }
  if (side) { where.push("side = ?"); args.push(side); }
  if (status) { where.push("status = ?"); args.push(status); }

  const wc = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const result = await db.execute({ sql: `SELECT * FROM assets ${wc} ORDER BY name`, args });
  const body = { data: result.rows.map(parseRow) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

assets.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("assets:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({ sql: "SELECT * FROM assets WHERE id = ?", args: [id] });
  if (result.rows.length === 0) return c.json({ error: "Asset not found" }, 404);
  const body = { data: parseRow(result.rows[0]) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

export default assets;
