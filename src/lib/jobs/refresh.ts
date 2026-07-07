/**
 * Job-board refresh (P1.6a + P2.13).
 *
 * Polls official public Greenhouse / Lever / Ashby job-board APIs for all
 * tracked companies, classifies GTM roles and regions, writes a snapshot to
 * src/data/jobs/cache.json, and appends detected changes to the per-company
 * signal-change log (src/data/signal-log.json).
 *
 * Called from `npm run scrape:jobs` and the daily /api/cron/refresh-jobs.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ATS_BOARDS, fetchBoardPostings } from "./fetch";
import { analyzeSnapshot } from "./analyze";
import type { CompanyJobsSnapshot, JobsCache } from "./types";
import type {
  SignalLogEntry,
  SignalLogFile,
} from "../signal-log-types";

const CACHE_PATH = path.join(process.cwd(), "src/data/jobs/cache.json");
const LOG_PATH = path.join(process.cwd(), "src/data/signal-log.json");

async function loadJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf-8")) as T;
  } catch {
    return null;
  }
}

function summarize(snapshot: CompanyJobsSnapshot) {
  const gtm = snapshot.postings.filter((p) => p.isGtm);
  const gtmByRegion: Record<string, number> = {};
  for (const p of gtm) {
    gtmByRegion[p.region] = (gtmByRegion[p.region] ?? 0) + 1;
  }
  return {
    fetchedAt: snapshot.fetchedAt,
    totalPostings: snapshot.postings.length,
    gtmPostings: gtm.length,
    gtmByRegion,
  };
}

export async function refreshJobBoards(): Promise<{
  companies: number;
  newLogEntries: number;
}> {
  const existing = await loadJson<JobsCache>(CACHE_PATH);
  const log = (await loadJson<SignalLogFile>(LOG_PATH)) ?? {
    version: 1 as const,
    updatedAt: "",
    entries: [],
  };
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const companies: Record<string, CompanyJobsSnapshot> = {};
  const newEntries: SignalLogEntry[] = [];

  for (const board of ATS_BOARDS) {
    process.stdout.write(
      `Fetching ${board.companySlug} (${board.ats}:${board.boardSlug})… `
    );
    const prior = existing?.companies[board.companySlug];
    try {
      const postings = await fetchBoardPostings(board);
      const snapshot: CompanyJobsSnapshot = {
        companySlug: board.companySlug,
        ats: board.ats,
        boardSlug: board.boardSlug,
        boardUrl: board.boardUrl,
        fetchedAt: now,
        postings,
        priorSnapshot: prior ? summarize(prior) : undefined,
      };
      companies[board.companySlug] = snapshot;
      const analysis = analyzeSnapshot(snapshot);
      console.log(`${postings.length} postings (${analysis.gtmPostings} GTM)`);

      const source = {
        source_name: `${board.ats} job board (public API)`,
        url: board.boardUrl,
        retrieved_at: now,
        confidence: "high" as const,
        method: "scraped" as const,
      };

      if (!prior) {
        newEntries.push({
          id: `${board.companySlug}-tracking-${today}`,
          date: now,
          companySlug: board.companySlug,
          companyName: board.companySlug,
          type: "tracking_started",
          headline: `Job-board tracking started (${analysis.gtmPostings} open GTM roles)`,
          detail: `First snapshot from the public ${board.ats} board: ${analysis.totalPostings} total postings, ${analysis.gtmPostings} GTM. Momentum diffs begin with the next refresh.`,
          impact: "neutral",
          sources: [source],
        });
      } else if (analysis.gtmChangePct != null) {
        if (Math.abs(analysis.gtmChangePct) >= 10) {
          newEntries.push({
            id: `${board.companySlug}-gtmchange-${today}`,
            date: now,
            companySlug: board.companySlug,
            companyName: board.companySlug,
            type: "jobs_change",
            headline: `GTM postings ${analysis.gtmChangePct > 0 ? "up" : "down"} ${Math.abs(analysis.gtmChangePct)}%`,
            detail: `Open GTM postings moved from ${snapshot.priorSnapshot?.gtmPostings} to ${analysis.gtmPostings} since ${snapshot.priorSnapshot?.fetchedAt.slice(0, 10)}.`,
            impact: analysis.gtmChangePct > 0 ? "positive" : "negative",
            sources: [source],
          });
        }
        for (const [region, pct] of Object.entries(analysis.regionChangePct)) {
          if (pct != null && pct <= -25) {
            newEntries.push({
              id: `${board.companySlug}-${region}-decline-${today}`,
              date: now,
              companySlug: board.companySlug,
              companyName: board.companySlug,
              type: "jobs_change",
              headline: `${region} GTM postings dropped ${Math.abs(pct)}%`,
              detail: `${region} GTM postings declined ${Math.abs(pct)}% since ${snapshot.priorSnapshot?.fetchedAt.slice(0, 10)} — regional momentum penalty applies.`,
              impact: "negative",
              sources: [source],
            });
          }
        }
      }

      if (analysis.newAnzSignal) {
        const p = analysis.newAnzSignal;
        const id = `${board.companySlug}-anz-posting-${p.id}`;
        if (!log.entries.some((e) => e.id === id)) {
          newEntries.push({
            id,
            date: p.publishedAt ?? now,
            companySlug: board.companySlug,
            companyName: board.companySlug,
            type: "anz_detector",
            headline: `AU/NZ GTM posting live: ${p.title}`,
            detail: `"${p.title}" (${p.location}) published ${p.publishedAt?.slice(0, 10) ?? "recently"} — ANZ expansion detector: first-party job posting.`,
            impact: "positive",
            sources: [
              { ...source, url: p.url, note: "Job posting on official board" },
            ],
          });
        }
      }
    } catch (err) {
      console.log(`FAILED — ${(err as Error).message}`);
      if (prior) companies[board.companySlug] = prior;
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  const cache: JobsCache = { version: 1, scrapedAt: now, companies };
  await mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");

  const knownIds = new Set(log.entries.map((e) => e.id));
  const appended = newEntries.filter((e) => !knownIds.has(e.id));
  const updatedLog: SignalLogFile = {
    version: 1,
    updatedAt: now,
    entries: [...appended, ...log.entries].slice(0, 500),
  };
  await writeFile(LOG_PATH, JSON.stringify(updatedLog, null, 2) + "\n");

  console.log(
    `\nWrote ${Object.keys(companies).length} company snapshots; ${appended.length} new signal-log entries.`
  );
  return {
    companies: Object.keys(companies).length,
    newLogEntries: appended.length,
  };
}
