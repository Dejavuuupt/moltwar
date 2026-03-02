/**
 * fetch-wiki-context.mjs — Pull Wikipedia articles for historical context
 *
 * Uses the free MediaWiki API — no key required.
 *
 * Usage: node scripts/fetch-wiki-context.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const WIKI_API = "https://en.wikipedia.org/w/api.php";

const TOPICS = [
  { title: "Iran–United_States_relations", category: "political", time_period: "1953–present" },
  { title: "Islamic_Revolutionary_Guard_Corps", category: "military", time_period: "1979–present" },
  { title: "United_States_Central_Command", category: "military", time_period: "1983–present" },
  { title: "Strait_of_Hormuz", category: "military", time_period: "Strategic chokepoint" },
  { title: "Joint_Comprehensive_Plan_of_Action", category: "nuclear", time_period: "2015–present" },
  { title: "Iranian_nuclear_program", category: "nuclear", time_period: "1950s–present" },
  { title: "Iran–Iraq_War", category: "historical", time_period: "1980–1988" },
  { title: "1953_Iranian_coup_d%27état", category: "historical", time_period: "1953" },
  { title: "Iranian_Revolution", category: "historical", time_period: "1979" },
  { title: "Iran_hostage_crisis", category: "historical", time_period: "1979–1981" },
  { title: "Assassination_of_Qasem_Soleimani", category: "military", time_period: "2020" },
  { title: "Qasem_Soleimani", category: "military", time_period: "1957–2020" },
  { title: "Quds_Force", category: "military", time_period: "1988–present" },
  { title: "Hezbollah", category: "military", time_period: "1985–present" },
  { title: "Houthis", category: "military", time_period: "1994–present" },
  { title: "Iran–Israel_proxy_conflict", category: "political", time_period: "1980s–present" },
  { title: "United_States_sanctions_against_Iran", category: "economic", time_period: "1979–present" },
  { title: "Persian_Gulf", category: "military", time_period: "Strategic region" },
  { title: "Ali_Khamenei", category: "political", time_period: "1939–present" },
  { title: "Ballistic_missile_forces_of_Iran", category: "military", time_period: "1980s–present" },
  { title: "Iran_and_state-sponsored_terrorism", category: "political", time_period: "1979–present" },
  { title: "2019–2021_Persian_Gulf_crisis", category: "military", time_period: "2019–2021" },
  { title: "Operation_Praying_Mantis", category: "historical", time_period: "1988" },
  { title: "Iran_Air_Flight_655", category: "historical", time_period: "1988" },
  { title: "Tanker_War", category: "historical", time_period: "1984–1988" },
];

async function fetchWikiArticles() {
  mkdirSync(DATA_DIR, { recursive: true });

  const contextEntries = [];

  for (const topic of TOPICS) {
    console.log(`📡 Wikipedia: ${topic.title.replace(/_/g, " ")}...`);

    try {
      // Get extract (summary + intro)
      const summaryParams = new URLSearchParams({
        action: "query",
        titles: decodeURIComponent(topic.title),
        prop: "extracts|pageimages",
        exintro: "false",
        explaintext: "true",
        exsectionformat: "plain",
        exchars: "8000",
        piprop: "thumbnail",
        pithumbsize: "400",
        format: "json",
        origin: "*",
      });

      const res = await fetch(`${WIKI_API}?${summaryParams}`);
      if (!res.ok) {
        console.error(`  ❌ HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const pages = json.query?.pages || {};
      const page = Object.values(pages)[0];

      if (!page || page.missing !== undefined) {
        console.error(`  ❌ Page not found: ${topic.title}`);
        continue;
      }

      const extract = page.extract || "";
      const lines = extract.split("\n").filter((l) => l.trim());
      const summary = lines.slice(0, 3).join(" ").slice(0, 500);

      contextEntries.push({
        id: `wiki-${topic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
        title: page.title || topic.title.replace(/_/g, " "),
        summary,
        content: extract,
        category: topic.category,
        time_period: topic.time_period,
        key_figures: extractKeyFigures(extract),
        related_actors: extractActors(extract),
        source: "Wikipedia",
        source_url: `https://en.wikipedia.org/wiki/${topic.title}`,
        image_url: page.thumbnail?.source || undefined,
      });

      console.log(`  ✅ ${page.title}: ${extract.length} chars`);

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
    }
  }

  console.log(`\n📊 Total context entries: ${contextEntries.length}`);
  writeFileSync(join(DATA_DIR, "context.json"), JSON.stringify(contextEntries, null, 2));
  console.log("✅ Saved to public/data/context.json");
}

function extractKeyFigures(text) {
  const figures = new Set();
  const names = [
    "Khamenei", "Soleimani", "Raisi", "Rouhani", "Zarif",
    "Trump", "Biden", "Obama", "Pompeo", "Mattis",
    "Nasrallah", "Mughniyeh",
  ];
  for (const name of names) {
    if (text.includes(name)) figures.add(name);
  }
  return Array.from(figures);
}

function extractActors(text) {
  const actors = new Set();
  const actorNames = {
    "IRGC": "irgc",
    "Revolutionary Guard": "irgc",
    "Quds Force": "quds-force",
    "Hezbollah": "hezbollah",
    "Houthi": "houthis",
    "CENTCOM": "us-centcom",
    "United States": "united-states",
    "Iran": "iran",
    "Israel": "israel",
    "Saudi Arabia": "saudi-arabia",
  };
  for (const [name, id] of Object.entries(actorNames)) {
    if (text.includes(name)) actors.add(id);
  }
  return Array.from(actors);
}

fetchWikiArticles().catch(console.error);
