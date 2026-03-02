/**
 * fetch-acled.mjs — Pull conflict events from ACLED API
 * https://acleddata.com/
 *
 * Requires: ACLED_API_KEY and ACLED_EMAIL env vars
 * Free researcher access: https://developer.acleddata.com/
 *
 * Usage: node scripts/fetch-acled.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const ACLED_KEY = process.env.ACLED_API_KEY;
const ACLED_EMAIL = process.env.ACLED_EMAIL;
const BASE_URL = "https://api.acleddata.com/acled/read";

// Countries relevant to US-Iran conflict
const COUNTRIES = ["Iran", "Iraq", "Syria", "Lebanon", "Yemen", "Bahrain", "Saudi Arabia", "Israel"];
const EVENT_DATE_FROM = "2020-01-01";

async function fetchACLED() {
  if (!ACLED_KEY || !ACLED_EMAIL) {
    console.error("❌ Missing ACLED_API_KEY or ACLED_EMAIL env vars");
    console.log("Sign up at https://developer.acleddata.com/ for free access");
    process.exit(1);
  }

  mkdirSync(DATA_DIR, { recursive: true });

  const allEvents = [];

  for (const country of COUNTRIES) {
    console.log(`📡 Fetching ACLED events for ${country}...`);
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        key: ACLED_KEY,
        email: ACLED_EMAIL,
        country,
        event_date: EVENT_DATE_FROM,
        event_date_where: ">=",
        page: String(page),
        limit: "500",
      });

      try {
        const res = await fetch(`${BASE_URL}?${params}`);
        if (!res.ok) {
          console.error(`  ❌ HTTP ${res.status} for ${country} page ${page}`);
          break;
        }

        const json = await res.json();
        const events = json.data || [];

        if (events.length === 0) {
          hasMore = false;
        } else {
          // Transform to our schema
          const transformed = events.map((e) => ({
            id: `acled-${e.data_id}`,
            date: e.event_date,
            event_type: mapACLEDType(e.event_type, e.sub_event_type),
            title: `${e.event_type}: ${e.actor1}${e.actor2 ? ` vs ${e.actor2}` : ""}`,
            description: e.notes || "",
            location: {
              lat: parseFloat(e.latitude) || 0,
              lng: parseFloat(e.longitude) || 0,
              name: e.location || "Unknown",
              region: e.admin1 || e.country,
            },
            theater_id: mapTheater(e.country, e.admin1),
            actors: [e.actor1, e.actor2, e.assoc_actor_1, e.assoc_actor_2].filter(Boolean),
            fatalities: parseInt(e.fatalities) || 0,
            severity: mapSeverity(parseInt(e.fatalities) || 0),
            source: e.source || "ACLED",
            source_url: e.source_url || undefined,
            verified: true,
            tags: [e.event_type, e.sub_event_type, e.country].filter(Boolean).map((t) => t.toLowerCase()),
            created_at: new Date().toISOString(),
          }));

          allEvents.push(...transformed);
          console.log(`  ✅ ${country} page ${page}: ${events.length} events (total: ${allEvents.length})`);
          page++;

          // Rate limit respect
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (err) {
        console.error(`  ❌ Error fetching ${country} page ${page}:`, err.message);
        break;
      }
    }
  }

  console.log(`\n📊 Total ACLED events: ${allEvents.length}`);
  writeFileSync(join(DATA_DIR, "acled-events.json"), JSON.stringify(allEvents, null, 2));
  console.log("✅ Saved to public/data/acled-events.json");
}

function mapACLEDType(type, subType) {
  const map = {
    Battles: "ground_operation",
    "Explosions/Remote violence": "missile_strike",
    "Violence against civilians": "ground_operation",
    "Strategic developments": "diplomatic",
    Protests: "demonstration",
    Riots: "demonstration",
  };
  if (subType?.toLowerCase().includes("air")) return "airstrike";
  if (subType?.toLowerCase().includes("drone")) return "drone_strike";
  if (subType?.toLowerCase().includes("missile")) return "missile_strike";
  if (subType?.toLowerCase().includes("naval")) return "naval_engagement";
  return map[type] || "other";
}

function mapTheater(country, admin1) {
  const theaterMap = {
    Iran: "iranian-mainland",
    Iraq: "iraq-theater",
    Syria: "syrian-theater",
    Lebanon: "lebanon-border",
    Yemen: "red-sea",
    "Saudi Arabia": "persian-gulf",
    Bahrain: "persian-gulf",
    Israel: "levant",
  };
  return theaterMap[country] || "other";
}

function mapSeverity(fatalities) {
  if (fatalities === 0) return 1;
  if (fatalities <= 5) return 2;
  if (fatalities <= 20) return 3;
  if (fatalities <= 100) return 4;
  return 5;
}

fetchACLED().catch(console.error);
