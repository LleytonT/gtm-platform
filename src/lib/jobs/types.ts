export type AtsProvider = "greenhouse" | "lever" | "ashby";

export type GtmRoleClass =
  | "ae"
  | "se_fde"
  | "sdr"
  | "cs"
  | "gtm_leadership"
  | "gtm_other";

export type JobRegion =
  | "AMER"
  | "EMEA"
  | "APAC"
  | "ANZ"
  | "LATAM"
  | "REMOTE"
  | "UNKNOWN";

export interface AtsBoardConfig {
  companySlug: string;
  ats: AtsProvider;
  /** Slug on the ATS (may differ from our company slug). */
  boardSlug: string;
  /** Public, human-visitable board URL. */
  boardUrl: string;
}

export interface JobPosting {
  id: string;
  title: string;
  location: string;
  region: JobRegion;
  /** Whether the location string mentions AU/NZ specifically. */
  isAnz: boolean;
  isGtm: boolean;
  roleClass: GtmRoleClass | null;
  /** ISO date the posting was published/created, when the ATS exposes it. */
  publishedAt: string | null;
  url: string;
}

export interface PriorSnapshotSummary {
  fetchedAt: string;
  totalPostings: number;
  gtmPostings: number;
  gtmByRegion: Record<string, number>;
}

export interface CompanyJobsSnapshot {
  companySlug: string;
  ats: AtsProvider;
  boardSlug: string;
  boardUrl: string;
  fetchedAt: string;
  postings: JobPosting[];
  /** Summary of the previous scrape, used for momentum/decline diffs. */
  priorSnapshot?: PriorSnapshotSummary;
}

export interface JobsCache {
  version: 1;
  scrapedAt: string;
  companies: Record<string, CompanyJobsSnapshot>;
}
