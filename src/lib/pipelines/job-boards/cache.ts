import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import committedCache from "@/data/job-boards/cache.json";
import { CompanyBoardSnapshot, JobBoardCacheFile } from "./types";

/**
 * Runtime cache (written by cron refreshes) takes priority over the
 * committed snapshot so daily refreshes are visible without a redeploy.
 */
const RUNTIME_CACHE_PATH = join(
  process.cwd(),
  "data",
  "job-boards",
  "cache.json"
);

export function getJobBoardCache(): JobBoardCacheFile {
  if (existsSync(RUNTIME_CACHE_PATH)) {
    try {
      return JSON.parse(
        readFileSync(RUNTIME_CACHE_PATH, "utf-8")
      ) as JobBoardCacheFile;
    } catch {
      // fall through to committed snapshot
    }
  }
  return committedCache as JobBoardCacheFile;
}

export function getBoardSnapshot(
  companySlug: string
): CompanyBoardSnapshot | null {
  return getJobBoardCache().latest.companies[companySlug] ?? null;
}

export function getJobBoardCacheMeta(): {
  capturedAt: string;
  count: number;
} {
  const cache = getJobBoardCache();
  return {
    capturedAt: cache.latest.capturedAt,
    count: Object.keys(cache.latest.companies).length,
  };
}
