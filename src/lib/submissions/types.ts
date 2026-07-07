import type { RepCompModel } from "../pricing";

/**
 * Structured anonymous comp/quota submissions (Levels.fyi model).
 *
 * Verification is lightweight: we store only a SHA-256 hash of a work email
 * (never the address itself) or an invite code. Aggregates render only when
 * n >= 3 for a company-region pair.
 */

export type AttainmentBand =
  | "under_50"
  | "50_75"
  | "75_100"
  | "over_100";

export const ATTAINMENT_BAND_LABELS: Record<AttainmentBand, string> = {
  under_50: "<50% of quota",
  "50_75": "50–75% of quota",
  "75_100": "75–100% of quota",
  over_100: ">100% of quota",
};

/** Midpoints used for aggregate scoring (0–100). */
export const ATTAINMENT_BAND_MIDPOINTS: Record<AttainmentBand, number> = {
  under_50: 35,
  "50_75": 62,
  "75_100": 87,
  over_100: 105,
};

export type SubmissionRole = "ae" | "se_fde" | "sdr" | "cs" | "other";

export interface Submission {
  id: string;
  company: string; // company slug
  region: string; // e.g. "AU", "NZ", "US", "UK", "SG"
  role: SubmissionRole;
  /** e.g. "AU$150k base / AU$300k OTE (50/50)" */
  ote_base_split: string;
  attainment_band: AttainmentBand;
  ramp_months: number;
  comp_model: RepCompModel;
  free_text: string;
  /** SHA-256 hash of the work email, or null when invite-code verified. */
  work_email_hash: string | null;
  invite_code_used: boolean;
  verified: boolean;
  submitted_at: string;
  /** True for illustrative demo rows seeded by the team — always labelled. */
  sample: boolean;
}

export interface SubmissionsFile {
  version: 1;
  submissions: Submission[];
}

export interface SubmissionAggregate {
  company: string;
  region: string;
  n: number;
  /** 0–100 attainment score from band midpoints (capped at 100). */
  attainmentScore: number;
  medianRampMonths: number;
  compModels: Partial<Record<RepCompModel, number>>;
  roles: Partial<Record<SubmissionRole, number>>;
  latestSubmittedAt: string;
  includesSampleData: boolean;
}

export const MIN_AGGREGATE_N = 3;
