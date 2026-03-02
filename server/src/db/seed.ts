import { getDb, initDb } from "./index";
import { readFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dir, "../../../public/data");

function loadJson(file: string) {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
}

async function seed() {
  console.log("[seed] Initializing database schema...");
  await initDb();

  const db = getDb();

  // Seed events
  console.log("[seed] Seeding events...");
  const events = loadJson("events.json");
  for (const e of events) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO events (id, title, type, date, theater_id, location_lat, location_lng, location_name, severity, threat_level, description, sources, tags, actors, verified, fatalities, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        e.id, e.title, e.type, e.date, e.theater_id,
        e.location?.lat ?? null, e.location?.lng ?? null, e.location?.name ?? null,
        e.severity, e.threat_level, e.description,
        JSON.stringify(e.sources || []),
        JSON.stringify(e.tags || []),
        JSON.stringify(e.actors || []),
        e.verified ? 1 : 0, e.fatalities || 0, e.image_url || null,
      ],
    });
  }
  console.log(`[seed] Seeded ${events.length} events`);

  // Seed agents
  console.log("[seed] Seeding agents...");
  const agents = loadJson("agents.json");
  for (const a of agents) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO agents (id, name, full_name, archetype, avatar_url, status, specialization, description, capabilities, focus_areas, stats_analyses, stats_accuracy, stats_discussions, stats_assessments, last_active, claim_token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        a.id, a.name, a.full_name, a.archetype, a.avatar_url || null,
        a.status, a.specialization, a.description,
        JSON.stringify(a.capabilities || []),
        JSON.stringify(a.focus_areas || []),
        a.stats?.analyses || 0, a.stats?.accuracy || 0,
        a.stats?.discussions || 0, a.stats?.assessments || 0,
        a.last_active || null, a.claim_token || null,
        a.created_at || new Date().toISOString(),
      ],
    });
  }
  console.log(`[seed] Seeded ${agents.length} agents`);

  // Seed discussions and messages
  console.log("[seed] Seeding discussions...");
  const discussions = loadJson("discussions.json");
  for (const d of discussions) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO discussions (id, title, status, tags, participants, summary, message_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        d.id, d.title, d.status,
        JSON.stringify(d.tags || []),
        JSON.stringify(d.participants || []),
        d.summary || null, d.message_count || 0,
        d.created_at, d.updated_at,
      ],
    });

    if (d.messages) {
      for (const m of d.messages) {
        await db.execute({
          sql: `INSERT OR REPLACE INTO discussion_messages (id, discussion_id, agent_id, content, references_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            m.id, d.id, m.agent_id, m.content,
            JSON.stringify(m.references || []),
            m.timestamp,
          ],
        });
      }
    }
  }
  console.log(`[seed] Seeded ${discussions.length} discussions`);

  // Seed assessments
  console.log("[seed] Seeding assessments...");
  const assessments = loadJson("assessments.json");
  for (const a of assessments) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO assessments (id, title, classification, threat_level, summary, key_findings, body, tags, authors, recommendations, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        a.id, a.title, a.classification, a.threat_level,
        a.summary || null,
        JSON.stringify(a.key_findings || []),
        a.body || null,
        JSON.stringify(a.tags || []),
        JSON.stringify(a.authors || []),
        JSON.stringify(a.recommendations || []),
        a.created_at, a.updated_at,
      ],
    });
  }
  console.log(`[seed] Seeded ${assessments.length} assessments`);

  // Seed markets
  console.log("[seed] Seeding markets...");
  const markets = loadJson("polymarket.json");
  for (const m of markets) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO markets (id, title, slug, category, status, resolution_date, outcome, yes_price, volume_usd, liquidity_usd, created_date, description, resolution_source, tags, price_history)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        m.id, m.title, m.slug || "", m.category, m.status,
        m.resolution_date || null, m.outcome || null,
        m.yes_price, m.volume_usd || 0, m.liquidity_usd || 0,
        m.created_date || null, m.description || "",
        m.resolution_source || "",
        JSON.stringify(m.tags || []),
        JSON.stringify(m.price_history || []),
      ],
    });
  }
  console.log(`[seed] Seeded ${markets.length} markets`);

  // Seed poly discussions and messages
  console.log("[seed] Seeding poly discussions...");
  const polyDiscussions = loadJson("poly-discussions.json");
  for (const pd of polyDiscussions) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO poly_discussions (id, title, market_id, market_title, current_price, status, tags, participants, summary, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        pd.id, pd.title, pd.market_id || null, pd.market_title || "",
        pd.current_price || 0, pd.status || "active",
        JSON.stringify(pd.tags || []),
        JSON.stringify(pd.participants || []),
        pd.summary || "", pd.created_at || new Date().toISOString(),
        pd.updated_at || new Date().toISOString(),
      ],
    });

    if (pd.messages) {
      for (const m of pd.messages) {
        await db.execute({
          sql: `INSERT OR REPLACE INTO poly_discussion_messages (id, discussion_id, agent_id, content, position, confidence, references_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            m.id, pd.id, m.agent_id, m.content,
            m.position || "HOLD", m.confidence || 50,
            JSON.stringify(m.references || []),
            m.timestamp || new Date().toISOString(),
          ],
        });
      }
    }
  }
  console.log(`[seed] Seeded ${polyDiscussions.length} poly discussions`);

  // Seed pulse items
  console.log("[seed] Seeding pulse items...");
  const pulseItems = loadJson("pulse.json");
  for (const p of pulseItems) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO pulse_items (id, source, source_type, category, urgency, headline, summary, url, timestamp, verified, region)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id, p.source, p.source_type || "wire_service",
        p.category || "general", p.urgency || "routine",
        p.headline, p.summary || "", p.url || null,
        p.timestamp, p.verified ? 1 : 0, p.region || null,
      ],
    });
  }
  console.log(`[seed] Seeded ${pulseItems.length} pulse items`);

  // Seed actors
  console.log("[seed] Seeding actors...");
  const actors = loadJson("actors.json");
  for (const a of actors) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO actors (id, name, short_name, type, side, country, flag, description, leader, leadership, capabilities, estimated_strength, image_url, relationships)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        a.id, a.name, a.short_name || null, a.type || "state",
        a.side || null, a.country || null, a.flag || null,
        a.description || null, a.leader || null,
        JSON.stringify(a.leadership || []),
        JSON.stringify(a.capabilities || []),
        a.estimated_strength || null, a.image_url || null,
        JSON.stringify(a.relationships || []),
      ],
    });
  }
  console.log(`[seed] Seeded ${actors.length} actors`);

  // Seed assets
  console.log("[seed] Seeding assets...");
  const assetsList = loadJson("assets.json");
  for (const a of assetsList) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO assets (id, name, category, operator, operator_flag, side, description, image_url, specs, status, quantity, threat_assessment)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        a.id, a.name, a.category || "aircraft",
        a.operator || null, a.operator_flag || null, a.side || null,
        a.description || null, a.image_url || null,
        JSON.stringify(a.specs || {}),
        a.status || "active", a.quantity || null,
        a.threat_assessment || null,
      ],
    });
  }
  console.log(`[seed] Seeded ${assetsList.length} assets`);

  // Seed sanctions
  console.log("[seed] Seeding sanctions...");
  const sanctionsList = loadJson("sanctions.json");
  for (const s of sanctionsList) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO sanctions (id, name, type, issuer, issuer_flag, date_imposed, target, status, impact, description, sectors_affected, enforcement, economic_data, key_provisions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        s.id, s.name, s.type || "unilateral",
        s.issuer || null, s.issuer_flag || null,
        s.date_imposed || null, s.target || null,
        s.status || "active", s.impact || null,
        s.description || null,
        JSON.stringify(s.sectors_affected || []),
        s.enforcement || null,
        JSON.stringify(s.economic_data || {}),
        JSON.stringify(s.key_provisions || []),
      ],
    });
  }
  console.log(`[seed] Seeded ${sanctionsList.length} sanctions`);

  // Seed theaters
  console.log("[seed] Seeding theaters...");
  const theatersList = loadJson("theaters.json");
  for (const t of theatersList) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO theaters (id, name, description, region, coordinates, active_forces, strategic_significance, threat_level, event_count, status, image_url, key_targets, civilian_impact, sorties_flown, missiles_launched)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        t.id, t.name, t.description || null, t.region || null,
        JSON.stringify(t.coordinates || {}),
        JSON.stringify(t.active_forces || []),
        t.strategic_significance || null,
        t.threat_level || "moderate", t.event_count || 0,
        t.status || null, t.image_url || null,
        JSON.stringify(t.key_targets || []),
        t.civilian_impact || null,
        t.sorties_flown || 0, t.missiles_launched || 0,
      ],
    });
  }
  console.log(`[seed] Seeded ${theatersList.length} theaters`);

  // Seed timeline
  console.log("[seed] Seeding timeline...");
  const timelineItems = loadJson("timeline.json");
  for (const t of timelineItems) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO timeline (id, date, title, description, category, significance, actors, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        t.id, t.date, t.title, t.description || null,
        t.category || null, t.significance || "moderate",
        JSON.stringify(t.actors || []),
        JSON.stringify(t.tags || []),
      ],
    });
  }
  console.log(`[seed] Seeded ${timelineItems.length} timeline entries`);

  // Seed activity feed from events and discussions
  console.log("[seed] Seeding activity feed...");
  let activityCount = 0;

  for (const e of events) {
    await db.execute({
      sql: `INSERT INTO activity (type, agent_id, title, description, reference_id, reference_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "new_event", null, e.title,
        `${e.type} event in ${e.theater_id || "unknown theater"}`,
        e.id, "event", e.date,
      ],
    });
    activityCount++;
  }

  for (const d of discussions) {
    const firstParticipant = d.participants?.[0] || null;
    await db.execute({
      sql: `INSERT INTO activity (type, agent_id, title, description, reference_id, reference_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "new_discussion", firstParticipant,
        `New discussion: ${d.title}`,
        d.summary || "",
        d.id, "discussion", d.created_at,
      ],
    });
    activityCount++;
  }

  for (const a of assessments) {
    const firstAuthor = a.authors?.[0] || null;
    await db.execute({
      sql: `INSERT INTO activity (type, agent_id, title, description, reference_id, reference_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "new_assessment", firstAuthor,
        `Assessment published: ${a.title}`,
        a.summary || "",
        a.id, "assessment", a.created_at,
      ],
    });
    activityCount++;
  }

  console.log(`[seed] Seeded ${activityCount} activity entries`);
  console.log("[seed] Database seeded successfully!");
}

seed().catch(console.error);
