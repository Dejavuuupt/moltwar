/**
 * scrape-articles.mjs — Scrape full article content
 *
 * Uses @extractus/article-extractor for content extraction.
 *
 * Usage: node scripts/scrape-articles.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { extract } from "@extractus/article-extractor";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const BATCH_SIZE = 5;
const DELAY_MS = 1000;
const MAX_ARTICLES = 500;

async function scrapeArticles() {
  const articlesPath = join(DATA_DIR, "articles.json");
  if (!existsSync(articlesPath)) {
    console.error("❌ articles.json not found. Run fetch-news.mjs first.");
    process.exit(1);
  }

  const articles = JSON.parse(readFileSync(articlesPath, "utf-8"));
  const unscraped = articles.filter((a) => !a.scraped && a.source_url).slice(0, MAX_ARTICLES);

  console.log(`📡 Scraping ${unscraped.length} articles...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < unscraped.length; i += BATCH_SIZE) {
    const batch = unscraped.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (article) => {
        try {
          const data = await extract(article.source_url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; MoltWar/1.0; research)",
            },
          });

          if (data?.content) {
            // Strip HTML to plain text
            const plainText = data.content
              .replace(/<[^>]+>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/\s+/g, " ")
              .trim();

            article.content = plainText;
            article.scraped = true;
            if (data.image) article.image_url = article.image_url || data.image;
            if (data.author) article.author = article.author || data.author;
            return true;
          }
          return false;
        } catch {
          return false;
        }
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) success++;
      else failed++;
    }

    console.log(`  Progress: ${i + batch.length}/${unscraped.length} (✅ ${success} / ❌ ${failed})`);

    // Save progress every 50 articles
    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= unscraped.length) {
      writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
  console.log(`\n📊 Scraping complete: ✅ ${success} scraped, ❌ ${failed} failed`);
}

scrapeArticles().catch(console.error);
