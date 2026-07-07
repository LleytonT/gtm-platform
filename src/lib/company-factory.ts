import {
  Company,
  CompanyCategory,
  QualitativeSignal,
  SalesMotion,
  SignalSource,
  ThreeTs,
} from "./types";
import { getProductPricingModel } from "./pricing-models";

/* ------------------------------------------------------------------ */
/* Legacy input shapes                                                  */
/*                                                                      */
/* Older curated data files carried hand-set numeric scores (three T    */
/* scores, benchmark values, financial/PMF/package scores, NPS, quota   */
/* attainment) with no source records. Those numbers are STRIPPED here  */
/* and never reach the UI — all rendered scores now come from           */
/* CompanyScorecard, which requires provenance per metric.              */
/* ------------------------------------------------------------------ */

type LegacySignalSource = SignalSource | "linkedin";

interface LegacySignal {
  text: string;
  source: LegacySignalSource;
  confidence: QualitativeSignal["confidence"];
}

interface LegacyDimension {
  /** @deprecated hand-set score — ignored. */
  score?: number;
  verdict: string;
  signals: LegacySignal[];
}

export interface LegacyThreeTs {
  timing: LegacyDimension;
  territory: LegacyDimension;
  talent: LegacyDimension;
}

/** @deprecated hand-set benchmark values — ignored. */
export interface LegacyBenchmarks {
  gtmMomentum: number;
  fundingVelocity: number;
  regionalBalance: number;
  quotaReality: number;
  pmfStrength: number;
}

export interface CompanySeed {
  slug: string;
  name: string;
  website: string;
  description: string;
  industry: string;
  stage: string;
  headcount: string;
  hq: string;
  founded: number;
  sellsItself: string;
  categories: CompanyCategory[];
  salesMotion: SalesMotion;
  /** @deprecated rep comp model comes from human submissions only. */
  compModel?: string;
  /** @deprecated hand-set values — ignored (scores come from scorecards). */
  benchmarks?: LegacyBenchmarks;
  threeTs: LegacyThreeTs;
  financials: {
    /** @deprecated hand-set score — ignored. */
    score?: number;
    revenue: string;
    funding: string;
    runway: string;
    growthRate: string;
    lastRound: string;
    investors: string[];
  };
  pmf: {
    /** @deprecated hand-set score — ignored. */
    score?: number;
    /** @deprecated unsourced number — ignored. */
    nps?: number;
    retention: string;
    marketGrowth: string;
    competitivePosition: string;
    signals: string[];
  };
  packages: {
    /** @deprecated hand-set score — ignored. */
    score?: number;
    baseSalary: string;
    ote: string;
    equity: string;
    benefits: string[];
    quota: string;
    /** @deprecated unsourced attainment claim — ignored (see Quota Reality). */
    quotaAttainment?: string;
  };
  hiringRoles: string[];
  gtmTeamSize: string;
  expandingRegions?: string[];
}

function normalizeSignal(signal: LegacySignal): QualitativeSignal {
  return {
    text: signal.text,
    // "linkedin" signals predate the no-LinkedIn-scraping policy; they are
    // relabeled as licensed people-data signals.
    source: signal.source === "linkedin" ? "people_data" : signal.source,
    confidence: signal.confidence,
  };
}

function normalizeThreeTs(legacy: LegacyThreeTs): ThreeTs {
  return {
    timing: {
      verdict: legacy.timing.verdict,
      signals: legacy.timing.signals.map(normalizeSignal),
    },
    territory: {
      verdict: legacy.territory.verdict,
      signals: legacy.territory.signals.map(normalizeSignal),
    },
    talent: {
      verdict: legacy.talent.verdict,
      signals: legacy.talent.signals.map(normalizeSignal),
    },
  };
}

function logoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}

export function seedToCompany(seed: CompanySeed): Company {
  const pricing = getProductPricingModel(seed.slug);
  return {
    slug: seed.slug,
    name: seed.name,
    logo: logoUrl(new URL(seed.website).hostname.replace(/^www\./, "")),
    description: seed.description,
    industry: seed.industry,
    stage: seed.stage,
    headcount: seed.headcount,
    hq: seed.hq,
    founded: seed.founded,
    website: seed.website,
    sellsItself: seed.sellsItself,
    categories: seed.categories,
    salesMotion: seed.salesMotion,
    productPricingModel: pricing.model,
    productPricingSource: pricing.source,
    // Rep comp model is sourced from verified human submissions only —
    // resolved at render time via community aggregates, "unknown" otherwise.
    repCompModel: "unknown",
    threeTs: normalizeThreeTs(seed.threeTs),
    financials: {
      revenue: seed.financials.revenue,
      funding: seed.financials.funding,
      runway: seed.financials.runway,
      growthRate: seed.financials.growthRate,
      lastRound: seed.financials.lastRound,
      investors: seed.financials.investors,
    },
    pmf: {
      retention: seed.pmf.retention,
      marketGrowth: seed.pmf.marketGrowth,
      competitivePosition: seed.pmf.competitivePosition,
      signals: seed.pmf.signals,
    },
    packages: {
      baseSalary: seed.packages.baseSalary,
      ote: seed.packages.ote,
      equity: seed.packages.equity,
      benefits: seed.packages.benefits,
      quota: seed.packages.quota,
    },
    hiringRoles: seed.hiringRoles,
    gtmTeamSize: seed.gtmTeamSize,
    expandingRegions: seed.expandingRegions,
  };
}

/**
 * Legacy helper retained for seed-file compatibility. The numeric arguments
 * were hand-set dimension scores; they are intentionally discarded.
 */
export function makeThreeTs(
  _timing: number,
  _territory: number,
  _talent: number,
  verdicts: { timing: string; territory: string; talent: string }
): LegacyThreeTs {
  return {
    timing: {
      verdict: verdicts.timing,
      signals: [{ text: verdicts.timing, source: "market", confidence: "high" }],
    },
    territory: {
      verdict: verdicts.territory,
      signals: [
        { text: verdicts.territory, source: "hiring", confidence: "medium" },
      ],
    },
    talent: {
      verdict: verdicts.talent,
      signals: [
        { text: verdicts.talent, source: "hiring", confidence: "medium" },
      ],
    },
  };
}
