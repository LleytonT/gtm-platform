/**
 * Benchmark definitions over sourced scorecards (pure/isomorphic).
 *
 * Every benchmark value is read from a CompanyScorecard, where each metric
 * carries source records. Companies without sourced data for a metric are
 * excluded from that ranking and shown as "insufficient data".
 */
import { SourceRecord } from "./provenance";
import {
  CompanyScorecard,
  ThreeTWeights,
  computeWeightedScore,
} from "./scoring";
import { Company, SalesMotion } from "./types";

export type BenchmarkId =
  | "gravy_train"
  | "gtm_momentum"
  | "funding_velocity"
  | "quota_reality"
  | "regional_balance"
  | "pmf_strength";

export interface BenchmarkDefinition {
  id: BenchmarkId;
  label: string;
  shortLabel: string;
  description: string;
  unit: string;
}

export const BENCHMARKS: BenchmarkDefinition[] = [
  {
    id: "gravy_train",
    label: "Gravy Train Index",
    shortLabel: "Gravy Train",
    description:
      "Weighted composite of Timing, Territory, and Talent — weights are yours to set (default 50/30/20). Computed from sourced metrics only.",
    unit: "/100",
  },
  {
    id: "gtm_momentum",
    label: "GTM Momentum",
    shortLabel: "GTM Momentum",
    description:
      "GTM hiring momentum from public Greenhouse/Lever/Ashby job boards: share of GTM postings, volume, and week-over-week change.",
    unit: "/100",
  },
  {
    id: "funding_velocity",
    label: "Funding Velocity",
    shortLabel: "Funding",
    description:
      "Recency and size of the last raise from curated funding records (press-sourced) — signals whether the company can invest in GTM.",
    unit: "/100",
  },
  {
    id: "quota_reality",
    label: "Quota Reality",
    shortLabel: "Quota Reality",
    description:
      "Verified community submissions (n ≥ 3 per company-region) where available; RepVue incentive-comp percentiles as a scraped proxy otherwise.",
    unit: "/100",
  },
  {
    id: "regional_balance",
    label: "Regional Balance",
    shortLabel: "Regional",
    description:
      "Distribution of open GTM postings across AMER/EMEA/APAC/ANZ from public job boards — flags AMER-only orgs vs. genuinely global GTM investment.",
    unit: "/100",
  },
  {
    id: "pmf_strength",
    label: "PMF Strength",
    shortLabel: "PMF",
    description:
      "Product-market fit percentile from RepVue's verified sales-rep ratings.",
    unit: "/100",
  },
];

export function getBenchmarkById(id: BenchmarkId): BenchmarkDefinition {
  return BENCHMARKS.find((b) => b.id === id)!;
}

/** A company paired with its sourced scorecard — serializable to clients. */
export interface ScoredCompany {
  company: Company;
  scorecard: CompanyScorecard;
  /** Any active "Expanding into ANZ" detector signal. */
  anzExpanding: boolean;
}

export function getBenchmarkValue(
  scorecard: CompanyScorecard,
  id: BenchmarkId,
  weights: ThreeTWeights
): { value: number | null; sources: SourceRecord[] } {
  if (id === "gravy_train") {
    const weighted = computeWeightedScore(scorecard, weights);
    const sources = (["timing", "territory", "talent"] as const).flatMap(
      (d) => scorecard.dimensions[d].sources
    );
    return { value: weighted.value, sources };
  }
  return scorecard.benchmarks[id];
}

export interface RankedEntry {
  company: Company;
  scorecard: CompanyScorecard;
  value: number;
  rank: number;
}

/**
 * Rank companies on a benchmark. Companies with no sourced value are
 * excluded (they render as "insufficient data" elsewhere, never as 0).
 */
export function rankScorecards(
  items: ScoredCompany[],
  benchmarkId: BenchmarkId,
  weights: ThreeTWeights,
  limit = 15
): { ranked: RankedEntry[]; insufficient: number } {
  const withValues = items.flatMap((item) => {
    const { value } = getBenchmarkValue(item.scorecard, benchmarkId, weights);
    return value === null
      ? []
      : [{ company: item.company, scorecard: item.scorecard, value }];
  });

  withValues.sort((a, b) => b.value - a.value);

  return {
    ranked: withValues
      .slice(0, limit)
      .map((entry, i) => ({ ...entry, rank: i + 1 })),
    insufficient: items.length - withValues.length,
  };
}

export const SALES_MOTION_LABELS: Record<SalesMotion, string> = {
  enterprise: "Enterprise direct",
  mid_market: "Mid-market",
  smb: "SMB / velocity",
  partner_led: "Partner-led",
  consumption: "Consumption-based",
  hybrid: "Hybrid motion",
};
