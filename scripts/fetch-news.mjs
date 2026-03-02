/**
 * fetch-news.mjs — Aggregate news from NewsAPI + RSS feeds
 *
 * Requires: NEWS_API_KEY env var (https://newsapi.org/)
 *
 * Usage: node scripts/fetch-news.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = "https://newsapi.org/v2";

const SEARCH_QUERIES = [
  "Iran US military conflict",
  "IRGC military operations",
  "Iran nuclear program",
  "Iran sanctions",
  "Strait of Hormuz",
  "Red Sea Houthi attacks",
  "Iran proxy forces",
  "US CENTCOM Middle East",
];

const RSS_FEEDS = [
  { name: "Reuters Middle East", url: "https://www.reuters.com/arc/outboundfeeds/v3/category/middle-east/?outputType=xml&size=50" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "BBC Middle East", url: "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
];

async function fetchNewsAPI() {
  if (!NEWS_API_KEY) {
    console.warn("⚠️  No NEWS_API_KEY — skipping NewsAPI fetch");
    return [];
  }

  const allArticles = [];
  const seenUrls = new Set();

  for (const query of SEARCH_QUERIES) {
    console.log(`📡 NewsAPI: "${query}"...`);

    const params = new URLSearchParams({
      q: query,
      language: "en",
      sortBy: "publishedAt",
      pageSize: "50",
      apiKey: NEWS_API_KEY,
    });

    try {
      const res = await fetch(`${NEWS_API_BASE}/everything?${params}`);
      if (!res.ok) {
        console.error(`  ❌ HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const articles = json.articles || [];

      for (const a of articles) {
        if (!a.url || seenUrls.has(a.url)) continue;
        seenUrls.add(a.url);

        allArticles.push({
          id: `news-${Buffer.from(a.url).toString("base64url").slice(0, 16)}`,
          title: a.title || "",
          summary: a.description || "",
          content: a.content || undefined,
          source: a.source?.name || "Unknown",
          source_url: a.url,
          author: a.author || undefined,
          published_at: a.publishedAt || new Date().toISOString(),
          image_url: a.urlToImage || undefined,
          category: "news",
          tags: extractTags(a.title || ""),
          scraped: false,
        });
      }

      console.log(`  ✅ "${query}": ${articles.length} articles (unique: ${allArticles.length})`);
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
    }
  }

  return allArticles;
}

async function fetchRSSFeeds() {
  const allArticles = [];

  for (const feed of RSS_FEEDS) {
    console.log(`📡 RSS: ${feed.name}...`);

    try {
      const res = await fetch(feed.url);
      if (!res.ok) {
        console.error(`  ❌ HTTP ${res.status} for ${feed.name}`);
        continue;
      }

      const text = await res.text();
      // Simple XML parsing for RSS items
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

      let count = 0;
      for (const item of items) {
        const title = extractXML(item, "title");
        const link = extractXML(item, "link");
        const desc = extractXML(item, "description");
        const pubDate = extractXML(item, "pubDate");

        if (!link) continue;

        // Filter for Iran/conflict relevance
        const combined = `${title} ${desc}`.toLowerCase();
        const isRelevant = ["iran", "irgc", "houthi", "hezbollah", "centcom", "persian gulf", "strait of hormuz", "middle east conflict", "military strike"].some((kw) => combined.includes(kw));

        if (!isRelevant) continue;

        allArticles.push({
          id: `rss-${Buffer.from(link).toString("base64url").slice(0, 16)}`,
          title: cleanXML(title),
          summary: cleanXML(desc).slice(0, 500),
          source: feed.name,
          source_url: link,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          category: "news",
          tags: extractTags(title || ""),
          scraped: false,
        });
        count++;
      }

      console.log(`  ✅ ${feed.name}: ${count} relevant articles`);
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
    }
  }

  return allArticles;
}

function extractXML(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? (match[1] || match[2] || "").trim() : "";
}

function cleanXML(str) {
  return str.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function extractTags(title) {
  const tags = [];
  const lower = title.toLowerCase();
  const keywords = { iran: "iran", irgc: "irgc", nuclear: "nuclear", sanctions: "sanctions", missile: "missiles", drone: "drones", houthi: "houthis", hezbollah: "hezbollah", navy: "naval", cyber: "cyber-warfare" };
  for (const [kw, tag] of Object.entries(keywords)) {
    if (lower.includes(kw)) tags.push(tag);
  }
  return tags;
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const [newsArticles, rssArticles] = await Promise.all([fetchNewsAPI(), fetchRSSFeeds()]);

  const all = [...newsArticles, ...rssArticles];
  all.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  console.log(`\n📊 Total articles: ${all.length} (NewsAPI: ${newsArticles.length}, RSS: ${rssArticles.length})`);
  writeFileSync(join(DATA_DIR, "articles.json"), JSON.stringify(all, null, 2));
  console.log("✅ Saved to public/data/articles.json");
}

main().catch(console.error);
