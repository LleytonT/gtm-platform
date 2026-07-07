import "server-only";

/**
 * Server-side scorecard builder.
 *
 * Every metric is COMPUTED from a sourced input (public job boards, RepVue,
 * licensed people data, curated funding records, community submissions) and
 * carries the source records it was derived from. When no sourced input
 * exists for a metric, the metric is null → the UI renders "insufficient
 * data" instead of a synthesized number.
 *
 * Exact formulas are documented publicly on /methodology.
 */
import {
  INSUFFICIENT,
  SourcedMetric,
  SourceRecord,
  latestRetrievedAt,
  sourced,
} from "./provenance";
import {
  BenchmarkMetrics,
  CompanyScorecard,
  PenaltyRecord,
  computeWeightedScore,
  DEFAULT_WEIGHTS,
} from "./scoring";
import { ThreeTKey } from "./types";
import { getCachedRepvueProfile } from "./scrapers/repvue/cache";
import {
  getIncentiveCompPercentile,
  getProductMarketFitPercentile,
} from "./scrapers/repvue/parser";
import { getActivePeopleProvider } from "./providers/people-data";
import { getJobBoardCache, getBoardSnapshot } from "./pipelines/job-boards/cache";
import { deriveGtmMomentum, hasAnzGtmPostings, summarizeSnapshot } from "./pipelines/job-boards/derive";
import { getFundingRecord } from "./funding-records";
import { getCuratedEvents } from "./curated-events";
import { readSubmissions } from "./community/store";
import { aggregateSubmissions } from "./community/aggregate";
import type { SubmissionAggregate } from "./community/types";

