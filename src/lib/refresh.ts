import "server-only";

/**
 * Freshness architecture: shared refresh + diff logic used by the cron
 * routes (/api/cron/refresh-job-boards daily, /api/cron/refresh-news weekly).
 *
 * Each refresh recomputes scorecards, diffs them against the previously
 * recorded state, and appends human-readable entries to the signal-change
 * log so every score movement is explainable.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { JOB_BOARDS } from "./pipelines/job-boards/boards";
import { fetchBoardSnapshot } from "./pipelines/job-boards/fetch";
import { summarizeSnapshot } from "./pipelines/job-boards/derive";
import { getJobBoardCache } from "./pipelines/job-boards/cache";
import type {
  CompanyBoardSnapshot,
  CompanyBoardSummary,
  JobBoardCacheFile,
} from "./pipelines/job-boards/types";
import { buildScorecard } from "./scorecards";
import { computeWeightedScore, DEFAULT_WEIGHTS } from "./scoring";
import {
  appendSignalEntries,
  readScoreState,
  ScoreState,
  SignalChangeEntry,
  writeScoreState,
} from "./signal-log";
import { companies } from "./data";

const RUNTIME_CACHE_PATH = join(
  process.cwd(),
  "data",
  "job-boards",
  "cache.json"
);
const MAX_HISTORY_ENTRIES = 90;
const MIN_LOGGED_DELTA = 2;

function companyName(slug: string): string {
  return companies.find((c) => c.slug === slug)?.name ?? slug;
}

function captureState(now: Date): ScoreState {
  const cache = getJobBoardCache();
  const state: ScoreState = {
    recordedAt: now.toISOString(),
    companies: {},
  };
  for (const company of companies) {
    const scorecard = buildScorecard(company.slug, now);
    const weighted = computeWeightedScore(scorecard, DEFAULT_WEIGHTS);
    const snapshot = cache.latest.companies[company.slug];
    const summary = snapshot ? summarizeSnapshot(snapshot) : null;
    state.companies[company.slug] = {
      gravyTrain: weighted.value,
      timing: scorecard.dimensions.timing.value,
      territory: scorecard.dimensions.territory.value,
      talent: scorecard.dimensions.talent.value,
      gtmPostings: summary?.gtmTotal ?? 0,
      anzPostings: summary?.regions.anz ?? 0,
      fundingVelocity: scorecard.benchmarks.funding_velocity.value,
    };
  }
  return state;
}

function explainPostingsChange(
  prev: ScoreState["companies"][string],
  next: ScoreState["companies"][string]
): string {
  const parts: string[] = [];
  if (prev.gtmPostings !== next.gtmPostings && prev.gtmPostings > 0) {
    const pct = Math.round(
      ((next.gtmPostings - prev.gtmPostings) / prev.gtmPostings) * 100
    );
    parts.push(
      `GTM postings ${pct >= 0 ? "grew" : "dropped"} ${Math.abs(pct)}% (${prev.gtmPostings}→${next.gtmPostings})`
    );
  }
  if (prev.anzPostings !== next.anzPostings) {
    parts.push(
      `AU/NZ postings moved ${prev.anzPostings}→${next.anzPostings}`
    );
  }
  if (
    prev.fundingVelocity !== null &&
    next.fundingVelocity !== null &&
    prev.fundingVelocity !== next.fundingVelocity
  ) {
    parts.push(
      `funding recency decayed (${prev.fundingVelocity}→${next.fundingVelocity})`
    );
  }
  return parts.length > 0 ? parts.join("; ") : "underlying signal data changed";
}

function diffStates(
  prev: ScoreState,
  next: ScoreState,
  now: Date
): SignalChangeEntry[] {
  const entries: SignalChangeEntry[] = [];
  for (const [slug, nextState] of Object.entries(next.companies)) {
    const prevState = prev.companies[slug];
    if (!prevState) continue;

    // New ANZ expansion signal
    if (prevState.anzPostings === 0 && nextState.anzPostings > 0) {
      entries.push({
        id: `${slug}-anz-${now.getTime()}`,
        date: now.toISOString(),
        companySlug: slug,
        companyName: companyName(slug),
        metric: "anz_expansion",
        before: prevState.anzPostings,
        after: nextState.anzPostings,
        reason: `first AU/NZ GTM posting detected — flagged as "Expanding into ANZ"`,
      });
    }

    if (
      prevState.gravyTrain !== null &&
      nextState.gravyTrain !== null &&
      Math.abs(nextState.gravyTrain - prevState.gravyTrain) >= MIN_LOGGED_DELTA
    ) {
      entries.push({
        id: `${slug}-gravy-${now.getTime()}`,
        date: now.toISOString(),
        companySlug: slug,
        companyName: companyName(slug),
        metric: "gravy_train",
        before: prevState.gravyTrain,
        after: nextState.gravyTrain,
        reason: explainPostingsChange(prevState, nextState),
      });
    }
  }
  return entries;
}

export interface RefreshResult {
  refreshedCompanies: number;
  failedCompanies: string[];
  newLogEntries: number;
}

/** Daily: re-poll all public job boards, then diff and log score changes. */
export async function refreshJobBoards(
  now = new Date()
): Promise<RefreshResult> {
  const prevState = readScoreState() ?? captureState(now);

  const cache = getJobBoardCache();
  const capturedAt = now.toISOString();
  const snapshots: Record<string, CompanyBoardSnapshot> = {};
  const summaries: Record<string, CompanyBoardSummary> = {};
  const failed: string[] = [];

  for (const config of JOB_BOARDS) {
    try {
      const snapshot = await fetchBoardSnapshot(config);
      snapshots[config.companySlug] = snapshot;
      summaries[config.companySlug] = summarizeSnapshot(snapshot);
    } catch {
      failed.push(config.companySlug);
      // Keep the previous snapshot rather than dropping the company.
      const previous = cache.latest.companies[config.companySlug];
      if (previous) {
        snapshots[config.companySlug] = previous;
        summaries[config.companySlug] = summarizeSnapshot(previous);
      }
    }
  }

  const updated: JobBoardCacheFile = {
    version: cache.version,
    history: [...cache.history, { capturedAt, companies: summaries }].slice(
      -MAX_HISTORY_ENTRIES
    ),
    latest: { capturedAt, companies: snapshots },
  };
  mkdirSync(dirname(RUNTIME_CACHE_PATH), { recursive: true });
  writeFileSync(RUNTIME_CACHE_PATH, JSON.stringify(updated, null, 2) + "\n");

  const nextState = captureState(now);
  const entries = diffStates(prevState, nextState, now);
  appendSignalEntries(entries);
  writeScoreState(nextState);

  return {
    refreshedCompanies: Object.keys(snapshots).length,
    failedCompanies: failed,
    newLogEntries: entries.length,
  };
}

/**
 * Weekly: recompute funding/news-driven scores (funding recency decays over
 * time) and log material movements. News ingestion is manual/curated until a
 * licensed news provider is integrated, so this recomputation is the honest
 * refresh we can automate today.
 */
export function refreshFundingAndNews(now = new Date()): RefreshResult {
  const prevState = readScoreState() ?? captureState(now);
  const nextState = captureState(now);
  const entries = diffStates(prevState, nextState, now);
  appendSignalEntries(entries);
  writeScoreState(nextState);
  return {
    refreshedCompanies: Object.keys(nextState.companies).length,
    failedCompanies: [],
    newLogEntries: entries.length,
  };
}