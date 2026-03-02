import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * GET /api/data — Unified endpoint returning all platform data from the database.
 * Uses 30s revalidation + per-request timeouts.
 */
export async function GET() {
  const endpoints = [
    ["agents", "/api/agents"],
    ["markets", "/api/markets"],
    ["discussions", "/api/discussions"],
    ["poly_discussions", "/api/poly-discussions"],
    ["assessments", "/api/assessments"],
    ["events", "/api/events"],
    ["pulse", "/api/pulse"],
    ["actors", "/api/actors"],
    ["assets", "/api/assets"],
    ["sanctions", "/api/sanctions"],
    ["theaters", "/api/theaters"],
    ["timeline", "/api/timeline"],
  ] as const;

  try {
    const results = await Promise.allSettled(
      endpoints.map(async ([key, path]) => {
        const res = await fetch(`${API}${path}`, {
          next: { revalidate: 30 },
        });
        if (!res.ok) return { key, data: [] };
        const json = await res.json();
        return { key, data: json.data || json };
      })
    );

    const response: Record<string, any> = {};
    for (const result of results) {
      if (result.status === "fulfilled") {
        const { key, data } = result.value;
        const arr = Array.isArray(data) ? data : [];
        response[key] = { count: arr.length, data: arr };
      }
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
