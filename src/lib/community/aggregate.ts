import { RepCompModel } from "../pricing-models";
import {
  ATTAINMENT_BAND_MIDPOINT,
  CommunitySubmission,
  MIN_SAMPLE_SIZE,
  SubmissionAggregate,
  SubmissionRegion,
} from "./types";

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

/**
 * Aggregate anonymous submissions per company-region.
 * Aggregates are only produced when n >= MIN_SAMPLE_SIZE (Levels.fyi model) —
 * below that threshold nothing is exposed, protecting anonymity in small
 * regions.
 */
export function aggregateSubmissions(
  submissions: CommunitySubmission[]
): SubmissionAggregate[] {
  const groups = new Map<string, CommunitySubmission[]>();
  for (const sub of submissions) {
    const key = `${sub.companySlug}::${sub.region}`;
    const group = groups.get(key);
    if (group) group.push(sub);
    else groups.set(key, [sub]);
  }

  const aggregates: SubmissionAggregate[] = [];
  for (const [key, group] of groups) {
    if (group.length < MIN_SAMPLE_SIZE) continue;
    const [companySlug, region] = key.split("::") as [
      string,
      SubmissionRegion,
    ];

    const compModelCounts = new Map<RepCompModel, number>();
    for (const sub of group) {
      compModelCounts.set(
        sub.compModel,
        (compModelCounts.get(sub.compModel) ?? 0) + 1
      );
    }
    let compModelConsensus: RepCompModel = "unknown";
    let best = 0;
    for (const [model, count] of compModelCounts) {
      if (count > best) {
        best = count;
        compModelConsensus = model;
      }
    }
    // Require a strict majority for a comp-model claim.
    if (best <= group.length / 2) compModelConsensus = "unknown";

    aggregates.push({
      companySlug,
      region,
      n: group.length,
      medianOteUsd: median(group.map((s) => s.oteUsd)),
      medianBaseUsd: median(group.map((s) => s.baseUsd)),
      avgAttainmentPct: Math.round(
        group.reduce(
          (sum, s) => sum + ATTAINMENT_BAND_MIDPOINT[s.attainmentBand],
          0
        ) / group.length
      ),
      avgRampMonths:
        Math.round(
          (group.reduce((sum, s) => sum + s.rampMonths, 0) / group.length) * 10
        ) / 10,
      compModelConsensus,
      latestSubmittedAt: group
        .map((s) => s.submittedAt)
        .sort()
        .at(-1) as string,
    });
  }

  return aggregates;
}

export function getAggregatesForCompany(
  aggregates: SubmissionAggregate[],
  companySlug: string
): SubmissionAggregate[] {
  return aggregates.filter((a) => a.companySlug === companySlug);
}
