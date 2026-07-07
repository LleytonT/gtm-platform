import { ProductPricingModel, RepCompModel } from "./pricing-models";
import { SourceRecord } from "./provenance";

export type ThreeTKey = "timing" | "territory" | "talent";

export type ResearchLensId =
  | "people_intel"
  | "review_sites"
  | "team_linkedin"
  | "media_competition"
  | "industry_growth";

export type ResearchSentiment = "positive" | "neutral" | "red_flag";

export interface ResearchFinding {
  text: string;
  sentiment: ResearchSentiment;
  confidence: "high" | "medium" | "emerging";
  feedsThreeT: ThreeTKey[];
}

export interface ResearchLensData {
  /** null ⇒ no sourced data behind this lens — render "insufficient data". */
  score: number | null;
  headline: string;
  findings: ResearchFinding[];
  checklist: string[];
  resources?: { label: string; url: string }[];
}

export interface CompanyResearch {
  lenses: Record<ResearchLensId, ResearchLensData>;
  /** null when no lens has sourced data. */
  diligenceScore: number | null;
}

export type SignalSource =
  | "people_data"
  | "hiring"
  | "funding"
  | "market"
  | "community";

export interface QualitativeSignal {
  text: string;
  source: SignalSource;
  confidence: "high" | "medium" | "emerging";
}

/**
 * Qualitative dimension context — verdict copy and signals only.
 * Numeric dimension scores live exclusively on CompanyScorecard, where every
 * value carries source records.
 */
export interface ThreeTDimension {
  verdict: string;
  signals: QualitativeSignal[];
}

export interface ThreeTs {
  timing: ThreeTDimension;
  territory: ThreeTDimension;
  talent: ThreeTDimension;
}

export type CompanyCategory = "forbes_ai50" | "hyperscaler" | "established";

export type SalesMotion =
  | "enterprise"
  | "mid_market"
  | "smb"
  | "partner_led"
  | "consumption"
  | "hybrid";

export interface Company {
  slug: string;
  name: string;
  logo: string;
  description: string;
  industry: string;
  stage: string;
  headcount: string;
  hq: string;
  founded: number;
  website: string;
  sellsItself: string;
  categories: CompanyCategory[];
  salesMotion: SalesMotion;
  /** How the company charges customers — sourced from public pricing pages. */
  productPricingModel: ProductPricingModel;
  productPricingSource: SourceRecord | null;
  /**
   * How reps are paid — sourced from human submissions only.
   * Defaults to "unknown"; never inferred from the pricing model.
   */
  repCompModel: RepCompModel;
  threeTs: ThreeTs;
  /** Curated background facts — flagged as unverified curation in the UI. */
  financials: {
    revenue: string;
    funding: string;
    runway: string;
    growthRate: string;
    lastRound: string;
    investors: string[];
  };
  pmf: {
    retention: string;
    marketGrowth: string;
    competitivePosition: string;
    signals: string[];
  };
  packages: {
    baseSalary: string;
    ote: string;
    equity: string;
    benefits: string[];
    quota: string;
  };
  hiringRoles: string[];
  gtmTeamSize: string;
  expandingRegions?: string[];
}
