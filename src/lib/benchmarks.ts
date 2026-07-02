import { Company } from "./types";

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
  getValue: (company: Company) => number;
  higherIsBetter: boolean;
}

export const BENCHMARKS: BenchmarkDefinition[] = [
  {
    id: "gravy_train",
    label: "Gravy Train Index",
    shortLabel: "Gravy Train",
    description:
      "Composite score: Timing (50%) + Territory (30%) + Talent (20%). Where the product sells itself.",
    unit: "/100",
    getValue: (c) => c.gravyTrainScore,
    higherIsBetter: true,
  },
  {
    id: "gtm_momentum",
    label: "GTM Momentum",
    shortLabel: "GTM Momentum",
    description:
      "LinkedIn-derived signal: GTM headcount growth, new hires, and sales leadership additions.",
    unit: "/100",
    getValue: (c) => c.benchmarks.gtmMomentum,
    higherIsBetter: true,
  },
  {
    id: "funding_velocity",
    label: "Funding Velocity",
    shortLabel: "Funding",
    description:
      "Recent raises, valuation step-ups, and runway — signals whether the company can invest in GTM.",
    unit: "/100",
    getValue: (c) => c.benchmarks.fundingVelocity,
    higherIsBetter: true,
  },
  {
    id: "quota_reality",
    label: "Quota Reality",
    shortLabel: "Quota Reality",
    description:
      "Proxy for rep success: quota attainment rates, ramp time, and comp accuracy from review sites.",
    unit: "/100",
    getValue: (c) => c.benchmarks.quotaReality,
    higherIsBetter: true,
  },
  {
    id: "regional_balance",
    label: "Regional Balance",
    shortLabel: "Regional",
    description:
      "AMER vs APAC vs EMEA GTM health — flags growing AMER with contracting international teams.",
    unit: "/100",
    getValue: (c) => c.benchmarks.regionalBalance,
    higherIsBetter: true,
  },
  {
    id: "pmf_strength",
    label: "PMF Strength",
    shortLabel: "PMF",
    description:
      "Product-market fit signals: NPS, retention, competitive position, and market growth tailwinds.",
    unit: "/100",
    getValue: (c) => c.benchmarks.pmfStrength,
    higherIsBetter: true,
  },
];

export function getBenchmarkById(id: BenchmarkId): BenchmarkDefinition {
  return BENCHMARKS.find((b) => b.id === id)!;
}

export function rankCompanies(
  companies: Company[],
  benchmarkId: BenchmarkId,
  limit = 15
): { company: Company; value: number; rank: number }[] {
  const benchmark = getBenchmarkById(benchmarkId);
  const sorted = [...companies].sort((a, b) => {
    const diff = benchmark.getValue(b) - benchmark.getValue(a);
    return benchmark.higherIsBetter ? diff : -diff;
  });

  return sorted.slice(0, limit).map((company, i) => ({
    company,
    value: benchmark.getValue(company),
    rank: i + 1,
  }));
}

export const SALES_MOTION_LABELS: Record<Company["salesMotion"], string> = {
  enterprise: "Enterprise direct",
  mid_market: "Mid-market",
  smb: "SMB / velocity",
  partner_led: "Partner-led",
  consumption: "Consumption-based",
  hybrid: "Hybrid motion",
};

export const COMP_MODEL_LABELS: Record<Company["compModel"], string> = {
  booking: "Booking-based",
  consumption: "Consumption-based",
  hybrid: "Hybrid comp",
};
