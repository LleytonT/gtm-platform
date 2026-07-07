export type JobBoardProvider = "greenhouse" | "lever" | "ashby";

export type GtmRole = "ae" | "se" | "fde" | "sdr" | "cs" | "partnerships" | "other_gtm";

export type PostingRegion = "anz" | "apac" | "emea" | "amer" | "latam" | "remote" | "unknown";

export interface GtmPosting {
  id: string;
  title: string;
  location: string;
  url: string;
  publishedAt: string | null;
  role: GtmRole;
  region: PostingRegion;
}

export interface CompanyBoardSnapshot {
  provider: JobBoardProvider;
  boardToken: string;
  boardUrl: string;
  totalPostings: number;
  gtmPostings: GtmPosting[];
}

export interface CompanyBoardSummary {
  gtmTotal: number;
  totalPostings: number;
  roleMix: Record<GtmRole, number>;
  regions: Record<PostingRegion, number>;
}

export interface JobBoardHistoryEntry {
  capturedAt: string;
  companies: Record<string, CompanyBoardSummary>;
}

export interface JobBoardCacheFile {
  version: number;
  /** Compact per-run summaries used to compute momentum deltas over time. */
  history: JobBoardHistoryEntry[];
  /** Most recent full snapshot including individual GTM postings. */
  latest: {
    capturedAt: string;
    companies: Record<string, CompanyBoardSnapshot>;
  };
}

export interface BoardConfig {
  companySlug: string;
  provider: JobBoardProvider;
  token: string;
}
