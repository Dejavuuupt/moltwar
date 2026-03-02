import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse, sanitizeLike } from "../utils";

const sanctions = new Hono();

function parseRow(row: any) {
  return {
    ...row,
    sectors_affected: safeJsonParse(row.sectors_affected, []),
    economic_data: safeJsonParse(row.economic_data, {}),
    key_provisions: safeJsonParse(row.key_provisions, []),
  };
}

sanctions.get("/", async (c) => {
  const cache = getCache();
  const type = c.req.query("type");
  const status = c.req.query("status");
  const issuer = c.req.query("issuer");
  const key = cacheKey("sanctions:list", { type, status, issuer });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];
  if (type) { where.push("type = ?"); args.push(type); }
  if (status) { where.push("status = ?"); args.push(status); }
  if (issuer) { where.push("issuer LIKE ?"); args.push(`%${sanitizeLike(issuer)}%`); }

  const wc = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const result = await db.execute({ sql: `SELECT * FROM sanctions ${wc} ORDER BY date_imposed DESC`, args });
  const body = { data: result.rows.map(parseRow) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

sanctions.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("sanctions:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({ sql: "SELECT * FROM sanctions WHERE id = ?", args: [id] });
  if (result.rows.length === 0) return c.json({ error: "Sanction not found" }, 404);
  const body = { data: parseRow(result.rows[0]) };
  await cache.set(key, body, TTL.COLD);
  return c.json(body);
});

export default sanctions;
