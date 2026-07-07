import type { MetricSource } from "./provenance";

export type SignalLogType =
  | "score_change"
  | "jobs_change"
  | "new_region"
  | "anz_detector"
  | "funding"
  | "contraction"
  | "tracking_started";

export interface SignalLogEntry {
  id: string;
  /** ISO date the signal was detected. */
  date: string;
  companySlug: string;
  companyName: string;
  type: SignalLogType;
  headline: string;
  /**
   * Diffable explanation, e.g.
   * "Score moved 87→81 on 2026-07-01 because APAC GTM postings dropped 40%."
   */
  detail: string;
  impact: "positive" | "negative" | "neutral";
  sources: MetricSource[];
  scoreBefore?: number | null;
  scoreAfter?: number | null;
}

export interface SignalLogFile {
  version: 1;
  updatedAt: string;
  entries: SignalLogEntry[];
}
