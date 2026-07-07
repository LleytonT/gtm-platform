import cacheData from "@/data/jobs/cache.json";
import { analyzeSnapshot, type JobsAnalysis } from "./analyze";
import type { CompanyJobsSnapshot, JobsCache } from "./types";

const cache = cacheData as unknown as JobsCache;

export function getJobsSnapshot(
  companySlug: string
): CompanyJobsSnapshot | null {
  return cache.companies[companySlug] ?? null;
}

const analysisCache = new Map<string, JobsAnalysis>();

export function getJobsAnalysis(companySlug: string): JobsAnalysis | null {
  const snapshot = getJobsSnapshot(companySlug);
  if (!snapshot) return null;
  let analysis = analysisCache.get(companySlug);
  if (!analysis) {
    analysis = analyzeSnapshot(snapshot);
    analysisCache.set(companySlug, analysis);
  }
  return analysis;
}

export function getJobsCacheMeta(): { scrapedAt: string; count: number } {
  return {
    scrapedAt: cache.scrapedAt,
    count: Object.keys(cache.companies).length,
  };
}
