import cacheData from "@/data/repvue/cache.json";
import type { RepVueCacheFile, RepVueProfile } from "./types";

const cache = cacheData as RepVueCacheFile;

export function getCachedRepvueProfile(
  companySlug: string
): RepVueProfile | null {
  return cache.companies[companySlug] ?? null;
}

export function getAllCachedRepvueProfiles(): RepVueProfile[] {
  return Object.values(cache.companies);
}

export function getRepvueCacheMeta(): { scrapedAt: string; count: number } {
  return {
    scrapedAt: cache.scrapedAt,
    count: Object.keys(cache.companies).length,
  };
}
