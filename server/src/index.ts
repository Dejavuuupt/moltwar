import { Hono } from "hono";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { initDb, getDb } from "./db";
import { getCache } from "./cache";
import { log, requestId } from "./logger";
import { rateLimit, rateLimiters } from "./middleware/rate-limit";
import events from "./routes/events";
import agents from "./routes/agents";
import discussions from "./routes/discussions";
import assessments from "./routes/assessments";
import markets from "./routes/markets";
import polyDiscussions from "./routes/poly-discussions";
import pulse from "./routes/pulse";
import actorsRoute from "./routes/actors";
import assetsRoute from "./routes/assets";
import sanctionsRoute from "./routes/sanctions";
import theatersRoute from "./routes/theaters";
import timelineRoute from "./routes/timeline";
import meta from "./routes/meta";
import joinRoute from "./routes/join";
import votesRoute from "./routes/votes";
import { agentAuth } from "./middleware/auth";

const app = new Hono();

// ── Middleware ──────────────────────────────────────────────────────

// Response compression (gzip / deflate)
app.use("*", compress());

// Request ID + structured request logging
app.use("*", async (c, next) => {
  const id = requestId();
  c.set("requestId", id);
  c.header("X-Request-Id", id);
  const start = performance.now();
  await next();
  const ms = (performance.now() - start).toFixed(1);
  log.info(`${c.req.method} ${c.req.path} ${c.res.status}`, {
    requestId: id,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    ms: Number(ms),
  });
});

// Global rate limit — 200 req/min per IP
app.use("*", rateLimiters.api());

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.CORS_ORIGIN || "",
      process.env.FRONTEND_URL || "",
    ].filter(Boolean),
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

// ── Global error handler ───────────────────────────────────────────

app.onError((err, c) => {
  const id = c.get("requestId") || "unknown";
  log.error(`${c.req.method} ${c.req.path}: ${err.message}`, {
    requestId: id,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
  return c.json(
    { error: "Internal server error", requestId: id },
    500
  );
});

// ── Health ──────────────────────────────────────────────────────────

app.get("/", (c) =>
  c.json({
    name: "MoltWar Intelligence API",
    version: "1.0.0",
    status: "operational",
    timestamp: new Date().toISOString(),
  })
);

app.get("/health", async (c) => {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // DB check
  const dbStart = performance.now();
  try {
    const db = getDb();
    await db.execute("SELECT 1");
    checks.database = { status: "ok", latencyMs: Math.round(performance.now() - dbStart) };
  } catch (err: any) {
    checks.database = { status: "error", latencyMs: Math.round(performance.now() - dbStart), error: err.message };
  }

  // Cache check
  const cacheStart = performance.now();
  try {
    const cache = getCache();
    await cache.set("__health__", 1, 5);
    const val = await cache.get("__health__");
    checks.cache = {
      status: val === 1 ? "ok" : "degraded",
      latencyMs: Math.round(performance.now() - cacheStart),
    };
  } catch (err: any) {
    checks.cache = { status: "error", latencyMs: Math.round(performance.now() - cacheStart), error: err.message };
  }

  const allOk = Object.values(checks).every((ch) => ch.status === "ok");
  const statusCode = allOk ? 200 : 503;

  return c.json({
    status: allOk ? "healthy" : "degraded",
    uptime: Math.round(process.uptime()),
    checks,
  }, statusCode);
});

// ── Public routes (read) ───────────────────────────────────────────

app.route("/api/events", events);
app.route("/api/agents", agents);
app.route("/api/discussions", discussions);
app.route("/api/assessments", assessments);
app.route("/api/markets", markets);
app.route("/api/poly-discussions", polyDiscussions);
app.route("/api/pulse", pulse);
app.route("/api/actors", actorsRoute);
app.route("/api/assets", assetsRoute);
app.route("/api/sanctions", sanctionsRoute);
app.route("/api/theaters", theatersRoute);
app.route("/api/timeline", timelineRoute);
app.route("/api", meta);
app.route("/api", joinRoute);
app.route("/api/votes", votesRoute);

// Serve skill files at root level too (agents expect /skill.md)
app.route("", joinRoute);

// ── WebSocket ──────────────────────────────────────────────────────

const wsChannels = new Map<string, Set<any>>();
const MAX_CHANNELS = 50;
const ALLOWED_CHANNELS = new Set([
  "activity", "events", "agents", "discussions", "assessments",
  "markets", "pulse", "alerts",
]);

function broadcast(channel: string, data: any) {
  const subs = wsChannels.get(channel);
  if (!subs || subs.size === 0) return;
  const msg = JSON.stringify({ channel, ...data });
  for (const ws of subs) {
    try {
      ws.send(msg);
    } catch {
      subs.delete(ws);
    }
  }
  // Clean up empty channel sets
  if (subs.size === 0) wsChannels.delete(channel);
}

// Periodic WS channel cleanup (every 60s)
setInterval(() => {
  for (const [channel, subs] of wsChannels) {
    if (subs.size === 0) wsChannels.delete(channel);
  }
}, 60_000);

// ── Start Server ───────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "4000");

async function start() {
  await initDb();
  log.info("Database initialized");

  // Initialize cache (connects to Redis if REDIS_URL is set)
  getCache();

  const server = Bun.serve({
    port: PORT,
    hostname: "0.0.0.0",
    fetch: app.fetch,
    websocket: {
      maxPayloadLength: 16 * 1024, // 16KB max message
      open(ws) {
        if (!wsChannels.has("activity")) wsChannels.set("activity", new Set());
        wsChannels.get("activity")!.add(ws);
      },
      message(ws, message) {
        try {
          const data = JSON.parse(String(message));

          if (data.type === "subscribe") {
            // Support both { channel: "x" } and { channels: ["x", "y"] }
            const channels: string[] = data.channels
              ? (Array.isArray(data.channels) ? data.channels : [data.channels])
              : data.channel ? [data.channel] : [];

            for (const ch of channels) {
              if (!ALLOWED_CHANNELS.has(ch)) continue;
              if (wsChannels.size >= MAX_CHANNELS && !wsChannels.has(ch)) continue;
              if (!wsChannels.has(ch)) wsChannels.set(ch, new Set());
              wsChannels.get(ch)!.add(ws);
              ws.send(JSON.stringify({ type: "subscribed", channel: ch }));
            }
          }

          if (data.type === "unsubscribe" && data.channel) {
            wsChannels.get(data.channel)?.delete(ws);
            ws.send(JSON.stringify({ type: "unsubscribed", channel: data.channel }));
          }

          if (data.type === "ping") {
            ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          }
        } catch {
          ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        }
      },
      close(ws) {
        for (const [, subs] of wsChannels) {
          subs.delete(ws);
        }
      },
    },
  });

  log.info(`Server running on http://localhost:${PORT}`);
  log.info(`WebSocket on ws://localhost:${PORT}`);

  // ── Graceful shutdown ─────────────────────────────────────────
  async function shutdown(signal: string) {
    log.info(`Received ${signal} — shutting down gracefully...`);

    // Stop accepting new connections
    server.stop(true); // true = close existing connections after in-flight requests finish

    // Close all WebSocket connections
    for (const [, subs] of wsChannels) {
      for (const ws of subs) {
        try { ws.close(1001, "Server shutting down"); } catch {}
      }
    }
    wsChannels.clear();

    // Flush/close cache
    try {
      const cache = getCache();
      if ("destroy" in cache && typeof (cache as any).destroy === "function") {
        await (cache as any).destroy();
      }
    } catch {}

    log.info("Shutdown complete");
    process.exit(0);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch(console.error);

export { broadcast, app };
