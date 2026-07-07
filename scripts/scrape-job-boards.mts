/**
 * Job-postings pipeline: polls public Greenhouse/Lever/Ashby boards for all
 * tracked companies and writes a snapshot + history entry to
 * src/data/job-boards/cache.json.
 *
 * Run manually via `npm run scrape:job-boards`, or automatically via the
 * daily cron route at /api/cron/refresh-job-boards.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { JOB_BOARDS } from "../src/lib/pipelines/job-boards/boards";
import { fetchBoardSnapshot } from "../src/lib/pipelines/job-boards/fetch";
import { summarizeSnapshot } from "../src/lib/pipelines/job-boards/derive";
import type {
  CompanyBoardSnapshot,
  CompanyBoardSummary,
  JobBoardCacheFile,
} from "../src/lib/pipelines/job-boards/types";

const CACHE_PATH = resolve(
  import.meta.dirname,
  "../src/data/job-boards/cache.json"
);
const MAX_HISTORY_ENTRIES = 90;
const DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadExisting(): JobBoardCacheFile {
  if (existsSync(CACHE_PATH)) {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8")) as JobBoardCacheFile;
  }
  return {
    version: 1,
    history: [],
    latest: { capturedAt: "", companies: {} },
  };
}

async function main() {
  const cache = loadExisting();
  const capturedAt = new Date().toISOString();
  const companies: Record<string, CompanyBoardSnapshot> = {};
  const summaries: Record<string, CompanyBoardSummary> = {};

  for (const config of JOB_BOARDS) {
    try {
      const snapshot = await fetchBoardSnapshot(config);
      companies[config.companySlug] = snapshot;
      summaries[config.companySlug] = summarizeSnapshot(snapshot);
      console.log(
        `✓ ${config.companySlug} (${config.provider}/${config.token}): ` +
          `${snapshot.gtmPostings.length} GTM / ${snapshot.totalPostings} total`
      );
    } catch (err) {
      console.error(`✗ ${config.companySlug}:`, (err as Error).message);
    }
    await sleep(DELAY_MS);
  }

  cache.latest = { capturedAt, companies };
  cache.history.push({ capturedAt, companies: summaries });
  if (cache.history.length > MAX_HISTORY_ENTRIES) {
    cache.history = cache.history.slice(-MAX_HISTORY_ENTRIES);
  }

  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
  console.log(
    `\nWrote ${Object.keys(companies).length} companies to ${CACHE_PATH}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
