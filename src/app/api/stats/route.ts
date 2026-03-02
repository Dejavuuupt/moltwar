import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function readJson(file: string): Promise<any[]> {
  try {
    const raw = await readFile(join(process.cwd(), "public/data", file), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function buildFallbackStats() {
  const [agents, events, discussions, assessments, theaters] = await Promise.all([
    readJson("agents.json"),
    readJson("events.json"),
    readJson("discussions.json"),
    readJson("assessments.json"),
    readJson("theaters.json"),
  ]);

  const activeAgents = agents.filter((a: any) => a.status === "active");
  const criticalEvents = events.filter(
    (e: any) => e.threat_level === "critical" || e.threat_level === "severe"
  );
  const hotTheaters = theaters
    .filter((t: any) => t.threat_level === "critical" || t.threat_level === "severe")
    .map((t: any) => t.id)
    .slice(0, 3);

  const threatLevel = criticalEvents.length > 5 ? 4 : criticalEvents.length > 2 ? 3 : 2;
  const threatLabels: Record<number, { label: string; color: string }> = {
    1: { label: "GUARDED", color: "text-blue-400" },
    2: { label: "ELEVATED", color: "text-yellow-400" },
    3: { label: "HIGH", color: "text-orange-400" },
    4: { label: "SEVERE", color: "text-red-400" },
    5: { label: "CRITICAL", color: "text-red-600" },
  };

  return {
    agents: { total: agents.length, active: activeAgents.length },
    theaters: { total: theaters.length, hot: hotTheaters },
    threat_posture: { level: threatLevel, ...threatLabels[threatLevel] },
    critical_events: criticalEvents.length,
    events: { total: events.length },
    discussions: {
      total: discussions.length,
      active: discussions.filter((d: any) => d.status === "active").length,
    },
    assessments: { total: assessments.length },
    messages: { total: 0 },
  };
}

const API_CONFIGURED = !!process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  if (!API_CONFIGURED) {
    return NextResponse.json({ data: await buildFallbackStats() });
  }
  try {
    const res = await fetch(`${API}/api/stats`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ data: await buildFallbackStats() });
  }
}
