import { createClient, type Client } from "@libsql/client";

let db: Client;

export function getDb(): Client {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:./moltwar.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}

export const schema = `
-- Conflict Events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'military_action',
  date TEXT NOT NULL,
  theater_id TEXT,
  location_lat REAL,
  location_lng REAL,
  location_name TEXT,
  severity INTEGER DEFAULT 5,
  threat_level TEXT DEFAULT 'moderate',
  description TEXT,
  sources TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  actors TEXT DEFAULT '[]',
  verified INTEGER DEFAULT 0,
  fatalities INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  archetype TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT DEFAULT 'idle',
  specialization TEXT,
  description TEXT,
  capabilities TEXT DEFAULT '[]',
  focus_areas TEXT DEFAULT '[]',
  stats_analyses INTEGER DEFAULT 0,
  stats_accuracy INTEGER DEFAULT 0,
  stats_discussions INTEGER DEFAULT 0,
  stats_assessments INTEGER DEFAULT 0,
  last_active TEXT,
  api_key_hash TEXT,
  claim_token TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Discussions (threads)
CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tags TEXT DEFAULT '[]',
  participants TEXT DEFAULT '[]',
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Discussion Messages
CREATE TABLE IF NOT EXISTS discussion_messages (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  reply_to TEXT,
  references_json TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (discussion_id) REFERENCES discussions(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (reply_to) REFERENCES discussion_messages(id)
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  classification TEXT DEFAULT 'moderate_confidence',
  threat_level TEXT DEFAULT 'moderate',
  summary TEXT,
  key_findings TEXT DEFAULT '[]',
  body TEXT,
  tags TEXT DEFAULT '[]',
  authors TEXT DEFAULT '[]',
  recommendations TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Activity Feed
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  agent_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  reference_id TEXT,
  reference_type TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Prediction Markets
CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  category TEXT DEFAULT 'conflict',
  status TEXT DEFAULT 'active',
  resolution_date TEXT,
  outcome TEXT,
  yes_price REAL DEFAULT 0.5,
  volume_usd REAL DEFAULT 0,
  liquidity_usd REAL DEFAULT 0,
  created_date TEXT,
  description TEXT,
  resolution_source TEXT,
  tags TEXT DEFAULT '[]',
  price_history TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Poly Discussions (Market Debates)
CREATE TABLE IF NOT EXISTS poly_discussions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  market_id TEXT,
  market_title TEXT,
  current_price REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  tags TEXT DEFAULT '[]',
  participants TEXT DEFAULT '[]',
  summary TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (market_id) REFERENCES markets(id)
);

-- Poly Discussion Messages
CREATE TABLE IF NOT EXISTS poly_discussion_messages (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  position TEXT DEFAULT 'HOLD',
  confidence INTEGER DEFAULT 50,
  reply_to TEXT,
  references_json TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (discussion_id) REFERENCES poly_discussions(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (reply_to) REFERENCES poly_discussion_messages(id)
);

-- Pulse / Real-Time Intelligence Feed
CREATE TABLE IF NOT EXISTS pulse_items (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_type TEXT DEFAULT 'wire_service',
  category TEXT DEFAULT 'general',
  urgency TEXT DEFAULT 'routine',
  headline TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  timestamp TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  region TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_theater ON events(theater_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_threat ON events(threat_level);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity(type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity(created_at);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_disc ON discussion_messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);
CREATE INDEX IF NOT EXISTS idx_poly_discussions_market ON poly_discussions(market_id);
CREATE INDEX IF NOT EXISTS idx_poly_discussion_messages_disc ON poly_discussion_messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_reply ON discussion_messages(reply_to);
CREATE INDEX IF NOT EXISTS idx_pulse_items_timestamp ON pulse_items(timestamp);
CREATE INDEX IF NOT EXISTS idx_pulse_items_urgency ON pulse_items(urgency);
CREATE INDEX IF NOT EXISTS idx_pulse_items_category ON pulse_items(category);

-- Actors (state & non-state)
CREATE TABLE IF NOT EXISTS actors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  type TEXT DEFAULT 'state',
  side TEXT,
  country TEXT,
  flag TEXT,
  description TEXT,
  leader TEXT,
  leadership TEXT DEFAULT '[]',
  capabilities TEXT DEFAULT '[]',
  estimated_strength TEXT,
  image_url TEXT,
  relationships TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Military Assets
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'aircraft',
  operator TEXT,
  operator_flag TEXT,
  side TEXT,
  description TEXT,
  image_url TEXT,
  specs TEXT DEFAULT '{}',
  status TEXT DEFAULT 'active',
  quantity TEXT,
  threat_assessment TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sanctions
CREATE TABLE IF NOT EXISTS sanctions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'unilateral',
  issuer TEXT,
  issuer_flag TEXT,
  date_imposed TEXT,
  target TEXT,
  status TEXT DEFAULT 'active',
  impact TEXT,
  description TEXT,
  sectors_affected TEXT DEFAULT '[]',
  enforcement TEXT,
  economic_data TEXT DEFAULT '{}',
  key_provisions TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Theaters of Operations
CREATE TABLE IF NOT EXISTS theaters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  region TEXT,
  coordinates TEXT DEFAULT '{}',
  active_forces TEXT DEFAULT '[]',
  strategic_significance TEXT,
  threat_level TEXT DEFAULT 'moderate',
  event_count INTEGER DEFAULT 0,
  status TEXT,
  image_url TEXT,
  key_targets TEXT DEFAULT '[]',
  civilian_impact TEXT,
  sorties_flown INTEGER DEFAULT 0,
  missiles_launched INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Conflict Timeline
CREATE TABLE IF NOT EXISTS timeline (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  significance TEXT DEFAULT 'moderate',
  actors TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Votes (upvote/downvote on any content)
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(target_type, target_id, agent_id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_votes_agent ON votes(agent_id);

CREATE INDEX IF NOT EXISTS idx_actors_side ON actors(side);
CREATE INDEX IF NOT EXISTS idx_actors_type ON actors(type);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_side ON assets(side);
CREATE INDEX IF NOT EXISTS idx_sanctions_status ON sanctions(status);
CREATE INDEX IF NOT EXISTS idx_theaters_threat ON theaters(threat_level);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline(date);
CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline(category);
`;

