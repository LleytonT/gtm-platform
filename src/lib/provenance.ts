/**
 * Data provenance primitives.
 *
 * Every metric rendered on the site must carry at least one SourceRecord.
 * Metrics without a source record are rendered as "insufficient data" —
 * never as a synthesized number.
 */

export type SourceMethod = "scraped" | "licensed" | "manual" | "inferred";
export type SourceConfidence = "high" | "medium" | "low";

export interface SourceRecord {
  source_name: string;
  url: string;
  retrieved_at: string; // ISO timestamp
  confidence: SourceConfidence;
  method: SourceMethod;
}

/** A numeric metric with mandatory provenance. value === null ⇒ insufficient data. */
export interface SourcedMetric {
  value: number | null;
  sources: SourceRecord[];
}

export const INSUFFICIENT: SourcedMetric = { value: null, sources: [] };

export function sourced(value: number, sources: SourceRecord[]): SourcedMetric {
  if (sources.length === 0) {
    // Guard rail: a value without provenance is not renderable.
    return INSUFFICIENT;
  }
  return { value, sources };
}

export const METHOD_LABELS: Record<SourceMethod, string> = {
  scraped: "Scraped (public API)",
  licensed: "Licensed provider",
  manual: "Manually curated",
  inferred: "Inferred",
};

export const CONFIDENCE_LABELS: Record<SourceConfidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

/** Latest retrieved_at across a set of source records, or null when unsourced. */
export function latestRetrievedAt(
  sources: SourceRecord[]
): string | null {
  let latest: string | null = null;
  for (const s of sources) {
    if (!latest || s.retrieved_at > latest) latest = s.retrieved_at;
  }
  return latest;
}

export function formatRetrievedAt(iso: string | null): string {
  if (!iso) return "no source data";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
