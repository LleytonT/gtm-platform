import {
  CompanyBoardSnapshot,
  CompanyBoardSummary,
  GtmRole,
  JobBoardCacheFile,
  PostingRegion,
} from "./types";

export const GTM_ROLES: GtmRole[] = [
  "ae",
  "se",
  "fde",
  "sdr",
  "cs",
  "partnerships",
  "other_gtm",
];

export const POSTING_REGIONS: PostingRegion[] = [
  "anz",
  "apac",
  "emea",
  "amer",
  "latam",
  "remote",
  "unknown",
];

export function summarizeSnapshot(
  snapshot: CompanyBoardSnapshot
): CompanyBoardSummary {
  const roleMix = Object.fromEntries(GTM_ROLES.map((r) => [r, 0])) as Record<
    GtmRole,
    number
  >;
  const regions = Object.fromEntries(
    POSTING_REGIONS.map((r) => [r, 0])
  ) as Record<PostingRegion, number>;

  for (const posting of snapshot.gtmPostings) {
    roleMix[posting.role] += 1;
    regions[posting.region] += 1;
  }

  return {
    gtmTotal: snapshot.gtmPostings.length,
    totalPostings: snapshot.totalPostings,
    roleMix,
    regions,
  };
}

export interface GtmMomentumSignal {
  /** Current number of open GTM postings. */
  current: number;
  /** GTM postings at the oldest snapshot in the history window. */
  baseline: number;
  /** Percent change from baseline to current; null when baseline is 0. */
  deltaPct: number | null;
  windowDays: number;
}

/** Headcount-momentum proxy: change in open GTM postings across snapshots. */
export function deriveGtmMomentum(
  cache: JobBoardCacheFile,
  companySlug: string
): GtmMomentumSignal | null {
  const entries = cache.history
    .filter((h) => h.companies[companySlug])
    .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  if (entries.length === 0) return null;

  const oldest = entries[0];
  const newest = entries[entries.length - 1];
  const baseline = oldest.companies[companySlug].gtmTotal;
  const current = newest.companies[companySlug].gtmTotal;
  const windowDays = Math.round(
    (new Date(newest.capturedAt).getTime() -
      new Date(oldest.capturedAt).getTime()) /
      86_400_000
  );

  return {
    current,
    baseline,
    deltaPct:
      baseline > 0 ? Math.round(((current - baseline) / baseline) * 100) : null,
    windowDays,
  };
}

/** True when the latest snapshot has at least one AU/NZ GTM posting. */
export function hasAnzGtmPostings(
  cache: JobBoardCacheFile,
  companySlug: string
): boolean {
  const snapshot = cache.latest.companies[companySlug];
  if (!snapshot) return false;
  return snapshot.gtmPostings.some((p) => p.region === "anz");
}

/**
 * "First ANZ posting" detector: ANZ postings exist now but did not exist in
 * the oldest history snapshot for this company.
 */
export function isNewAnzSignal(
  cache: JobBoardCacheFile,
  companySlug: string
): boolean {
  if (!hasAnzGtmPostings(cache, companySlug)) return false;
  const entries = cache.history
    .filter((h) => h.companies[companySlug])
    .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  if (entries.length < 2) return false;
  return entries[0].companies[companySlug].regions.anz === 0;
}
