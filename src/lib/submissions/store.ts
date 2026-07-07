import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import seedData from "@/data/submissions/store.json";
import type {
  Submission,
  SubmissionAggregate,
  SubmissionsFile,
} from "./types";
import { ATTAINMENT_BAND_MIDPOINTS, MIN_AGGREGATE_N } from "./types";

const STORE_PATH = path.join(
  process.cwd(),
  "src/data/submissions/store.json"
);

/**
 * File-backed store. The seeded JSON is bundled for reads in all
 * environments; writes go to disk (works locally / self-hosted — a real
 * deployment would swap this for Postgres without changing callers).
 */
export async function readSubmissions(): Promise<Submission[]> {
  try {
    const raw = await readFile(STORE_PATH, "utf-8");
    return (JSON.parse(raw) as SubmissionsFile).submissions;
  } catch {
    return (seedData as SubmissionsFile).submissions;
  }
}

export function readSubmissionsSync(): Submission[] {
  return (seedData as SubmissionsFile).submissions;
}

export async function appendSubmission(submission: Submission): Promise<void> {
  const submissions = await readSubmissions();
  const file: SubmissionsFile = {
    version: 1,
    submissions: [...submissions, submission],
  };
  await writeFile(STORE_PATH, JSON.stringify(file, null, 2) + "\n");
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

/**
 * Aggregates verified submissions per company-region. Returns entries only
 * where n >= MIN_AGGREGATE_N — smaller cohorts are never rendered to
 * protect submitter anonymity.
 */
export function aggregateSubmissions(
  submissions: Submission[]
): SubmissionAggregate[] {
  const groups = new Map<string, Submission[]>();
  for (const s of submissions) {
    if (!s.verified) continue;
    const key = `${s.company}|${s.region}`;
    const group = groups.get(key);
    if (group) group.push(s);
    else groups.set(key, [s]);
  }

  const aggregates: SubmissionAggregate[] = [];
  for (const [key, group] of groups) {
    if (group.length < MIN_AGGREGATE_N) continue;
    const [company, region] = key.split("|");
    const attainmentScore = Math.min(
      100,
      Math.round(
        group.reduce(
          (sum, s) => sum + ATTAINMENT_BAND_MIDPOINTS[s.attainment_band],
          0
        ) / group.length
      )
    );
    const compModels: SubmissionAggregate["compModels"] = {};
    const roles: SubmissionAggregate["roles"] = {};
    let latest = "";
    for (const s of group) {
      compModels[s.comp_model] = (compModels[s.comp_model] ?? 0) + 1;
      roles[s.role] = (roles[s.role] ?? 0) + 1;
      if (s.submitted_at > latest) latest = s.submitted_at;
    }
    aggregates.push({
      company,
      region,
      n: group.length,
      attainmentScore,
      medianRampMonths: median(group.map((s) => s.ramp_months)),
      compModels,
      roles,
      latestSubmittedAt: latest,
      includesSampleData: group.some((s) => s.sample),
    });
  }
  return aggregates;
}

export function getAggregatesForCompany(slug: string): SubmissionAggregate[] {
  return aggregateSubmissions(readSubmissionsSync()).filter(
    (a) => a.company === slug
  );
}
