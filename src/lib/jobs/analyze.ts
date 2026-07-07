import type {
  CompanyJobsSnapshot,
  GtmRoleClass,
  JobPosting,
  JobRegion,
} from "./types";

export interface JobsAnalysis {
  companySlug: string;
  boardUrl: string;
  fetchedAt: string;
  totalPostings: number;
  gtmPostings: number;
  roleMix: Record<GtmRoleClass, number>;
  gtmByRegion: Partial<Record<JobRegion, number>>;
  /** GTM postings published within the last 90 days (where dates exist). */
  recentGtmPostings: number;
  /** ANZ-located GTM postings. */
  anzGtmPostings: JobPosting[];
  /** First AU/NZ GTM posting detected within the last 180 days. */
  newAnzSignal: JobPosting | null;
  /** Change in GTM postings vs the prior snapshot (null when no prior). */
  gtmChangePct: number | null;
  /** Region → % change vs prior snapshot (only regions present before). */
  regionChangePct: Partial<Record<JobRegion, number>>;
  priorFetchedAt: string | null;
}

const EMPTY_ROLE_MIX: Record<GtmRoleClass, number> = {
  ae: 0,
  se_fde: 0,
  sdr: 0,
  cs: 0,
  gtm_leadership: 0,
  gtm_other: 0,
};

export function analyzeSnapshot(snapshot: CompanyJobsSnapshot): JobsAnalysis {
  const gtm = snapshot.postings.filter((p) => p.isGtm);

  const roleMix = { ...EMPTY_ROLE_MIX };
  const gtmByRegion: Partial<Record<JobRegion, number>> = {};
  for (const p of gtm) {
    if (p.roleClass) roleMix[p.roleClass] += 1;
    gtmByRegion[p.region] = (gtmByRegion[p.region] ?? 0) + 1;
  }

  const now = Date.now();
  const d90 = 90 * 24 * 60 * 60 * 1000;
  const d180 = 180 * 24 * 60 * 60 * 1000;
  const recentGtmPostings = gtm.filter(
    (p) => p.publishedAt && now - Date.parse(p.publishedAt) <= d90
  ).length;

  const anzGtmPostings = gtm.filter((p) => p.isAnz);
  const newAnzSignal =
    anzGtmPostings.find(
      (p) => p.publishedAt && now - Date.parse(p.publishedAt) <= d180
    ) ?? null;

  let gtmChangePct: number | null = null;
  const regionChangePct: Partial<Record<JobRegion, number>> = {};
  const prior = snapshot.priorSnapshot;
  if (prior && prior.gtmPostings > 0) {
    gtmChangePct = Math.round(
      ((gtm.length - prior.gtmPostings) / prior.gtmPostings) * 100
    );
    for (const [region, count] of Object.entries(prior.gtmByRegion)) {
      if (count > 0) {
        const nowCount = gtmByRegion[region as JobRegion] ?? 0;
        regionChangePct[region as JobRegion] = Math.round(
          ((nowCount - count) / count) * 100
        );
      }
    }
  }

  return {
    companySlug: snapshot.companySlug,
    boardUrl: snapshot.boardUrl,
    fetchedAt: snapshot.fetchedAt,
    totalPostings: snapshot.postings.length,
    gtmPostings: gtm.length,
    roleMix,
    gtmByRegion,
    recentGtmPostings,
    anzGtmPostings,
    newAnzSignal,
    gtmChangePct,
    regionChangePct,
    priorFetchedAt: prior?.fetchedAt ?? null,
  };
}
