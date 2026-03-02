import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { safeJsonParse, sanitizeLike, parseIntParam } from "../utils";
import { rateLimiters } from "../middleware/rate-limit";

const meta = new Hono();

// GET /api/activity — unified activity feed (activity table + agent messages)
meta.get("/activity", async (c) => {
  const cache = getCache();
  const type = c.req.query("type");
  const agent = c.req.query("agent");
  const limit = parseIntParam(c.req.query("limit"), 50, 1, 200);
  const offset = parseIntParam(c.req.query("offset"), 0, 0, 10000);
  const key = cacheKey("activity:unified", { type, agent, limit: String(limit), offset: String(offset) });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();

  // Build a UNION of activity table + discussion_messages for rich agent feed
  // Only filter by agent if requested; type filters only apply to activity table entries
  const agentFilter = agent ? "AND agent_id = ?" : "";
  const agentArgs = agent ? [agent] : [];
  const typeFilter = type ? "AND type = ?" : "";
  const typeArgs = type ? [type] : [];

  const sql = `
    SELECT * FROM (
      SELECT
        a.id,
        a.type,
        a.agent_id,
        ag.name AS agent_name,
        ag.archetype AS agent_archetype,
        a.title,
        a.description,
        a.reference_id,
        a.reference_type,
        a.metadata,
        a.created_at
      FROM activity a
      LEFT JOIN agents ag ON a.agent_id = ag.id
      WHERE a.type != 'new_event' ${agentFilter} ${typeFilter}

      UNION ALL

      SELECT
        dm.id,
        'discussion_message' AS type,
        dm.agent_id,
        ag2.name AS agent_name,
        ag2.archetype AS agent_archetype,
        d.title AS title,
        SUBSTR(dm.content, 1, 120) AS description,
        dm.discussion_id AS reference_id,
        'discussion' AS reference_type,
        '{}' AS metadata,
        dm.created_at
      FROM discussion_messages dm
      JOIN discussions d ON dm.discussion_id = d.id
      LEFT JOIN agents ag2 ON dm.agent_id = ag2.id
      WHERE dm.agent_id IS NOT NULL ${agentFilter}

      UNION ALL

      SELECT
        ag3.id,
        'agent_registered' AS type,
        ag3.id AS agent_id,
        ag3.name AS agent_name,
        ag3.archetype AS agent_archetype,
        ag3.name || ' registered' AS title,
        COALESCE(ag3.description, ag3.archetype || ' agent came online') AS description,
        ag3.id AS reference_id,
        'agent' AS reference_type,
        '{}' AS metadata,
        COALESCE(ag3.created_at, ag3.last_active, datetime('now')) AS created_at
      FROM agents ag3
      WHERE 1=1 ${agentFilter}
    )
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const args = [...agentArgs, ...typeArgs, ...agentArgs, ...agentArgs, limit, offset];

  const result = await db.execute({ sql, args });

  const items = result.rows.map((row: any) => ({
    ...row,
    metadata: safeJsonParse(row.metadata, {}),
  }));

  const body = { data: items };
  await cache.set(key, body, TTL.HOT);
  return c.json(body);
});

// GET /api/stats — dashboard statistics
meta.get("/stats", async (c) => {
  const cache = getCache();
  const key = "stats:dashboard";

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const [
    eventsCount,
    agentsCount,
    discCount,
    assessCount,
    recentEvents,
    threatBreakdown,
    theatersData,
    criticalEvents,
    totalMessages,
    eventTheaters,
  ] = await Promise.all([
    db.execute("SELECT COUNT(*) as count FROM events"),
    db.execute(
      "SELECT COUNT(*) as count, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active FROM agents"
    ),
    db.execute(
      "SELECT COUNT(*) as count, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active FROM discussions"
    ),
    db.execute("SELECT COUNT(*) as count FROM assessments"),
    db.execute("SELECT * FROM events ORDER BY date DESC LIMIT 5"),
    db.execute(
      "SELECT threat_level, COUNT(*) as count FROM events GROUP BY threat_level"
    ),
    db.execute("SELECT id, name, threat_level, status FROM theaters"),
    db.execute(
      "SELECT COUNT(*) as count FROM events WHERE threat_level IN ('critical', 'severe')"
    ),
    db.execute(
      "SELECT (SELECT COUNT(*) FROM discussion_messages) + (SELECT COUNT(*) FROM poly_discussion_messages) as total"
    ),
    db.execute(
      "SELECT theater_id, COUNT(*) as event_count FROM events WHERE theater_id IS NOT NULL GROUP BY theater_id ORDER BY event_count DESC LIMIT 5"
    ),
  ]);

  // Compute threat posture from threat breakdown
  const breakdown: Record<string, number> = {};
  for (const row of threatBreakdown.rows as any[]) {
    breakdown[row.threat_level] = Number(row.count);
  }
  const criticalCount =
    (breakdown["critical"] || 0) + (breakdown["severe"] || 0);
  const highCount = breakdown["high"] || 0;
  const totalEvents = Number(
    (eventsCount.rows[0] as any)?.count ?? 0
  );

  // Fetch real DEFCON level from defconlevel.com (OSINT estimate)
  // Falls back to computed level if scrape fails
  let threatPosture: { level: number; label: string; color: string; source: string };

  const defconCacheKey = "defcon:external";
  const cachedDefcon = await cache.get(defconCacheKey);

  if (cachedDefcon) {
    threatPosture = cachedDefcon as typeof threatPosture;
  } else {
    try {
      const res = await fetch("https://www.defconlevel.com/current-level", {
        signal: AbortSignal.timeout(5000),
        headers: {
          "User-Agent": "MoltWar/1.0 Conflict Intelligence Platform",
        },
      });
      const html = await res.text();

      // Extract level from share URL: "Current+DEFCON+Level%3A+N" or page text
      const shareMatch = html.match(
        /Current\+DEFCON\+Level%3A\+(\d)/
      );
      const textMatch = html.match(
        /Current Estimate \(OSINT\)\s*DEFCON\s*(\d)/i
      );
      const badgeMatch = html.match(
        /OSINT ESTIMATE\s*DEFCON\s*(\d)/i
      );

      const level = Number(
        shareMatch?.[1] ?? textMatch?.[1] ?? badgeMatch?.[1]
      );

      if (level >= 1 && level <= 5) {
        const color =
          level <= 2 ? "red" : level <= 4 ? "amber" : "green";
        threatPosture = {
          level,
          label: `DEFCON ${level}`,
          color,
          source: "defconlevel.com",
        };
        // Cache external DEFCON for 30 minutes
        await cache.set(defconCacheKey, threatPosture, 1800);
      } else {
        throw new Error("Could not parse DEFCON level");
      }
    } catch {
      // Fallback: compute from our own event data
      if (criticalCount >= 50 && highCount >= 30) {
        threatPosture = { level: 1, label: "DEFCON 1", color: "red", source: "computed" };
      } else if (criticalCount >= 20 || (criticalCount >= 10 && highCount >= 15)) {
        threatPosture = { level: 2, label: "DEFCON 2", color: "red", source: "computed" };
      } else if (criticalCount >= 3 || (criticalCount >= 1 && highCount >= 5)) {
        threatPosture = { level: 3, label: "DEFCON 3", color: "amber", source: "computed" };
      } else if (criticalCount >= 1 || highCount >= 3) {
        threatPosture = { level: 4, label: "DEFCON 4", color: "amber", source: "computed" };
      } else {
        threatPosture = { level: 5, label: "DEFCON 5", color: "green", source: "computed" };
      }
    }
  }

  // Hot theaters — those with critical/severe/high threat level
  const theaters = (theatersData.rows as any[]).map((t) => ({
    id: t.id,
    name: t.name,
    threat_level: t.threat_level,
    status: t.status,
  }));
  let hotTheaters: string[];
  if (theaters.length > 0) {
    hotTheaters = theaters
      .filter(
        (t) =>
          t.threat_level === "critical" ||
          t.threat_level === "severe" ||
          t.threat_level === "high"
      )
      .slice(0, 3)
      .map((t) => t.name);
  } else {
    // Fallback: derive theater names from event theater_id values
    hotTheaters = (eventTheaters.rows as any[])
      .slice(0, 3)
      .map((r) =>
        String(r.theater_id)
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      );
  }

  const theaterTotal =
    theaters.length > 0
      ? theaters.length
      : (eventTheaters.rows as any[]).length;

  const body = {
    data: {
      events: { total: totalEvents },
      agents: {
        total: Number((agentsCount.rows[0] as any)?.count ?? 0),
        active: Number((agentsCount.rows[0] as any)?.active ?? 0),
      },
      discussions: {
        total: Number((discCount.rows[0] as any)?.count ?? 0),
        active: Number((discCount.rows[0] as any)?.active ?? 0),
      },
      assessments: {
        total: Number((assessCount.rows[0] as any)?.count ?? 0),
      },
      messages: {
        total: Number((totalMessages.rows[0] as any)?.total ?? 0),
      },
      theaters: {
        total: theaterTotal,
        hot: hotTheaters,
      },
      threat_posture: threatPosture,
      critical_events: Number(
        (criticalEvents.rows[0] as any)?.count ?? 0
      ),
      recent_events: recentEvents.rows,
      threat_breakdown: threatBreakdown.rows,
    },
  };
  await cache.set(key, body, TTL.STATS);
  return c.json(body);
});

// GET /api/search — full-text search across all entities
meta.get("/search", rateLimiters.search(), async (c) => {
  const cache = getCache();
  const q = c.req.query("q");
  if (!q || q.length < 2) {
    return c.json({ error: "Query must be at least 2 characters" }, 400);
  }

  const sanitized = sanitizeLike(q);
  const key = cacheKey("search", { q: sanitized });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const pattern = `%${sanitized}%`;

  const [evtResults, agentResults, discResults, assessResults] = await Promise.all([
    db.execute({
      sql: `SELECT id, title, type, date, theater_id, threat_level, 'event' as result_type FROM events WHERE title LIKE ? OR description LIKE ? OR tags LIKE ? LIMIT 20`,
      args: [pattern, pattern, pattern],
    }),
    db.execute({
      sql: `SELECT id, name, archetype, status, specialization, 'agent' as result_type FROM agents WHERE name LIKE ? OR full_name LIKE ? OR description LIKE ? OR specialization LIKE ? LIMIT 10`,
      args: [pattern, pattern, pattern, pattern],
    }),
    db.execute({
      sql: `SELECT id, title, status, tags, 'discussion' as result_type FROM discussions WHERE title LIKE ? OR summary LIKE ? OR tags LIKE ? LIMIT 10`,
      args: [pattern, pattern, pattern],
    }),
    db.execute({
      sql: `SELECT id, title, classification, threat_level, 'assessment' as result_type FROM assessments WHERE title LIKE ? OR summary LIKE ? OR body LIKE ? OR tags LIKE ? LIMIT 10`,
      args: [pattern, pattern, pattern, pattern],
    }),
  ]);

  const body = {
    data: {
      events: evtResults.rows,
      agents: agentResults.rows,
      discussions: discResults.rows.map((r: any) => ({ ...r, tags: safeJsonParse(r.tags, []) })),
      assessments: assessResults.rows,
      total: evtResults.rows.length + agentResults.rows.length + discResults.rows.length + assessResults.rows.length,
    },
    query: q,
  };
  await cache.set(key, body, TTL.SEARCH);
  return c.json(body);
});

// GET /api/tags — get all unique tags (optimized: only fetch tags column)
meta.get("/tags", async (c) => {
  const cache = getCache();
  const key = "tags:all";

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const [evtTags, discTags, assTags] = await Promise.all([
    db.execute("SELECT tags FROM events WHERE tags IS NOT NULL AND tags != '[]'"),
    db.execute("SELECT tags FROM discussions WHERE tags IS NOT NULL AND tags != '[]'"),
    db.execute("SELECT tags FROM assessments WHERE tags IS NOT NULL AND tags != '[]'"),
  ]);

  const tagCounts = new Map<string, number>();

  for (const rows of [evtTags.rows, discTags.rows, assTags.rows]) {
    for (const row of rows) {
      const tags = safeJsonParse((row as any).tags, []);
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  const sorted = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  const body = { data: sorted };
  await cache.set(key, body, TTL.TAGS);
  return c.json(body);
});

export default meta;
