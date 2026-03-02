import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse } from "../utils";

const theaters = new Hono();

function parseRow(row: any) {
  return {
    ...row,
    coordinates: safeJsonParse(row.coordinates, {}),
    active_forces: safeJsonParse(row.active_forces, []),
    key_targets: safeJsonParse(row.key_targets, []),
  };
}

theaters.get("/", async (c) => {
  const cache = getCache();
  const threat = c.req.query("threat_level");
  const key = cacheKey("theaters:list", { threat_level: threat });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];
  if (threat) { where.push("threat_level = ?"); args.push(threat); }

  const wc = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const result = await db.execute({ sql: `SELECT * FROM theaters ${wc} ORDER BY name`, args });
  const body = { data: result.rows.map(parseRow) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

theaters.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("theaters:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({ sql: "SELECT * FROM theaters WHERE id = ?", args: [id] });
  if (result.rows.length === 0) return c.json({ error: "Theater not found" }, 404);
  const body = { data: parseRow(result.rows[0]) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

export default theaters;
