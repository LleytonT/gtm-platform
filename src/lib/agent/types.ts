import { RoleLens, ThreeTWeights } from "../scoring";

/**
 * User profile for the notification agent.
 * Stored client-side (localStorage) — no account required, and alerts are
 * free: no pay-to-reveal.
 */
export interface UserProfile {
  targetRoles: RoleLens[];
  regions: string[]; // e.g. ["ANZ", "APAC"]
  minStage: "any" | "series_b_plus" | "series_d_plus" | "public";
  compPriorities: ("equity" | "base" | "ote" | "ramp")[];
  weights: ThreeTWeights;
  /** Minimum score movement (points) that triggers a notification. */
  alertThreshold: number;
  /** Email digest first; push later. */
  delivery: "email_digest" | "push";
  email?: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  targetRoles: ["ae"],
  regions: ["ANZ"],
  minStage: "any",
  compPriorities: ["ote"],
  weights: { timing: 50, territory: 30, talent: 20 },
  alertThreshold: 5,
  delivery: "email_digest",
};

export interface AgentMatch {
  companySlug: string;
  companyName: string;
  matchedAt: string;
  kind: "score_change" | "anz_expansion";
  headline: string;
  detail: string;
}

export interface AgentDigest {
  generatedAt: string;
  profileSummary: string;
  matches: AgentMatch[];
}
