import { Hono } from "hono";
import { getDb } from "../db";
import { getCache, cacheKey, TTL } from "../cache";
import { sanitizeLike, parseIntParam } from "../utils";
import Parser from "rss-parser";

const pulse = new Hono();

// ─── RSS Pulse Feed (backend-cached) ──────────────────────────────

const rssParser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "MoltWar-Intelligence-Aggregator/1.0",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:description", "mediaDescription"],
      ["description", "description"],
      ["dc:creator", "creator"],
    ],
  },
});

interface RSSFeedSource {
  name: string;
  url: string;
  type: string;
  category: string;
  icon: string;
}

const RSS_FEEDS: RSSFeedSource[] = [
  { name: "Reuters — Wire", url: "https://news.google.com/rss/search?q=reuters+iran+war&hl=en-US&gl=US&ceid=US:en", type: "wire_service", category: "general", icon: "📡" },
  { name: "AP News — Wire", url: "https://news.google.com/rss/search?q=associated+press+iran+middle+east&hl=en-US&gl=US&ceid=US:en", type: "wire_service", category: "general", icon: "📡" },
  { name: "CNN — World", url: "http://rss.cnn.com/rss/edition_world.rss", type: "cable_news", category: "general", icon: "📺" },
  { name: "CNN — Middle East", url: "http://rss.cnn.com/rss/edition_meast.rss", type: "cable_news", category: "military", icon: "📺" },
  { name: "BBC — World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", type: "cable_news", category: "general", icon: "📺" },
  { name: "BBC — Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", type: "cable_news", category: "military", icon: "📺" },
  { name: "Al Jazeera — All", url: "https://www.aljazeera.com/xml/rss/all.xml", type: "cable_news", category: "general", icon: "📺" },
  { name: "France 24 — Middle East", url: "https://www.france24.com/en/middle-east/rss", type: "cable_news", category: "military", icon: "📺" },
  { name: "DW — World", url: "https://rss.dw.com/rdf/rss-en-world", type: "cable_news", category: "general", icon: "📺" },
  { name: "The Guardian — World", url: "https://www.theguardian.com/world/rss", type: "newspaper", category: "general", icon: "📰" },
  { name: "NY Times — World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", type: "newspaper", category: "general", icon: "📰" },
  { name: "NY Times — Middle East", url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", type: "newspaper", category: "military", icon: "📰" },
  { name: "USNI News", url: "https://news.usni.org/feed", type: "defense_media", category: "military", icon: "🎖️" },
  { name: "Defense News", url: "https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml", type: "defense_media", category: "military", icon: "🎖️" },
  { name: "War on the Rocks", url: "https://warontherocks.com/feed/", type: "defense_media", category: "military", icon: "🎖️" },
  { name: "The War Zone", url: "https://www.thedrive.com/the-war-zone/feed", type: "defense_media", category: "military", icon: "🎖️" },
  { name: "US DoD News", url: "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=20&ContentType=1&Site=945", type: "official", category: "military", icon: "🏛️" },
  { name: "UN News — Middle East", url: "https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml", type: "official", category: "diplomatic", icon: "🏛️" },
  { name: "Bloomberg — Markets", url: "https://feeds.bloomberg.com/markets/news.rss", type: "newspaper", category: "economic", icon: "📰" },
  { name: "CNBC — World", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362", type: "cable_news", category: "economic", icon: "📺" },
  { name: "FT — World", url: "https://www.ft.com/rss/home", type: "newspaper", category: "economic", icon: "📰" },
  { name: "OilPrice.com", url: "https://oilprice.com/rss/main", type: "newspaper", category: "economic", icon: "📰" },
  { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews", type: "osint", category: "cyber", icon: "🛰️" },
  { name: "CyberScoop", url: "https://cyberscoop.com/feed/", type: "osint", category: "cyber", icon: "🛰️" },
  { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", type: "osint", category: "cyber", icon: "🛰️" },
  { name: "Dark Reading", url: "https://www.darkreading.com/rss.xml", type: "osint", category: "cyber", icon: "🛰️" },
  { name: "Middle East Monitor", url: "https://www.middleeastmonitor.com/feed/", type: "newspaper", category: "military", icon: "📰" },
  { name: "Breaking Defense", url: "https://breakingdefense.com/feed/", type: "defense_media", category: "military", icon: "🎖️" },
  { name: "Politico — Defense", url: "https://rss.politico.com/defense.xml", type: "newspaper", category: "military", icon: "📰" },
  { name: "Task & Purpose", url: "https://taskandpurpose.com/feed/", type: "defense_media", category: "military", icon: "🎖️" },
  { name: "The National (UAE)", url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml", type: "newspaper", category: "general", icon: "📰" },
  { name: "Times of Israel", url: "https://www.timesofisrael.com/feed/", type: "newspaper", category: "military", icon: "📰" },
  { name: "Jerusalem Post", url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx", type: "newspaper", category: "military", icon: "📰" },
  { name: "Iran International", url: "https://www.iranintl.com/en/feed", type: "cable_news", category: "military", icon: "📺" },
  { name: "Foreign Affairs", url: "https://www.foreignaffairs.com/rss.xml", type: "defense_media", category: "diplomatic", icon: "🎖️" },
  { name: "Foreign Policy", url: "https://foreignpolicy.com/feed/", type: "defense_media", category: "diplomatic", icon: "🎖️" },
  { name: "The Diplomat", url: "https://thediplomat.com/feed/", type: "defense_media", category: "diplomatic", icon: "🎖️" },
  { name: "Bellingcat", url: "https://www.bellingcat.com/feed/", type: "osint", category: "military", icon: "🛰️" },
  { name: "Google News — Iran War", url: "https://news.google.com/rss/search?q=iran+war+military+strike&hl=en-US&gl=US&ceid=US:en", type: "osint", category: "military", icon: "🛰️" },
  { name: "The Intercept", url: "https://theintercept.com/feed/?rss", type: "newspaper", category: "general", icon: "📰" },
  { name: "Arms Control Association", url: "https://www.armscontrol.org/rss.xml", type: "defense_media", category: "diplomatic", icon: "🎖️" },
  { name: "Google News — Strait of Hormuz", url: "https://news.google.com/rss/search?q=strait+of+hormuz+OR+persian+gulf+shipping&hl=en-US&gl=US&ceid=US:en", type: "osint", category: "economic", icon: "🛰️" },
  { name: "AFP — World", url: "https://www.france24.com/en/rss", type: "wire_service", category: "general", icon: "📡" },
  { name: "NPR — World", url: "https://feeds.npr.org/1004/rss.xml", type: "cable_news", category: "general", icon: "📺" },
  { name: "PBS NewsHour — World", url: "https://www.pbs.org/newshour/feeds/rss/world", type: "cable_news", category: "general", icon: "📺" },
  { name: "ABC News — International", url: "https://abcnews.go.com/abcnews/internationalheadlines", type: "cable_news", category: "general", icon: "📺" },
  { name: "Sky News — World", url: "https://feeds.skynews.com/feeds/rss/world.xml", type: "cable_news", category: "general", icon: "📺" },
  { name: "gCaptain — Maritime", url: "https://gcaptain.com/feed/", type: "osint", category: "economic", icon: "🛰️" },
  { name: "Google News — Oil Markets", url: "https://news.google.com/rss/search?q=oil+price+crude+energy+war&hl=en-US&gl=US&ceid=US:en", type: "osint", category: "economic", icon: "🛰️" },
  { name: "Google News — CENTCOM", url: "https://news.google.com/rss/search?q=CENTCOM+OR+%22US+military%22+middle+east&hl=en-US&gl=US&ceid=US:en", type: "osint", category: "military", icon: "🛰️" },
  { name: "Google News — Hezbollah", url: "https://news.google.com/rss/search?q=hezbollah+OR+lebanon+war+OR+israel+strike&hl=en-US&gl=US&ceid=US:en", type: "osint", category: "military", icon: "🛰️" },
  { name: "Google News — Cyber Warfare", url: "https://news.google.com/rss/search?q=cyber+attack+iran+OR+infrastructure+hack&hl=en-US&gl=US&ceid=US:en", type: "osint", category: "cyber", icon: "🛰️" },
];

function rssStripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, " ").trim();
}

function rssSafeDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  if (isNaN(d.getTime())) return new Date().toISOString();
  if (d.getTime() > Date.now()) return new Date().toISOString();
  return d.toISOString();
}

async function fetchSingleRSS(source: RSSFeedSource) {
  try {
    const feed = await rssParser.parseURL(source.url);
    return (feed.items || []).slice(0, 15).map((item: any, i: number) => ({
      id: `${source.name.replace(/\s/g, "-").toLowerCase()}-${i}`,
      source: source.name,
      sourceType: source.type,
      sourceIcon: source.icon,
      category: source.category,
      headline: (item.title || "No title").trim(),
      summary: rssStripHtml(item.contentSnippet || item.content || item.summary || item.mediaDescription || item.description || "").slice(0, 300),
      url: item.link || null,
      timestamp: rssSafeDate(item.isoDate || item.pubDate),
      feedName: source.name,
    }));
  } catch {
    return [];
  }
}

// GET /api/pulse/live — cached RSS feed aggregation
pulse.get("/live", async (c) => {
  const cache = getCache();
  const key = "pulse:live:all";

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const results = await Promise.allSettled(
    RSS_FEEDS.map((source) => fetchSingleRSS(source))
  );

  let feedsOnline = 0;
  const allItems: any[] = [];
  const sourceMap: Record<string, number> = {};

  results.forEach((result, idx) => {
    if (result.status === "fulfilled" && result.value.length > 0) {
      feedsOnline++;
      allItems.push(...result.value);
      sourceMap[RSS_FEEDS[idx].name] = result.value.length;
    }
  });

  allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const body = {
    data: {
      items: allItems,
      feedsOnline,
      feedsTotal: RSS_FEEDS.length,
      sourceMap,
      sources: RSS_FEEDS.map((s) => ({ name: s.name, type: s.type, category: s.category, icon: s.icon })),
      fetchedAt: new Date().toISOString(),
    },
  };

  // Cache for 5 minutes
  await cache.set(key, body, 300);
  return c.json(body);
});

function parsePulseRow(row: any) {
  return {
    ...row,
    verified: Boolean(row.verified),
  };
}

// GET /api/pulse — list real-time intelligence feed items
pulse.get("/", async (c) => {
  const cache = getCache();
  const category = c.req.query("category");
  const urgency = c.req.query("urgency");
  const region = c.req.query("region");
  const source = c.req.query("source");
  const since = c.req.query("since");
  const limit = parseIntParam(c.req.query("limit"), 100, 1, 500);
  const offset = parseIntParam(c.req.query("offset"), 0, 0, 10000);
  const key = cacheKey("pulse:list", { category, urgency, region, source, since, limit: String(limit), offset: String(offset) });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  let where: string[] = [];
  let args: any[] = [];

  if (category) { where.push("category = ?"); args.push(category); }
  if (urgency) { where.push("urgency = ?"); args.push(urgency); }
  if (region) { where.push("region = ?"); args.push(region); }
  if (source) { where.push("source LIKE ?"); args.push(`%${sanitizeLike(source)}%`); }
  if (since) { where.push("timestamp > ?"); args.push(since); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  // Run count + data + breakdown in parallel
  const [countResult, result, breakdownResult] = await Promise.all([
    db.execute({ sql: `SELECT COUNT(*) as total FROM pulse_items ${whereClause}`, args }),
    db.execute({ sql: `SELECT * FROM pulse_items ${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`, args: [...args, limit, offset] }),
    db.execute({ sql: `SELECT urgency, category, COUNT(*) as count FROM pulse_items ${whereClause} GROUP BY urgency, category`, args }),
  ]);

  const total = Number(countResult.rows[0]?.total ?? 0);
  const items = result.rows.map(parsePulseRow);

  const urgencyBreakdown: Record<string, number> = {};
  const categoryBreakdown: Record<string, number> = {};
  for (const row of breakdownResult.rows as any[]) {
    urgencyBreakdown[row.urgency] = (urgencyBreakdown[row.urgency] || 0) + row.count;
    categoryBreakdown[row.category] = (categoryBreakdown[row.category] || 0) + row.count;
  }

  const body = {
    data: items,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
    latest_timestamp: items[0]?.timestamp || null,
    urgency_breakdown: urgencyBreakdown,
    category_breakdown: categoryBreakdown,
  };
  await cache.set(key, body, TTL.HOT);
  return c.json(body);
});

// GET /api/pulse/:id — single pulse item
pulse.get("/:id", async (c) => {
  const cache = getCache();
  const id = c.req.param("id");
  const key = cacheKey("pulse:detail", { id });

  const cached = await cache.get(key);
  if (cached) return c.json(cached);

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM pulse_items WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) return c.json({ error: "Pulse item not found" }, 404);
  const body = { data: parsePulseRow(result.rows[0]) };
  await cache.set(key, body, TTL.HOT);
  return c.json(body);
});

export default pulse;
