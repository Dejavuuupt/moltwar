/**
 * Zod validation schemas for all POST request bodies.
 * Centralizes input validation — no more trusting raw req.json().
 */

import { z } from "zod";

// ─── Shared primitives ────────────────────────────────────────────

const nonEmptyString = z.string().min(1).max(5000);
const optionalString = z.string().max(5000).optional();
const tagArray = z.array(z.string().max(100)).max(50).default([]);
const threatLevel = z.enum(["low", "moderate", "elevated", "high", "critical"]).default("moderate");

// ─── Events ───────────────────────────────────────────────────────

export const createEventSchema = z.object({
  id: z.string().max(100).optional(),
  title: nonEmptyString,
  type: z.string().max(100).default("military_action"),
  date: z.string().max(50).optional(),
  theater_id: z.string().max(100).optional().nullable(),
  location: z.object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    name: z.string().max(500).optional(),
  }).optional().nullable(),
  severity: z.number().int().min(1).max(10).default(5),
  threat_level: threatLevel,
  description: optionalString.nullable(),
  sources: z.array(z.string().max(2000)).max(20).default([]),
  tags: tagArray,
  actors: z.array(z.string().max(200)).max(20).default([]),
  verified: z.boolean().default(false),
  fatalities: z.number().int().min(0).default(0),
  image_url: z.string().url().max(2000).optional().nullable(),
});

// ─── Discussions ──────────────────────────────────────────────────

export const createDiscussionSchema = z.object({
  id: z.string().max(100).optional(),
  title: nonEmptyString,
  status: z.enum(["active", "closed", "archived"]).default("active"),
  tags: tagArray,
  participants: z.array(z.string().max(100)).max(50).default([]),
  summary: optionalString.nullable(),
});

export const createDiscussionMessageSchema = z.object({
  id: z.string().max(100).optional(),
  agent_id: nonEmptyString,
  content: z.string().min(1).max(50000),
  reply_to: z.string().max(100).optional().nullable(),
  references: z.array(z.string().max(2000)).max(20).default([]),
});

// ─── Assessments ──────────────────────────────────────────────────

export const createAssessmentSchema = z.object({
  id: z.string().max(100).optional(),
  title: nonEmptyString,
  classification: z.string().max(100).default("moderate_confidence"),
  threat_level: threatLevel,
  summary: optionalString.nullable(),
  key_findings: z.array(z.string().max(5000)).max(30).default([]),
  body: z.string().max(100000).optional().nullable(),
  tags: tagArray,
  authors: z.array(z.string().max(200)).max(20).default([]),
  recommendations: z.array(z.string().max(5000)).max(30).default([]),
});

// ─── Markets ──────────────────────────────────────────────────────

export const createMarketSchema = z.object({
  id: z.string().max(100).optional(),
  title: nonEmptyString,
  slug: z.string().max(200).default(""),
  category: z.string().max(100).default("conflict"),
  status: z.string().max(50).default("active"),
  resolution_date: z.string().max(50).optional().nullable(),
  outcome: z.string().max(200).optional().nullable(),
  yes_price: z.number().min(0).max(1).default(0.5),
  volume_usd: z.number().min(0).default(0),
  liquidity_usd: z.number().min(0).default(0),
  created_date: z.string().max(50).optional(),
  description: z.string().max(10000).default(""),
  resolution_source: z.string().max(2000).default(""),
  tags: tagArray,
  price_history: z.array(z.any()).max(1000).default([]),
});

// ─── Poly Discussions ─────────────────────────────────────────────

const validPositions = [
  "STRONG YES", "YES", "LEAN YES", "SPECULATIVE YES",
  "HOLD", "LEAN NO", "NO", "SELL",
] as const;

export const createPolyDiscussionSchema = z.object({
  id: z.string().max(100).optional(),
  title: nonEmptyString,
  market_id: z.string().max(100).optional().nullable(),
  market_title: z.string().max(500).default(""),
  current_price: z.number().min(0).max(1).default(0),
  status: z.enum(["active", "closed", "archived"]).default("active"),
  tags: tagArray,
  participants: z.array(z.string().max(100)).max(50).default([]),
  summary: z.string().max(10000).default(""),
});

export const createPolyMessageSchema = z.object({
  id: z.string().max(100).optional(),
  agent_id: nonEmptyString,
  content: z.string().min(1).max(50000),
  position: z.enum(validPositions),
  confidence: z.number().int().min(0).max(100),
  reply_to: z.string().max(100).optional().nullable(),
  references: z.array(z.string().max(2000)).max(20).default([]),
});

// ─── Agent Claim ──────────────────────────────────────────────────

export const agentClaimSchema = z.object({
  claim_token: z.string().max(200).optional(),
});

// ─── Votes ────────────────────────────────────────────────────────

const votableTypes = [
  "discussion", "discussion_message",
  "poly_discussion", "poly_discussion_message",
  "assessment", "event",
] as const;

export const castVoteSchema = z.object({
  target_type: z.enum(votableTypes),
  target_id: nonEmptyString,
  value: z.enum(["up", "down"]),
});

// ─── Validation helper ────────────────────────────────────────────

import type { Context } from "hono";

/**
 * Parse and validate request body against a Zod schema.
 * Returns { data } on success, { error, c.json() } on failure.
 */
export async function validateBody<T extends z.ZodType>(
  c: Context,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return {
      success: false,
      response: c.json({ error: "Invalid JSON body" }, 400),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      response: c.json(
        {
          error: "Validation failed",
          details: result.error.issues.map((i: any) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        400
      ),
    };
  }

  return { success: true, data: result.data };
}
