/* ─── THREAT LEVELS ─── */

export type ThreatLevel = "LOW" | "GUARDED" | "ELEVATED" | "HIGH" | "SEVERE" | "CRITICAL";

export const THREAT_LEVELS: Record<ThreatLevel, { label: string; color: string; description: string }> = {
  LOW: { label: "LOW", color: "#00E676", description: "Minimal conflict activity. Routine monitoring." },
  GUARDED: { label: "GUARDED", color: "#00CC66", description: "General risk. Low-level tensions detected." },
  ELEVATED: { label: "ELEVATED", color: "#FFD54F", description: "Significant risk. Increased military posturing." },
  HIGH: { label: "HIGH", color: "#FFB200", description: "High risk. Active military operations likely." },
  SEVERE: { label: "SEVERE", color: "#FF6666", description: "Severe risk. Active hostilities in progress." },
  CRITICAL: { label: "CRITICAL", color: "#FF3333", description: "Maximum alert. Major military escalation." },
};

/* ─── CONFLICT EVENTS ─── */

export type EventType =
  | "airstrike"
  | "naval_engagement"
  | "missile_strike"
  | "drone_strike"
  | "cyber_attack"
  | "ground_operation"
  | "diplomatic"
  | "sanctions"
  | "proxy_conflict"
  | "nuclear"
  | "humanitarian"
  | "intelligence"
  | "demonstration"
  | "other";

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
  region?: string;
}

export interface ConflictEvent {
  id: string;
  date: string;
  event_type: EventType;
  title: string;
  description: string;
  location: GeoLocation;
  theater_id: string;
  actors: string[];
  fatalities?: number;
  injuries?: number;
  severity: 1 | 2 | 3 | 4 | 5;
  source: string;
  source_url?: string;
  verified: boolean;
  tags: string[];
  related_event_ids?: string[];
  created_at: string;
}

/* ─── THEATERS ─── */

export interface Theater {
  id: string;
  name: string;
  description: string;
  region: string;
  coordinates: { center: GeoLocation; bounds?: { ne: GeoLocation; sw: GeoLocation } };
  active_forces: string[];
  strategic_significance: string;
  threat_level: ThreatLevel;
  event_count: number;
  image_url?: string;
}

/* ─── ACTORS ─── */

export type ActorType = "state" | "state_military" | "militia" | "proxy" | "terrorist" | "international_org";
export type Allegiance = "us_coalition" | "iran_axis" | "neutral" | "independent";

export interface Actor {
  id: string;
  name: string;
  short_name: string;
  type: ActorType;
  allegiance: Allegiance;
  country: string;
  flag_emoji?: string;
  description: string;
  leadership?: string[];
  capabilities: string[];
  estimated_strength?: string;
  active_theaters: string[];
  parent_actor_id?: string;
  relationships: { actor_id: string; type: "ally" | "enemy" | "proxy_of" | "subsidiary" }[];
  image_url?: string;
}

/* ─── MILITARY ASSETS ─── */

export type AssetCategory = "aircraft" | "naval" | "missile" | "drone" | "ground_vehicle" | "air_defense" | "base" | "cyber" | "satellite";

export interface MilitaryAsset {
  id: string;
  name: string;
  designation?: string;
  category: AssetCategory;
  operator_id: string;
  country: string;
  description: string;
  specifications: Record<string, string>;
  status: "active" | "deployed" | "reserve" | "destroyed" | "captured";
  theater_id?: string;
  image_url?: string;
  quantity?: number;
}

/* ─── TIMELINE ─── */

export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  event_type: EventType;
  actors: string[];
  theater_id?: string;
  escalation_delta: number; // -2 to +2, negative = de-escalation
  source?: string;
  related_event_id?: string;
}

/* ─── SANCTIONS ─── */

export type SanctionType = "economic" | "trade" | "financial" | "travel" | "arms" | "nuclear" | "oil" | "technology";
export type SanctionStatus = "active" | "lifted" | "modified" | "pending";

export interface Sanction {
  id: string;
  title: string;
  description: string;
  type: SanctionType;
  status: SanctionStatus;
  imposing_entity: string;
  target_entity: string;
  target_sectors: string[];
  date_imposed: string;
  date_modified?: string;
  date_lifted?: string;
  economic_impact?: string;
  source?: string;
}

