/**
 * enrich-events.mjs — Cross-link events with actors, theaters, assets, and timeline
 *
 * Usage: node scripts/enrich-events.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

function loadJSON(file) {
  const path = join(DATA_DIR, file);
  if (!existsSync(path)) {
    console.warn(`⚠️  ${file} not found, skipping`);
    return [];
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

async function enrichEvents() {
  const events = loadJSON("events.json");
  const actors = loadJSON("actors.json");
  const theaters = loadJSON("theaters.json");
  const articles = loadJSON("articles.json");

  if (events.length === 0) {
    console.error("❌ No events to enrich. Run fetch-acled.mjs first or ensure events.json exists.");
    process.exit(1);
  }

  const actorNameMap = {};
  for (const a of actors) {
    actorNameMap[a.name.toLowerCase()] = a.id;
    actorNameMap[a.short_name.toLowerCase()] = a.id;
  }

  let enriched = 0;

  for (const event of events) {
    // Resolve actor IDs
    const resolvedActors = [];
    for (const actorName of event.actors || []) {
      const lower = actorName.toLowerCase();
      for (const [name, id] of Object.entries(actorNameMap)) {
        if (lower.includes(name) || name.includes(lower)) {
          resolvedActors.push(id);
          break;
        }
      }
    }
    if (resolvedActors.length > 0) {
      event.resolved_actor_ids = [...new Set(resolvedActors)];
    }

    // Match articles by title similarity + date proximity
    const eventDate = new Date(event.date);
    const matchedArticles = [];
    for (const article of articles) {
      const articleDate = new Date(article.published_at);
      const daysDiff = Math.abs((eventDate - articleDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 7) continue;

      // Simple keyword overlap check
      const eventWords = `${event.title} ${event.description}`.toLowerCase().split(/\s+/);
      const articleWords = `${article.title} ${article.summary}`.toLowerCase().split(/\s+/);
      const overlap = eventWords.filter((w) => w.length > 4 && articleWords.includes(w));

      if (overlap.length >= 3) {
        matchedArticles.push(article.id);
      }
    }

    if (matchedArticles.length > 0) {
      event.matched_articles = matchedArticles.slice(0, 5);
      enriched++;
    }
  }

  // Update theater event counts
  const theaterCounts = {};
  for (const event of events) {
    if (event.theater_id) {
      theaterCounts[event.theater_id] = (theaterCounts[event.theater_id] || 0) + 1;
    }
  }

  for (const theater of theaters) {
    theater.event_count = theaterCounts[theater.id] || 0;
  }

  writeFileSync(join(DATA_DIR, "events.json"), JSON.stringify(events, null, 2));
  writeFileSync(join(DATA_DIR, "theaters.json"), JSON.stringify(theaters, null, 2));

  console.log(`✅ Enriched ${enriched}/${events.length} events with article cross-references`);
  console.log(`✅ Updated theater event counts`);
}

enrichEvents().catch(console.error);
