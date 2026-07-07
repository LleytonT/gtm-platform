import type { MetricSource } from "../provenance";
import type { GtmRoleClass, JobRegion } from "../jobs/types";
import type { ProductPricingModel, RepCompModel } from "../pricing";

/** A single signed contribution to a score, with provenance. */
export interface ScoreContribution {
  label: string;
  delta: number;
  sources: MetricSource[];
}

/**
 * A computed dimension/benchmark score. `value: null` means insufficient
 * data — the UI must render "insufficient data", never a synthesized number.
 */
export interface DimensionScore {
  value: number | null;
  sources: MetricSource[];
  contributions: ScoreContribution[];
  insufficientReason?: string;
}

export type BenchmarkKey =
  | "gtm_momentum"
  | "funding_velocity"
  | "quota_reality"
  | "regional_balance"
  | "pmf_strength";

export interface AnzDetection {
  detector:
    | "first_au_job_posting"
    | "au_entity_registration"
    | "first_au_gtm_hire"
    | "au_event_presence";
  label: string;
  detail: string;
  date: string | null;
  sources: MetricSource[];
}

export interface CompanyScorecard {
  companySlug: string;
  dimensions: {
    timing: DimensionScore;
    territory: DimensionScore;
    talent: DimensionScore;
  };
  benchmarks: Record<BenchmarkKey, DimensionScore>;
  roleMix: Record<GtmRoleClass, number> | null;
  gtmPostings: number | null;
  gtmByRegion: Partial<Record<JobRegion, number>> | null;
  jobBoardUrl: string | null;
  anzDetections: AnzDetection[];
  productPricing: {
    model: ProductPricingModel;
    sources: MetricSource[];
  } | null;
  repCompModel: {
    model: RepCompModel;
    sources: MetricSource[];
    fromSampleData: boolean;
  };
  /** Latest retrieved_at across every source backing this scorecard. */
  lastUpdated: string | null;
}
