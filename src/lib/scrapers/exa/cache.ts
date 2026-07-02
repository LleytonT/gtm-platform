import cacheData from "@/data/exa/cache.json";
import type { ExaCacheFile, ExaCompanySignals } from "./types";

const cache = cacheData as ExaCacheFile;

export function getCachedExaSignals(
  companySlug: string
): ExaCompanySignals | null {
  return cache.companies[companySlug] ?? null;
}

export function getExaCacheMeta(): { scrapedAt: string; count: number } {
  return {
    scrapedAt: cache.scrapedAt,
    count: Object.keys(cache.companies).length,
  };
}
