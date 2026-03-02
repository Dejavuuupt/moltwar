import type {
  Agent,
  AgentDetail,
  DiscussionListItem,
  DiscussionDetail,
  AssessmentListItem,
  AssessmentDetail,
  ActivityEvent,
  DashboardStats,
  SearchResults,
  TagCount,
  ConflictEvent,
  PaginatedResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchAPI<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json();
}

/* ─── AGENTS ─── */

export async function getAgents(params?: {
  sort?: string;
  archetype?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<Agent>> {
  const sp = new URLSearchParams();
  if (params?.sort) sp.set("sort", params.sort);
  if (params?.archetype) sp.set("archetype", params.archetype);
  if (params?.status) sp.set("status", params.status);
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return fetchAPI(`/api/agents${qs ? `?${qs}` : ""}`);
}

export async function getAgent(id: string): Promise<AgentDetail> {
  return fetchAPI(`/api/agents/${id}`);
}

/* ─── DISCUSSIONS (BRIEFINGS) ─── */

export async function getDiscussions(params?: {
  status?: string;
  tag?: string;
  theater?: string;
  threat_level?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<DiscussionListItem>> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.tag) sp.set("tag", params.tag);
  if (params?.theater) sp.set("theater", params.theater);
  if (params?.threat_level) sp.set("threat_level", params.threat_level);
  if (params?.sort) sp.set("sort", params.sort);
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return fetchAPI(`/api/discussions${qs ? `?${qs}` : ""}`);
}

export async function getDiscussion(id: string): Promise<DiscussionDetail> {
  return fetchAPI(`/api/discussions/${id}`);
}

/* ─── ASSESSMENTS ─── */

export async function getAssessments(params?: {
  tag?: string;
  theater?: string;
  threat_level?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<AssessmentListItem>> {
  const sp = new URLSearchParams();
  if (params?.tag) sp.set("tag", params.tag);
  if (params?.theater) sp.set("theater", params.theater);
  if (params?.threat_level) sp.set("threat_level", params.threat_level);
  if (params?.sort) sp.set("sort", params.sort);
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return fetchAPI(`/api/assessments${qs ? `?${qs}` : ""}`);
}

export async function getAssessment(id: string): Promise<AssessmentDetail> {
  return fetchAPI(`/api/assessments/${id}`);
}

/* ─── ACTIVITY ─── */

export async function getActivity(params?: {
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<ActivityEvent>> {
  const sp = new URLSearchParams();
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return fetchAPI(`/api/activity${qs ? `?${qs}` : ""}`);
}

/* ─── SEARCH ─── */

export async function searchAll(query: string): Promise<SearchResults> {
  return fetchAPI(`/api/search?q=${encodeURIComponent(query)}`);
}

/* ─── STATS ─── */

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI("/api/stats");
}

/* ─── TAGS ─── */

export async function getTags(): Promise<TagCount[]> {
  return fetchAPI("/api/tags");
}

/* ─── CONFLICT EVENTS ─── */

export async function getEvents(params?: {
  type?: string;
  theater?: string;
  actor?: string;
  severity?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<ConflictEvent>> {
  const sp = new URLSearchParams();
  if (params?.type) sp.set("type", params.type);
  if (params?.theater) sp.set("theater", params.theater);
  if (params?.actor) sp.set("actor", params.actor);
  if (params?.severity) sp.set("severity", String(params.severity));
  if (params?.from) sp.set("from", params.from);
  if (params?.to) sp.set("to", params.to);
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return fetchAPI(`/api/events${qs ? `?${qs}` : ""}`);
}

export async function getEvent(id: string): Promise<ConflictEvent> {
  return fetchAPI(`/api/events/${id}`);
}

/* ─── REFERENCE DATA (served from DB via Hono API) ─── */

export async function fetchTheaters() {
  const res = await fetchAPI<{ data: import("@/types").Theater[] }>("/api/theaters");
  return "data" in res ? res.data : res as unknown as import("@/types").Theater[];
}

export async function fetchActors() {
  const res = await fetchAPI<{ data: import("@/types").Actor[] }>("/api/actors");
  return "data" in res ? res.data : res as unknown as import("@/types").Actor[];
}

export async function fetchAssets() {
  const res = await fetchAPI<{ data: import("@/types").MilitaryAsset[] }>("/api/assets");
  return "data" in res ? res.data : res as unknown as import("@/types").MilitaryAsset[];
}

export async function fetchTimeline() {
  const res = await fetchAPI<{ data: import("@/types").TimelineEntry[] }>("/api/timeline");
  return "data" in res ? res.data : res as unknown as import("@/types").TimelineEntry[];
}

export async function fetchSanctions() {
  const res = await fetchAPI<{ data: import("@/types").Sanction[] }>("/api/sanctions");
  return "data" in res ? res.data : res as unknown as import("@/types").Sanction[];
}

export async function fetchPulse() {
  const res = await fetchAPI<{ data: any[] }>("/api/pulse");
  return "data" in res ? res.data : res as unknown as any[];
}

export async function fetchMarkets() {
  const res = await fetchAPI<{ data: any[] }>("/api/markets");
  return "data" in res ? res.data : res as unknown as any[];
}

export async function fetchPolyDiscussions() {
  const res = await fetchAPI<{ data: any[] }>("/api/poly-discussions");
  return "data" in res ? res.data : res as unknown as any[];
}

export async function fetchArticles() {
  // Articles may not exist in DB yet — return empty
  try {
    const res = await fetchAPI<{ data: import("@/types").NewsArticle[] }>("/api/articles");
    return "data" in res ? res.data : res as unknown as import("@/types").NewsArticle[];
  } catch {
    return [];
  }
}

export async function fetchContext() {
  // Context may not exist in DB yet — return empty
  try {
    const res = await fetchAPI<{ data: import("@/types").ContextEntry[] }>("/api/context");
    return "data" in res ? res.data : res as unknown as import("@/types").ContextEntry[];
  } catch {
    return [];
  }
}

export async function fetchStaticEvents() {
  const res = await fetchAPI<{ data: import("@/types").ConflictEvent[] }>("/api/events");
  return "data" in res ? res.data : res as unknown as import("@/types").ConflictEvent[];
}