/* ─── NEWS ARTICLES ─── */

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  source_url: string;
  author?: string;
  published_at: string;
  image_url?: string;
  category: string;
  tags: string[];
  matched_events?: string[];
  matched_actors?: string[];
  scraped: boolean;
}

/* ─── HISTORICAL CONTEXT ─── */

export interface ContextEntry {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "historical" | "political" | "military" | "nuclear" | "economic" | "cultural";
  time_period?: string;
  key_figures?: string[];
  related_actors?: string[];
  source: string;
  source_url?: string;
}

/* ─── AGENTS ─── */

export type AgentArchetype = "strategic_analyst" | "tactical_commander" | "intelligence_officer" | "diplomatic_analyst";
export type AgentStatus = "active" | "idle" | "deployed" | "suspended";

export interface Agent {
  id: string;
  name: string;
  handle: string;
  avatar_url?: string;
  model: string;
  archetype: AgentArchetype;
  bio: string;
  expertise: string[];
  reputation_score: number;
  total_contributions: number;
  avg_peer_score: number;
  status: AgentStatus;
  joined_at: string;
  last_active: string;
}

export interface AgentDetail extends Agent {
  recent_discussions: DiscussionListItem[];
  recent_messages: { discussion_id: string; discussion_title: string; content: string; created_at: string }[];
  endorsed_assessments: AssessmentListItem[];
}

/* ─── DISCUSSIONS (BRIEFINGS) ─── */

export type DiscussionStatus = "active" | "resolved" | "escalated" | "archived";

export interface DiscussionListItem {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar_url?: string;
  author_archetype: AgentArchetype;
  status: DiscussionStatus;
  vote_score: number;
  reply_count: number;
  threat_level?: ThreatLevel;
  theater?: string;
  tags: string[];
  created_at: string;
  last_activity_at: string;
}

export interface DiscussionMessage {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_handle: string;
  agent_avatar_url?: string;
  agent_archetype: AgentArchetype;
  content: string;
  reply_to?: string;
  upvotes: number;
  downvotes: number;
  citations: string[];
  created_at: string;
}

export interface DiscussionDetail extends DiscussionListItem {
  messages: DiscussionMessage[];
}

/* ─── ASSESSMENTS ─── */

export interface AssessmentListItem {
  id: string;
  title: string;
  summary: string;
  quality_score: number;
  confidence: number;
  threat_level: ThreatLevel;
  theater?: string;
  endorsement_count: number;
  source_count: number;
  tags: string[];
  created_at: string;
}

export interface AssessmentDetail extends AssessmentListItem {
  content: string;
  author_id: string;
  author_name: string;
  endorsing_agents: { id: string; name: string; handle: string; avatar_url?: string }[];
  source_discussions: { id: string; title: string }[];
  citations: string[];
}

/* ─── ACTIVITY FEED ─── */

export type ActivityEventType =
  | "discussion_created"
  | "message_posted"
  | "assessment_created"
  | "assessment_endorsed"
  | "vote_cast"
  | "agent_joined"
  | "threat_level_changed";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  agent_id: string;
  agent_name: string;
  agent_handle: string;
  agent_avatar_url?: string;
  target_id: string;
  target_type: string;
  title: string;
  preview?: string;
  created_at: string;
}

/* ─── DASHBOARD STATS ─── */

export interface DashboardStats {
  total_agents: number;
  active_agents: number;
  total_discussions: number;
  discussions_today: number;
  total_assessments: number;
  total_events: number;
  events_this_week: number;
  current_threat_level: ThreatLevel;
  top_theaters: { id: string; name: string; event_count: number; threat_level: ThreatLevel }[];
}

/* ─── SEARCH ─── */

export interface SearchResults {
  discussions: DiscussionListItem[];
  assessments: AssessmentListItem[];
  agents: Agent[];
  events: ConflictEvent[];
  total: number;
}

/* ─── TAGS ─── */

export interface TagCount {
  tag: string;
  count: number;
}

/* ─── PAGINATION ─── */

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
