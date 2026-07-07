/**
 * Data provenance primitives.
 *
 * Every number rendered on the site must carry at least one MetricSource
 * record. Metrics without a source record are rendered as "insufficient
 * data" — never as a synthesized score.
 */

export type SourceConfidence = "high" | "medium" | "low";

export type SourceMethod = "scraped" | "licensed" | "manual" | "inferred";

export interface MetricSource {
  /** Human-readable source name, e.g. "Greenhouse job board" or "RepVue". */
  source_name: string;
  /** Public URL backing the record, when one exists. */
  url?: string;
  /** ISO timestamp when the record was retrieved or curated. */
  retrieved_at: string;
  confidence: SourceConfidence;
  method: SourceMethod;
  /** Optional note explaining what the source contributes. */
  note?: string;
}

/**
 * A metric value plus the source records that back it.
 * `value: null` (or an empty `sources` array) means insufficient data.
 */
export interface SourcedMetric {
  value: number | null;
  sources: MetricSource[];
}

export const INSUFFICIENT: SourcedMetric = { value: null, sources: [] };

export function hasData(
  metric: SourcedMetric
): metric is SourcedMetric & { value: number } {
  return metric.value != null && metric.sources.length > 0;
}

export function sourcedMetric(
  value: number,
  sources: MetricSource[]
): SourcedMetric {
  if (sources.length === 0) return INSUFFICIENT;
  return { value: Math.round(value), sources };
}

/** Latest retrieved_at across a set of source records (ISO string), or null. */
export function latestRetrievedAt(
  sources: MetricSource[]
): string | null {
  let latest: string | null = null;
  for (const s of sources) {
    if (!latest || s.retrieved_at > latest) latest = s.retrieved_at;
  }
  return latest;
}

export const CONFIDENCE_LABELS: Record<SourceConfidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export const METHOD_LABELS: Record<SourceMethod, string> = {
  scraped: "Scraped (public API/page)",
  licensed: "Licensed data provider",
  manual: "Manually curated",
  inferred: "Inferred estimate",
};

export function formatRetrievedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
