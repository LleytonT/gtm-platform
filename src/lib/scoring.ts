/**
 * User-weighted scoring core (pure/isomorphic — safe for client bundles).
 *
 * The single hard-coded Gravy Train index has been replaced by user-weighted
 * scoring over the three T dimensions, computed from sourced metrics only.
 */
import { SourcedMetric, SourceRecord } from "./provenance";
import { ThreeTKey } from "./types";

export interface ThreeTWeights {
  timing: number;
  territory: number;
  talent: number;
}

export const DEFAULT_WEIGHTS: ThreeTWeights = {
  timing: 50,
  territory: 30,
  talent: 20,
};

export type WeightPresetId =
  | "default"
  | "equity_maximizer"
  | "team_quality"
  | "fastest_ramp"
  | "custom";

export const WEIGHT_PRESETS: {
  id: WeightPresetId;
  label: string;
  description: string;
  weights: ThreeTWeights;
}[] = [
  {
    id: "default",
    label: "Default",
    description: "Timing 50 / Territory 30 / Talent 20 — the classic Three T's.",
    weights: DEFAULT_WEIGHTS,
  },
  {
    id: "equity_maximizer",
    label: "Equity maximizer",
    description:
      "Overweights timing (funding velocity, category momentum) — join before the step-up.",
    weights: { timing: 65, territory: 15, talent: 20 },
  },
  {
    id: "team_quality",
    label: "Team quality first (SE/FDE)",
    description:
      "Overweights talent — team pedigree, tenure, and enablement matter most for technical sellers.",
    weights: { timing: 25, territory: 25, talent: 50 },
  },
  {
    id: "fastest_ramp",
    label: "Fastest ramp",
    description:
      "Overweights territory — greenfield patches and regional expansion mean pipeline from day one.",
    weights: { timing: 30, territory: 50, talent: 20 },
  },
];

export function getPreset(id: WeightPresetId) {
  return WEIGHT_PRESETS.find((p) => p.id === id) ?? WEIGHT_PRESETS[0];
}

export function normalizeWeights(w: ThreeTWeights): ThreeTWeights {
  const total = w.timing + w.territory + w.talent;
  if (total <= 0) return DEFAULT_WEIGHTS;
  return {
    timing: (w.timing / total) * 100,
    territory: (w.territory / total) * 100,
    talent: (w.talent / total) * 100,
  };
}

/* ------------------------------------------------------------------ */
/* Role lenses                                                         */
/* ------------------------------------------------------------------ */

export type RoleLens = "all" | "ae" | "se_fde" | "sdr";

export const ROLE_LENS_META: Record<
  RoleLens,
  { label: string; description: string; weights: ThreeTWeights }
> = {
  all: {
    label: "All roles",
    description: "No role emphasis — your saved weights apply directly.",
    weights: DEFAULT_WEIGHTS,
  },
  ae: {
    label: "AE",
    description:
      "Emphasizes quota reality, funding-backed pipeline investment, and greenfield territory.",
    weights: { timing: 45, territory: 35, talent: 20 },
  },
  se_fde: {
    label: "SE / FDE",
    description:
      "Emphasizes team quality, product-market fit, and technical GTM investment (SE/FDE hiring).",
    weights: { timing: 30, territory: 20, talent: 50 },
  },
  sdr: {
    label: "SDR",
    description:
      "Emphasizes GTM momentum and pipeline investment — fast-growing orgs promote SDRs sooner.",
    weights: { timing: 55, territory: 25, talent: 20 },
  },
};

/** Blend user weights with the active role lens (50/50). */
export function applyRoleLens(
  weights: ThreeTWeights,
  lens: RoleLens
): ThreeTWeights {
  if (lens === "all") return normalizeWeights(weights);
  const lensWeights = ROLE_LENS_META[lens].weights;
  const user = normalizeWeights(weights);
  return normalizeWeights({
    timing: (user.timing + lensWeights.timing) / 2,
    territory: (user.territory + lensWeights.territory) / 2,
    talent: (user.talent + lensWeights.talent) / 2,
  });
}

/* ------------------------------------------------------------------ */
/* Scorecards                                                          */
/* ------------------------------------------------------------------ */

export interface PenaltyRecord {
  dimension: ThreeTKey;
  points: number; // positive number of points subtracted
  reason: string;
  source: SourceRecord;
}

export type ScoreCoverage = "full" | "partial" | "insufficient";

export interface BenchmarkMetrics {
  gtm_momentum: SourcedMetric;
  funding_velocity: SourcedMetric;
  quota_reality: SourcedMetric;
  regional_balance: SourcedMetric;
  pmf_strength: SourcedMetric;
}

/** All computed, sourced metrics for one company. Serializable to clients. */
export interface CompanyScorecard {
  slug: string;
  dimensions: Record<ThreeTKey, SourcedMetric>;
  benchmarks: BenchmarkMetrics;
  penalties: PenaltyRecord[];
  coverage: ScoreCoverage;
  /** Most recent retrieved_at across all sources, or null. */
  lastUpdated: string | null;
}

export interface WeightedScore {
  value: number | null;
  coverage: ScoreCoverage;
}

/**
 * Weighted composite over available (sourced) dimensions.
 * - all 3 dimensions sourced → "full"
 * - 2 of 3 sourced → weights renormalized over available dims → "partial"
 * - fewer → "insufficient" (no number rendered)
 */
export function computeWeightedScore(
  scorecard: CompanyScorecard,
  weights: ThreeTWeights
): WeightedScore {
  const normalized = normalizeWeights(weights);
  const dims: ThreeTKey[] = ["timing", "territory", "talent"];
  const available = dims.filter(
    (d) => scorecard.dimensions[d].value !== null
  );

  if (available.length < 2) {
    return { value: null, coverage: "insufficient" };
  }

  const weightTotal = available.reduce((sum, d) => sum + normalized[d], 0);
  const value = Math.round(
    available.reduce(
      (sum, d) =>
        sum +
        (scorecard.dimensions[d].value as number) *
          (normalized[d] / weightTotal),
      0
    )
  );

  return {
    value: Math.max(0, Math.min(100, value)),
    coverage: available.length === 3 ? "full" : "partial",
  };
}

/* ------------------------------------------------------------------ */
/* Verdicts — recalibrated to the full 0–100 range                     */
/* ------------------------------------------------------------------ */

export type GravyTrainVerdict =
  | "On the gravy train"
  | "Building momentum"
  | "Watch closely"
  | "Too early"
  | "Insufficient data";

export function getVerdict(score: number | null): GravyTrainVerdict {
  if (score === null) return "Insufficient data";
  if (score >= 75) return "On the gravy train";
  if (score >= 55) return "Building momentum";
  if (score >= 35) return "Watch closely";
  return "Too early";
}

export function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 75) return "text-emerald-600";
  if (score >= 55) return "text-blue-600";
  if (score >= 35) return "text-amber-600";
  return "text-red-600";
}

export function getScoreBg(score: number | null): string {
  if (score === null) return "bg-muted/40 border-rule";
  if (score >= 75) return "bg-emerald-50 border-emerald-200";
  if (score >= 55) return "bg-blue-50 border-blue-200";
  if (score >= 35) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function getScoreLabel(score: number | null): string {
  if (score === null) return "Insufficient data";
  if (score >= 75) return "Excellent";
  if (score >= 55) return "Strong";
  if (score >= 35) return "Mixed";
  return "Weak";
}
