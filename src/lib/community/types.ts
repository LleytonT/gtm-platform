import { RepCompModel } from "../pricing-models";

export type AttainmentBand = "under_40" | "40_70" | "70_100" | "over_100";

export const ATTAINMENT_BAND_LABELS: Record<AttainmentBand, string> = {
  under_40: "Under 40% of quota",
  "40_70": "40–70% of quota",
  "70_100": "70–100% of quota",
  over_100: "Over 100% of quota",
};

/** Midpoint attainment percentage used for aggregation. */
export const ATTAINMENT_BAND_MIDPOINT: Record<AttainmentBand, number> = {
  under_40: 25,
  "40_70": 55,
  "70_100": 85,
  over_100: 110,
};

export type SubmissionRegion = "ANZ" | "APAC" | "AMER" | "EMEA" | "LATAM";

export type SubmissionRole = "AE" | "SE" | "FDE" | "SDR" | "CS" | "Other GTM";

export interface CommunitySubmission {
  id: string;
  companySlug: string;
  region: SubmissionRegion;
  role: SubmissionRole;
  oteUsd: number;
  baseUsd: number;
  attainmentBand: AttainmentBand;
  rampMonths: number;
  compModel: Exclude<RepCompModel, "unknown">;
  freeText: string;
  verification: {
    method: "work_email_hash" | "invite_code";
    /** SHA-256 of the work email — the raw email is never stored. */
    hash: string;
    /** Email domain only, kept for dedupe/aggregation trust checks. */
    emailDomain?: string;
  };
  submittedAt: string;
}

/** Minimum submissions per company-region before aggregates are shown. */
export const MIN_SAMPLE_SIZE = 3;

export interface SubmissionAggregate {
  companySlug: string;
  region: SubmissionRegion;
  n: number;
  medianOteUsd: number;
  medianBaseUsd: number;
  avgAttainmentPct: number;
  avgRampMonths: number;
  compModelConsensus: RepCompModel;
  latestSubmittedAt: string;
}
