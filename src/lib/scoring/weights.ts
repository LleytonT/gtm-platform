import type { GtmRoleClass } from "../jobs/types";
import type { CompanyScorecard } from "./types";

/**
 * User-weighted composite scoring (P1.8) and role-lens re-ranking (P1.10).
 *
 * These functions are pure and run client-side so users can re-weight the
 * composite without a round trip. Weights persist per-user in localStorage
 * (see WeightsProvider).
 */

export interface WeightSet {
  timing: number;
  territory: number;
  talent: number;
}

export type WeightPresetId =
  | "default"
  | "equity_maximizer"
  | "team_quality"
  | "fastest_ramp"
  | "custom";

export interface WeightPreset {
  id: WeightPresetId;
  label: string;
  description: string;
  weights: WeightSet;
}

export const WEIGHT_PRESETS: WeightPreset[] = [
  {
    id: "default",
    label: "Default",
    description: "Timing 50 / Territory 30 / Talent 20 — the classic Three T's.",
    weights: { timing: 50, territory: 30, talent: 20 },
  },
  {
    id: "equity_maximizer",
    label: "Equity maximizer",
    description:
      "Overweights Timing (funding, category heat) for maximum equity upside.",
    weights: { timing: 65, territory: 20, talent: 15 },
  },
  {
    id: "team_quality",
    label: "Team quality first (SE/FDE)",
    description:
      "Overweights Talent — comp structure, enablement, tenure. Pairs with the SE/FDE role lens.",
    weights: { timing: 25, territory: 25, talent: 50 },
  },
  {
    id: "fastest_ramp",
    label: "Fastest ramp",
    description:
      "Overweights Territory — greenfield regions and inbound-heavy patches ramp fastest.",
    weights: { timing: 25, territory: 50, talent: 25 },
  },
];

export const DEFAULT_WEIGHTS: WeightSet = WEIGHT_PRESETS[0].weights;

export function normalizeWeights(weights: WeightSet): WeightSet {
  const total = weights.timing + weights.territory + weights.talent;
  if (total <= 0) return DEFAULT_WEIGHTS;
  return {
    timing: weights.timing / total,
    territory: weights.territory / total,
    talent: weights.talent / total,
  };
}

// ---------------------------------------------------------------------------
// Role lens
// ---------------------------------------------------------------------------

export type RoleLens = "all" | "ae" | "se_fde" | "sdr";

export const ROLE_LENS_LABELS: Record<RoleLens, string> = {
  all: "All roles",
  ae: "AE lens",
  se_fde: "SE / FDE lens",
  sdr: "SDR lens",
};

const LENS_ROLE_CLASS: Record<Exclude<RoleLens, "all">, GtmRoleClass> = {
  ae: "ae",
  se_fde: "se_fde",
  sdr: "sdr",
};

export interface LensAdjustment {
  bonus: number;
  explanation: string | null;
}

/**
 * Role-lens bonus: emphasizes how much of the company's open GTM hiring is
 * in the selected role family (0–10 points), so the ranking shifts toward
 * companies actually investing in that role.
 */
export function computeLensAdjustment(
  scorecard: CompanyScorecard,
  lens: RoleLens
): LensAdjustment {
  if (lens === "all" || !scorecard.roleMix || !scorecard.gtmPostings) {
    return { bonus: 0, explanation: null };
  }
  const roleClass = LENS_ROLE_CLASS[lens];
  const count = scorecard.roleMix[roleClass] ?? 0;
  const share = count / Math.max(1, scorecard.gtmPostings);
  const bonus = Math.min(10, Math.round(share * 25 + (count >= 5 ? 2 : 0)));
  return {
    bonus,
    explanation: `${count} open ${ROLE_LENS_LABELS[lens].replace(" lens", "")} postings (${Math.round(share * 100)}% of GTM hiring) → +${bonus}`,
  };
}

// ---------------------------------------------------------------------------
// Composite
// ---------------------------------------------------------------------------

export interface CompositeResult {
  value: number | null;
  missingDimensions: ("timing" | "territory" | "talent")[];
  lensBonus: number;
  lensExplanation: string | null;
}

/**
 * Weighted composite over the three dimensions. Per P0.4, a composite is
 * only rendered when all three dimensions have source-backed data —
 * otherwise the result is "insufficient data" with the gaps listed.
 */
export function computeComposite(
  scorecard: CompanyScorecard,
  weights: WeightSet,
  lens: RoleLens = "all"
): CompositeResult {
  const dims = scorecard.dimensions;
  const missing = (
    ["timing", "territory", "talent"] as const
  ).filter((key) => dims[key].value == null);

  if (missing.length > 0) {
    return {
      value: null,
      missingDimensions: [...missing],
      lensBonus: 0,
      lensExplanation: null,
    };
  }

  const w = normalizeWeights(weights);
  const base =
    dims.timing.value! * w.timing +
    dims.territory.value! * w.territory +
    dims.talent.value! * w.talent;

  const { bonus, explanation } = computeLensAdjustment(scorecard, lens);
  return {
    value: Math.round(Math.min(99, base + bonus)),
    missingDimensions: [],
    lensBonus: bonus,
    lensExplanation: explanation,
  };
}

export type CompositeVerdict =
  | "On the gravy train"
  | "Building momentum"
  | "Watch closely"
  | "Too early / thin data";

/** Recalibrated verdict bands for the wider 0–100 distribution (P0.5). */
export function getCompositeVerdict(score: number): CompositeVerdict {
  if (score >= 75) return "On the gravy train";
  if (score >= 60) return "Building momentum";
  if (score >= 45) return "Watch closely";
  return "Too early / thin data";
}
