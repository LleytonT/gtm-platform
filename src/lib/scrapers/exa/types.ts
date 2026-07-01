export interface ExaWorkRole {
  title: string;
  companyName: string;
  location: string | null;
  from: string | null;
  to: string | null;
}

export interface ExaPerson {
  name: string;
  profileUrl: string;
  location: string | null;
  workHistory: ExaWorkRole[];
}

export interface ExaTenureMetrics {
  sampleSize: number;
  avgMonths: number | null;
  under12Months: number;
  over18Months: number;
}

export interface ExaHiringMetrics {
  newHiresLast6Months: number;
  newHiresLast12Months: number;
  totalCurrentGtm: number;
}

export interface ExaPromotionMetrics {
  internalPromotions: number;
  promotionExamples: string[];
}

export interface ExaPedigreeMetrics {
  topPriorEmployers: Array<{ company: string; count: number }>;
  notablePedigrees: string[];
}

export interface ExaCompanySignals {
  companySlug: string;
  companyName: string;
  fetchedAt: string;
  people: ExaPerson[];
  tenure: ExaTenureMetrics;
  hiring: ExaHiringMetrics;
  promotions: ExaPromotionMetrics;
  pedigrees: ExaPedigreeMetrics;
  attribution: "Exa (https://exa.ai)";
}

export interface ExaCacheFile {
  version: 1;
  scrapedAt: string;
  companies: Record<string, ExaCompanySignals>;
}

export interface ExaSearchResultRow {
  title?: string;
  url?: string;
  entities?: Array<{
    type?: string;
    properties?: {
      name?: string;
      firstName?: string;
      lastName?: string;
      location?: string;
      workHistory?: Array<{
        title?: string;
        location?: string;
        dates?: { from?: string | null; to?: string | null };
        company?: { name?: string | null };
      }>;
    };
  }>;
}

export interface ExaSearchResponse {
  results?: ExaSearchResultRow[];
}
