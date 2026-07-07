import "server-only";

/**
 * Signal-change log — every score movement is diffable and explained:
 * "Score moved 87→81 on 2026-07-01 because APAC GTM postings dropped 40%."
 *
 * Committed baseline entries live in src/data/signal-log.json; entries
 * appended by cron refreshes live in the runtime data directory.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import committedLog from "@/data/signal-log.json";
import { SourceRecord } from "./provenance";

export type SignalMetric =
  | "gravy_train"
  | "timing"
  | "territory"
  | "talent"
  | "gtm_postings"
  | "anz_expansion"
  | "funding_velocity";

export interface SignalChangeEntry {
  id: string;
  date: string; // ISO timestamp
  companySlug: string;
  companyName: string;
  metric: SignalMetric;
  before: number | null;
  after: number | null;
  reason: string;
  source?: SourceRecord;
}

const RUNTIME_LOG_PATH = join(process.cwd(), "data", "signal-log", "log.json");
const RUNTIME_STATE_PATH = join(
  process.cwd(),
  "data",
  "signal-log",
  "state.json"
);

function readRuntimeLog(): SignalChangeEntry[] {
  if (!existsSync(RUNTIME_LOG_PATH)) return [];
  try {
    return JSON.parse(readFileSync(RUNTIME_LOG_PATH, "utf-8"));
  } catch {
    return [];
  }
}

export function getSignalLog(): SignalChangeEntry[] {
  const all = [
    ...(committedLog as SignalChangeEntry[]),
    ...readRuntimeLog(),
  ];
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export function getSignalLogForCompany(slug: string): SignalChangeEntry[] {
  return getSignalLog().filter((e) => e.companySlug === slug);
}

export function appendSignalEntries(entries: SignalChangeEntry[]) {
  if (entries.length === 0) return;
  const existing = readRuntimeLog();
  mkdirSync(dirname(RUNTIME_LOG_PATH), { recursive: true });
  writeFileSync(
    RUNTIME_LOG_PATH,
    JSON.stringify([...existing, ...entries], null, 2) + "\n"
  );
}

/** Per-company score state recorded at the last refresh, used for diffing. */
export interface ScoreState {
  recordedAt: string;
  companies: Record<
    string,
    {
      gravyTrain: number | null;
      timing: number | null;
      territory: number | null;
      talent: number | null;
      gtmPostings: number;
      anzPostings: number;
      fundingVelocity: number | null;
    }
  >;
}

export function readScoreState(): ScoreState | null {
  if (!existsSync(RUNTIME_STATE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(RUNTIME_STATE_PATH, "utf-8"));
  } catch {
    return null;
  }
}

export function writeScoreState(state: ScoreState) {
  mkdirSync(dirname(RUNTIME_STATE_PATH), { recursive: true });
  writeFileSync(RUNTIME_STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

export function describeChange(entry: SignalChangeEntry): string {
  const day = entry.date.slice(0, 10);
  if (entry.before !== null && entry.after !== null) {
    return `Score moved ${entry.before}→${entry.after} on ${day} because ${entry.reason}`;
  }
  return `${entry.reason} (${day})`;
}