const NEGATIVE_EVENT_PENALTY = 8;
const NEGATIVE_EVENT_WINDOW_MONTHS = 12;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function monthsBetween(fromIso: string, to: Date): number {
  return (to.getTime() - new Date(fromIso).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

/* ------------------------------------------------------------------ */
/* Benchmark metric computations                                       */
/* ------------------------------------------------------------------ */

function jobBoardSource(
  snapshot: { boardUrl: string; provider: string },
  capturedAt: string
): SourceRecord {
  return {
    source_name: `Public job board (${snapshot.provider})`,
    url: snapshot.boardUrl,
    retrieved_at: capturedAt,
    confidence: "high",
    method: "scraped",
  };
}

function computeGtmMomentum(slug: string): SourcedMetric {
  const cache = getJobBoardCache();
  const snapshot = getBoardSnapshot(slug);
  if (!snapshot || snapshot.totalPostings === 0) return INSUFFICIENT;

  const summary = summarizeSnapshot(snapshot);
  const share = summary.gtmTotal / summary.totalPostings;
  const base = Math.min(50, Math.round(share * 125));
  const volume = Math.min(25, Math.round(summary.gtmTotal / 8));

  let delta = 0;
  const momentum = deriveGtmMomentum(cache, slug);
  if (momentum && momentum.windowDays >= 7 && momentum.deltaPct !== null) {
    delta = Math.max(-25, Math.min(25, momentum.deltaPct));
  }

  return sourced(clamp(base + volume + delta), [
    jobBoardSource(snapshot, cache.latest.capturedAt),
  ]);
}

function computeRegionalBalance(slug: string): SourcedMetric {
  const cache = getJobBoardCache();
  const snapshot = getBoardSnapshot(slug);
  if (!snapshot) return INSUFFICIENT;

  const summary = summarizeSnapshot(snapshot);
  if (summary.gtmTotal === 0) return INSUFFICIENT;

  const { anz, apac, emea, latam } = summary.regions;
  const nonAmer = anz + apac + emea + latam;
  const share = nonAmer / summary.gtmTotal;
  const distinct = [anz, apac, emea, latam].filter((n) => n > 0).length;

  return sourced(clamp(share * 140 + distinct * 8), [
    jobBoardSource(snapshot, cache.latest.capturedAt),
  ]);
}

function computeFundingVelocity(slug: string, now: Date): SourcedMetric {
  const record = getFundingRecord(slug);
  if (!record) return INSUFFICIENT;

  if (record.isPublicCompany) {
    // Public companies: stable access to capital, no private step-up upside.
    return sourced(65, [record.source]);
  }

  const months = monthsBetween(record.announcedAt, now);
  const recency = clamp(100 - months * 2.5, 0, 80);
  const amount = record.amountUsd ?? 0;
  const sizeBonus =
    amount >= 1_000_000_000 ? 20 : amount >= 250_000_000 ? 15 : amount >= 100_000_000 ? 10 : 5;

  return sourced(clamp(recency + sizeBonus), [record.source]);
}

function computeQuotaReality(
  slug: string,
  aggregates: SubmissionAggregate[]
): SourcedMetric {
  // Verified community submissions (n >= 3 per company-region) take priority
  // over scraped review-site proxies.
  const companyAggs = aggregates.filter((a) => a.companySlug === slug);
  if (companyAggs.length > 0) {
    const totalN = companyAggs.reduce((sum, a) => sum + a.n, 0);
    const weighted =
      companyAggs.reduce((sum, a) => sum + a.avgAttainmentPct * a.n, 0) /
      totalN;
    return sourced(clamp(weighted), [
      {
        source_name: `Verified community submissions (n=${totalN})`,
        url: "/submit",
        retrieved_at: companyAggs
          .map((a) => a.latestSubmittedAt)
          .sort()
          .at(-1) as string,
        confidence: "high",
        method: "manual",
      },
    ]);
  }

  const repvue = getCachedRepvueProfile(slug);
  if (!repvue) return INSUFFICIENT;

  const incentive = getIncentiveCompPercentile(repvue);
  if (incentive === null) return INSUFFICIENT;
  const inbound =
    repvue.categoryRankings.find((c) => /inbound lead/i.test(c.category))
      ?.percentile ?? null;

  const value =
    inbound !== null ? 0.7 * incentive + 0.3 * inbound : incentive;

  return sourced(clamp(value), [
    {
      source_name: "RepVue (scraped proxy)",
      url: repvue.canonicalUrl,
      retrieved_at: repvue.fetchedAt,
      confidence: "medium",
      method: "scraped",
    },
  ]);
}

function computePmfStrength(slug: string): SourcedMetric {
  const repvue = getCachedRepvueProfile(slug);
  if (!repvue) return INSUFFICIENT;
  const pmf = getProductMarketFitPercentile(repvue);
  if (pmf === null) return INSUFFICIENT;
  return sourced(clamp(pmf), [
    {
      source_name: "RepVue PMF percentile",
      url: repvue.canonicalUrl,
      retrieved_at: repvue.fetchedAt,
      confidence: "medium",
      method: "scraped",
    },
  ]);
}

function computeTalentComponents(slug: string): SourcedMetric {
  const components: number[] = [];
  const sources: SourceRecord[] = [];

  const repvue = getCachedRepvueProfile(slug);
  if (repvue && repvue.overallPercentile !== null) {
    components.push(repvue.overallPercentile);
    sources.push({
      source_name: "RepVue verified sales ratings",
      url: repvue.canonicalUrl,
      retrieved_at: repvue.fetchedAt,
      confidence: "medium",
      method: "scraped",
    });
  }

  const provider = getActivePeopleProvider();
  const people = provider.getCachedSignals(slug);
  if (people && people.tenure.sampleSize >= 10) {
    let score = 50;
    const { tenure, promotions, hiring } = people;
    if (tenure.avgMonths !== null) {
      if (tenure.avgMonths >= 18) score += 15;
      else if (tenure.avgMonths >= 12) score += 8;
      else if (tenure.avgMonths < 9) score -= 10;
    }
    const shortRate = tenure.under12Months / tenure.sampleSize;
    if (shortRate > 0.5) score -= 15;
    else if (shortRate < 0.25) score += 10;
    const promoRate = promotions.internalPromotions / tenure.sampleSize;
    if (promoRate >= 0.5) score += 15;
    else if (promoRate >= 0.25) score += 8;
    if (hiring.totalCurrentGtm > 0) {
      const hireRate = hiring.newHiresLast12Months / hiring.totalCurrentGtm;
      if (hireRate > 0.3) score += 10;
    }
    components.push(clamp(score));
    sources.push({
      source_name: `Licensed people-data provider (${provider.name})`,
      url: provider.attributionUrl,
      retrieved_at: people.retrievedAt,
      confidence: "medium",
      method: "licensed",
    });
  }

  if (components.length === 0) return INSUFFICIENT;
  const avg = components.reduce((a, b) => a + b, 0) / components.length;
  return sourced(clamp(avg), sources);
}

/* ------------------------------------------------------------------ */
/* Dimension composition                                               */
/* ------------------------------------------------------------------ */

function blend(
  parts: { metric: SourcedMetric; weight: number }[]
): SourcedMetric {
  const available = parts.filter((p) => p.metric.value !== null);
  if (available.length === 0) return INSUFFICIENT;
  const totalWeight = available.reduce((sum, p) => sum + p.weight, 0);
  const value = available.reduce(
    (sum, p) => sum + (p.metric.value as number) * (p.weight / totalWeight),
    0
  );
  const sources = available.flatMap((p) => p.metric.sources);
  return sourced(clamp(value), sources);
}

function computePenalties(slug: string, now: Date): PenaltyRecord[] {
  const penalties: PenaltyRecord[] = [];
  for (const event of getCuratedEvents()) {
    if (event.companySlug !== slug || event.impact !== "negative") continue;
    if (monthsBetween(event.date, now) > NEGATIVE_EVENT_WINDOW_MONTHS) continue;
    for (const dimension of event.feedsThreeT) {
      penalties.push({
        dimension,
        points: NEGATIVE_EVENT_PENALTY,
        reason: event.headline,
        source: event.source,
      });
    }
  }
  return penalties;
}

function applyPenalties(
  metric: SourcedMetric,
  dimension: ThreeTKey,
  penalties: PenaltyRecord[]
): SourcedMetric {
  if (metric.value === null) return metric;
  const applicable = penalties.filter((p) => p.dimension === dimension);
  if (applicable.length === 0) return metric;
  const total = applicable.reduce((sum, p) => sum + p.points, 0);
  return {
    value: clamp(metric.value - total),
    sources: [...metric.sources, ...applicable.map((p) => p.source)],
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function buildScorecard(slug: string, now = new Date()): CompanyScorecard {
  const aggregates = aggregateSubmissions(readSubmissions());

  const benchmarks: BenchmarkMetrics = {
    gtm_momentum: computeGtmMomentum(slug),
    funding_velocity: computeFundingVelocity(slug, now),
    quota_reality: computeQuotaReality(slug, aggregates),
    regional_balance: computeRegionalBalance(slug),
    pmf_strength: computePmfStrength(slug),
  };

  const penalties = computePenalties(slug, now);

  // Timing: is capital + hiring investment accelerating right now?
  let timing = blend([
    { metric: benchmarks.funding_velocity, weight: 0.6 },
    { metric: benchmarks.gtm_momentum, weight: 0.4 },
  ]);

  // Territory: is there geographic/segment greenfield?
  let territory = blend([
    { metric: benchmarks.regional_balance, weight: 0.6 },
    { metric: benchmarks.gtm_momentum, weight: 0.4 },
  ]);
  // New-market bonus: active ANZ GTM postings signal a fresh patch.
  if (territory.value !== null && hasAnzGtmPostings(getJobBoardCache(), slug)) {
    territory = { ...territory, value: clamp(territory.value + 5) };
  }

  // Talent: is the org worth joining (attainment, tenure, enablement)?
  let talent = blend([
    { metric: computeTalentComponents(slug), weight: 0.6 },
    { metric: benchmarks.quota_reality, weight: 0.4 },
  ]);

  timing = applyPenalties(timing, "timing", penalties);
  territory = applyPenalties(territory, "territory", penalties);
  talent = applyPenalties(talent, "talent", penalties);

  const dimensions = { timing, territory, talent };

  const allSources = [
    ...Object.values(dimensions).flatMap((d) => d.sources),
    ...Object.values(benchmarks).flatMap((b) => b.sources),
  ];

  const weighted = computeWeightedScore(
    { slug, dimensions, benchmarks, penalties, coverage: "full", lastUpdated: null },
    DEFAULT_WEIGHTS
  );

  return {
    slug,
    dimensions,
    benchmarks,
    penalties,
    coverage: weighted.coverage,
    lastUpdated: latestRetrievedAt(allSources),
  };
}

export function getCommunityAggregates(): SubmissionAggregate[] {
  return aggregateSubmissions(readSubmissions());
}
