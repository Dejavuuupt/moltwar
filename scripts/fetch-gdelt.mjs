/**
 * fetch-gdelt.mjs — Pull events from GDELT Global Knowledge Graph
 * https://www.gdeltproject.org/
 *
 * GDELT is free and requires no API key.
 * Uses the GDELT DOC 2.0 API for full-text search.
 *
 * Usage: node scripts/fetch-gdelt.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";

// Search queries for US-Iran conflict
const QUERIES = [
  "Iran military strike",
  "IRGC attack",
  "US Iran tensions",
  "Strait Hormuz military",
  "Iran nuclear program",
  "Iran sanctions",
  "Iran proxy militia",
  "Houthi Red Sea",
  "Hezbollah Iran",
  "US CENTCOM Iran",
  "Iran drone attack",
  "Iran missile launch",
  "Persian Gulf military",
  "Iran Iraq militia",
];

async function fetchGDELT() {
  mkdirSync(DATA_DIR, { recursive: true });

  const allArticles = [];
  const seenUrls = new Set();

  for (const query of QUERIES) {
    console.log(`📡 Querying GDELT: "${query}"...`);

    const params = new URLSearchParams({
      query,
      mode: "ArtList",
      maxrecords: "75",
      format: "json",
      sort: "DateDesc",
      timespan: "6m",
    });

    try {
      const res = await fetch(`${GDELT_DOC_API}?${params}`);
      if (!res.ok) {
        console.error(`  ❌ HTTP ${res.status} for "${query}"`);
        continue;
      }

      const json = await res.json();
      const articles = json.articles || [];

      for (const a of articles) {
        if (seenUrls.has(a.url)) continue;
        seenUrls.add(a.url);

        allArticles.push({
          id: `gdelt-${Buffer.from(a.url).toString("base64url").slice(0, 16)}`,
          title: a.title || "",
          summary: a.seendate ? `Published ${a.seendate}` : "",
          source: a.domain || "Unknown",
          source_url: a.url,
          published_at: parseGDELTDate(a.seendate),
          image_url: a.socialimage || undefined,
          category: categorizeArticle(a.title || ""),
          tags: extractTags(a.title || "", query),
          tone: a.tone ? parseFloat(a.tone) : undefined,
          language: a.language || "English",
          scraped: false,
        });
      }

      console.log(`  ✅ "${query}": ${articles.length} articles (unique total: ${allArticles.length})`);

      // Rate limit
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ❌ Error for "${query}":`, err.message);
    }
  }

  // Sort by date descending
  allArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  console.log(`\n📊 Total unique GDELT articles: ${allArticles.length}`);
  writeFileSync(join(DATA_DIR, "gdelt-articles.json"), JSON.stringify(allArticles, null, 2));
  console.log("✅ Saved to public/data/gdelt-articles.json");
}

function parseGDELTDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  // GDELT dates: "20260215T120000Z" or "20260215120000"
  const clean = dateStr.replace(/[^0-9]/g, "");
  if (clean.length >= 14) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    const h = clean.slice(8, 10);
    const mn = clean.slice(10, 12);
    const s = clean.slice(12, 14);
    return new Date(`${y}-${m}-${d}T${h}:${mn}:${s}Z`).toISOString();
  }
  return new Date().toISOString();
}

function categorizeArticle(title) {
  const lower = title.toLowerCase();
  if (lower.includes("nuclear") || lower.includes("uranium")) return "nuclear";
  if (lower.includes("sanction")) return "sanctions";
  if (lower.includes("missile") || lower.includes("strike") || lower.includes("attack")) return "military";
  if (lower.includes("diplomacy") || lower.includes("negotiate") || lower.includes("talks")) return "diplomatic";
  if (lower.includes("humanitarian") || lower.includes("civilian")) return "humanitarian";
  if (lower.includes("cyber")) return "cyber";
  if (lower.includes("proxy") || lower.includes("militia")) return "proxy";
  return "general";
}

function extractTags(title, query) {
  const tags = new Set();
  const lower = title.toLowerCase();

  const keywords = {
    iran: "iran",
    irgc: "irgc",
    centcom: "centcom",
    hezbollah: "hezbollah",
    houthi: "houthis",
    nuclear: "nuclear",
    missile: "missiles",
    drone: "drones",
    sanctions: "sanctions",
    "strait of hormuz": "strait-of-hormuz",
    "red sea": "red-sea",
    "persian gulf": "persian-gulf",
    proxy: "proxy-warfare",
    cyber: "cyber-warfare",
    navy: "naval",
    "air strike": "airstrikes",
    airstrike: "airstrikes",
  };

  for (const [keyword, tag] of Object.entries(keywords)) {
    if (lower.includes(keyword)) tags.add(tag);
  }

  // Add query-derived tag
  tags.add(query.split(" ").slice(0, 2).join("-").toLowerCase());

  return Array.from(tags);
}

fetchGDELT().catch(console.error);
