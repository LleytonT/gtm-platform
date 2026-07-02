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
  score: number;
  headline: string;
  findings: ResearchFinding[];
  checklist: string[];
  resources?: { label: string; url: string }[];
}

export interface CompanyResearch {
  lenses: Record<ResearchLensId, ResearchLensData>;
  diligenceScore: number;
}

export type SignalSource =
  | "linkedin"
  | "hiring"
  | "funding"
  | "market"
  | "community";

export type GravyTrainVerdict =
  | "On the gravy train"
  | "Building momentum"
  | "Watch closely"
  | "Too early";

export interface QualitativeSignal {
  text: string;
  source: SignalSource;
  confidence: "high" | "medium" | "emerging";
}

export interface ThreeTDimension {
  score: number;
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

export type CompModel = "booking" | "consumption" | "hybrid";

export interface GtmBenchmarks {
  gtmMomentum: number;
  fundingVelocity: number;
  regionalBalance: number;
  quotaReality: number;
  pmfStrength: number;
}

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
  compModel: CompModel;
  benchmarks: GtmBenchmarks;
  threeTs: ThreeTs;
  gravyTrainScore: number;
  gravyTrainVerdict: GravyTrainVerdict;
  financials: {
    score: number;
    revenue: string;
    funding: string;
    runway: string;
    growthRate: string;
    lastRound: string;
    investors: string[];
  };
  pmf: {
    score: number;
    nps: number;
    retention: string;
    marketGrowth: string;
    competitivePosition: string;
    signals: string[];
  };
  packages: {
    score: number;
    baseSalary: string;
    ote: string;
    equity: string;
    benefits: string[];
    quota: string;
    quotaAttainment: string;
  };
  hiringRoles: string[];
  gtmTeamSize: string;
  expandingRegions?: string[];
}

export type NotableActivityType =
  | "funding"
  | "hiring"
  | "expansion"
  | "leadership"
  | "product"
  | "contraction";

export interface NotableActivity {
  id: string;
  date: string;
  companySlug: string;
  companyName: string;
  type: NotableActivityType;
  headline: string;
  detail: string;
  impact: "positive" | "neutral" | "negative";
  feedsThreeT: ThreeTKey[];
}
