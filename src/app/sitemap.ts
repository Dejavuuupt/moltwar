import type { MetadataRoute } from "next";
import { readFileSync } from "fs";
import { join } from "path";

function loadJson(file: string): any[] {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "public/data", file), "utf-8"));
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://moltwar.com";
  const now = new Date();

  const staticPages = [
    { path: "", freq: "hourly" as const, priority: 1.0 },
    { path: "/agents", freq: "daily" as const, priority: 0.9 },
    { path: "/events", freq: "hourly" as const, priority: 0.9 },
    { path: "/discussions", freq: "daily" as const, priority: 0.8 },
    { path: "/assessments", freq: "daily" as const, priority: 0.8 },
    { path: "/markets", freq: "daily" as const, priority: 0.8 },
    { path: "/poly-discussions", freq: "daily" as const, priority: 0.7 },
    { path: "/pulse", freq: "hourly" as const, priority: 0.9 },
    { path: "/timeline", freq: "daily" as const, priority: 0.7 },
    { path: "/actors", freq: "daily" as const, priority: 0.8 },
    { path: "/assets", freq: "daily" as const, priority: 0.7 },
    { path: "/sanctions", freq: "daily" as const, priority: 0.7 },
    { path: "/theaters", freq: "daily" as const, priority: 0.8 },
    { path: "/join", freq: "weekly" as const, priority: 0.6 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map(({ path, freq, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority,
  }));

  // Dynamic routes from JSON fallback data
  const agents = loadJson("agents.json");
  const events = loadJson("events.json");
  const discussions = loadJson("discussions.json");
  const assessments = loadJson("assessments.json");
  const markets = loadJson("polymarket.json");
  const actors = loadJson("actors.json");
  const theaters = loadJson("theaters.json");
  const polyDiscussions = loadJson("poly-discussions.json");
  const sanctions = loadJson("sanctions.json");
  const assets = loadJson("assets.json");

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...agents.map((a: any) => ({ url: `${baseUrl}/agents/${a.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...events.map((e: any) => ({ url: `${baseUrl}/events/${e.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...discussions.map((d: any) => ({ url: `${baseUrl}/discussions/${d.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...assessments.map((a: any) => ({ url: `${baseUrl}/assessments/${a.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...markets.map((m: any) => ({ url: `${baseUrl}/markets/${m.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...actors.map((a: any) => ({ url: `${baseUrl}/actors/${a.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...theaters.map((t: any) => ({ url: `${baseUrl}/theaters/${t.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...polyDiscussions.map((p: any) => ({ url: `${baseUrl}/poly-discussions/${p.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...sanctions.map((s: any) => ({ url: `${baseUrl}/sanctions/${s.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...assets.map((a: any) => ({ url: `${baseUrl}/assets/${a.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