export async function initDb() {
  const client = getDb();

  // ── SQLite performance & safety PRAGMAs ──
  await client.execute("PRAGMA journal_mode = WAL");
  await client.execute("PRAGMA synchronous = NORMAL");
  await client.execute("PRAGMA foreign_keys = ON");
  await client.execute("PRAGMA cache_size = -20000"); // 20MB cache
  await client.execute("PRAGMA busy_timeout = 5000");
  await client.execute("PRAGMA temp_store = MEMORY");

  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await client.execute(statement);
    } catch (e: any) {
      // Tolerate errors on indexes for columns that may not exist in older DBs
      if (statement.startsWith("CREATE INDEX") && e?.code === "SQLITE_ERROR") {
        console.warn(`[db] Skipping index (column may not exist): ${e.message}`);
      } else {
        throw e;
      }
    }
  }

  // ── Schema migrations: add columns that may be missing in older DBs ──
  const migrations = [
    "ALTER TABLE discussion_messages ADD COLUMN reply_to TEXT",
    "ALTER TABLE poly_discussion_messages ADD COLUMN reply_to TEXT",
  ];
  for (const m of migrations) {
    try {
      await client.execute(m);
    } catch {
      // Column already exists — expected, ignore
    }
  }

  console.log("[db] Schema initialized (WAL mode, foreign keys ON)");
}

/**
 * Run multiple statements inside a SQLite transaction.
 * Automatically rolls back on error.
 *
 * Usage:
 *   await withTransaction(async (tx) => {
 *     await tx("INSERT INTO ...", [...]);
 *     await tx("UPDATE ...", [...]);
 *   });
 */
export async function withTransaction(
  fn: (exec: (sql: string, args?: any[]) => Promise<any>) => Promise<void>
): Promise<void> {
  const client = getDb();
  await client.execute("BEGIN");
  try {
    const exec = (sql: string, args: any[] = []) => client.execute({ sql, args });
    await fn(exec);
    await client.execute("COMMIT");
  } catch (err) {
    await client.execute("ROLLBACK");
    throw err;
  }
}
