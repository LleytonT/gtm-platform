export interface RepVueCategoryRanking {
  category: string;
  percentile: number;
  industryRank: number;
  industryTotal: number;
}

export interface RepVueRoleCompensation {
  role: string;
  baseUpTo: number | null;
  oteUpTo: number | null;
  topPerformerEarnings: number | null;
  sampleSize: number | null;
  estimated: boolean;
}

export interface RepVueProfile {
  companySlug: string;
  repvueSlug: string;
  name: string;
  canonicalUrl: string;
  website: string | null;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  headcount: number | null;
  fundingStatus: string | null;
  hq: string | null;
  generatedAt: string | null;
  fetchedAt: string;
  repvueScore: number | null;
  overallPercentile: number | null;
  industryPercentile: number | null;
  trend: string | null;
  totalRatings: number | null;
  verifiedPercent: number | null;
  writtenReviews: number | null;
  ratingsLast6Months: number | null;
  lastRatingRecorded: string | null;
  categoryRankings: RepVueCategoryRanking[];
  compensation: RepVueRoleCompensation[];
  quotaAttainmentPublic: boolean;
  attribution: "RepVue (https://www.repvue.com)";
}

export interface RepVueFetchResult {
  ok: true;
  profile: RepVueProfile;
}

export interface RepVueFetchError {
  ok: false;
  companySlug: string;
  triedSlugs: string[];
  message: string;
}

export type RepVueFetchResponse = RepVueFetchResult | RepVueFetchError;

export interface RepVueCacheFile {
  version: 1;
  scrapedAt: string;
  companies: Record<string, RepVueProfile>;
}
