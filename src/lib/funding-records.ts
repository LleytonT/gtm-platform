import { SourceRecord } from "./provenance";

/**
 * Manually curated funding/capital records with public press provenance.
 * Only companies with a verifiable public announcement get a record.
 * Companies without one report "insufficient data" for Funding Velocity.
 */
export interface FundingRecord {
  companySlug: string;
  /** e.g. "Series F" or "Public" */
  round: string;
  announcedAt: string; // ISO date of the public announcement
  amountUsd: number | null; // null for public companies
  isPublicCompany: boolean;
  source: SourceRecord;
}

function pressSearch(query: string): string {
  return `https://news.google.com/search?q=${encodeURIComponent(query)}`;
}

const CURATED_AT = "2026-07-01T00:00:00.000Z";

function manualSource(name: string, query: string): SourceRecord {
  return {
    source_name: name,
    url: pressSearch(query),
    retrieved_at: CURATED_AT,
    confidence: "medium",
    method: "manual",
  };
}

export const FUNDING_RECORDS: FundingRecord[] = [
  {
    companySlug: "datadog",
    round: "Public (NASDAQ: DDOG)",
    announcedAt: "2019-09-19",
    amountUsd: null,
    isPublicCompany: true,
    source: manualSource("SEC filings / press", "Datadog IPO NASDAQ DDOG"),
  },
  {
    companySlug: "gong",
    round: "Series E",
    announcedAt: "2021-06-02",
    amountUsd: 250_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Gong Series E $250M 2021"),
  },
  {
    companySlug: "rippling",
    round: "Series F",
    announcedAt: "2024-04-22",
    amountUsd: 200_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Rippling Series F $13.5B 2024"),
  },
  {
    companySlug: "notion",
    round: "Series C",
    announcedAt: "2021-10-08",
    amountUsd: 275_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Notion Series C $275M $10B"),
  },
  {
    companySlug: "clay",
    round: "Series B expansion",
    announcedAt: "2025-01-15",
    amountUsd: 40_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Clay Series B expansion $1.25B valuation"),
  },
  {
    companySlug: "vanta",
    round: "Series C",
    announcedAt: "2024-07-24",
    amountUsd: 150_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Vanta Series C $150M $2.45B"),
  },
  {
    companySlug: "figma",
    round: "Series E",
    announcedAt: "2024-05-16",
    amountUsd: 200_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Figma tender offer $12.5B 2024"),
  },
  {
    companySlug: "mercury",
    round: "Series C",
    announcedAt: "2025-03-26",
    amountUsd: 300_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Mercury Series C $3.5B Sequoia"),
  },
  {
    companySlug: "openai",
    round: "Late-stage round",
    announcedAt: "2025-03-31",
    amountUsd: 40_000_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "OpenAI $40B round $300B valuation"),
  },
  {
    companySlug: "anthropic",
    round: "Series E",
    announcedAt: "2025-03-03",
    amountUsd: 3_500_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Anthropic Series E $3.5B $61.5B"),
  },
  {
    companySlug: "cursor",
    round: "Series C",
    announcedAt: "2025-06-05",
    amountUsd: 900_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Anysphere Cursor $900M $9.9B"),
  },
  {
    companySlug: "databricks",
    round: "Series J",
    announcedAt: "2024-12-17",
    amountUsd: 10_000_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Databricks Series J $10B $62B"),
  },
  {
    companySlug: "harvey",
    round: "Series D",
    announcedAt: "2025-02-12",
    amountUsd: 300_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Harvey Series D $300M $3B"),
  },
  {
    companySlug: "sierra",
    round: "Series B",
    announcedAt: "2025-01-28",
    amountUsd: 175_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Sierra AI $175M $4.5B Bret Taylor"),
  },
  {
    companySlug: "mistral-ai",
    round: "Series B extension",
    announcedAt: "2025-06-24",
    amountUsd: 640_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Mistral AI €600M funding"),
  },
  {
    companySlug: "scale-ai",
    round: "Strategic investment (Meta)",
    announcedAt: "2025-06-12",
    amountUsd: 14_300_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Meta Scale AI $14.3B investment"),
  },
  {
    companySlug: "vercel",
    round: "Series E",
    announcedAt: "2024-05-16",
    amountUsd: 250_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "Vercel Series E $250M $3.25B"),
  },
  {
    companySlug: "xai",
    round: "Series C",
    announcedAt: "2024-12-23",
    amountUsd: 6_000_000_000,
    isPublicCompany: false,
    source: manualSource("Press coverage", "xAI Series C $6B"),
  },
  {
    companySlug: "aws",
    round: "Public (Amazon, NASDAQ: AMZN)",
    announcedAt: "1997-05-15",
    amountUsd: null,
    isPublicCompany: true,
    source: manualSource("SEC filings", "Amazon AWS segment earnings"),
  },
  {
    companySlug: "microsoft-azure",
    round: "Public (NASDAQ: MSFT)",
    announcedAt: "1986-03-13",
    amountUsd: null,
    isPublicCompany: true,
    source: manualSource("SEC filings", "Microsoft Azure earnings"),
  },
  {
    companySlug: "google-cloud",
    round: "Public (Alphabet, NASDAQ: GOOGL)",
    announcedAt: "2004-08-19",
    amountUsd: null,
    isPublicCompany: true,
    source: manualSource("SEC filings", "Google Cloud earnings"),
  },
  {
    companySlug: "oracle-cloud",
    round: "Public (NYSE: ORCL)",
    announcedAt: "1986-03-12",
    amountUsd: null,
    isPublicCompany: true,
    source: manualSource("SEC filings", "Oracle Cloud OCI earnings"),
  },
  {
    companySlug: "ibm-cloud",
    round: "Public (NYSE: IBM)",
    announcedAt: "1916-01-01",
    amountUsd: null,
    isPublicCompany: true,
    source: manualSource("SEC filings", "IBM Cloud earnings"),
  },
];

export function getFundingRecord(slug: string): FundingRecord | undefined {
  return FUNDING_RECORDS.find((r) => r.companySlug === slug);
}
