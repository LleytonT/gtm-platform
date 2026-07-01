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

export interface OutreachTemplate {
  id: string;
  type: "email" | "linkedin" | "referral";
  subject?: string;
  body: string;
  context: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  company: string;
  targetRole: string;
  targetCompany: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  objectives: string[];
  talkingPoints: string[];
  objections: string[];
  successCriteria: string[];
}
