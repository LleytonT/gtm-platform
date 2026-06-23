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
  overallScore: number;
  hiringRoles: string[];
  gtmTeamSize: string;
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
