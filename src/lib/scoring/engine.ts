/**
 * Data-backed scoring engine.
 *
 * Replaces the hand-authored seed scores. Every score is computed from
 * source-backed inputs (public job boards, RepVue, curated events with
 * source records, verified community submissions) and is returned with the
 * full contribution breakdown so score changes are diffable and every
 * number can show its provenance on hover.
 *
 * Calibration notes (P0.5):
 * - Scores use the full 0–100 range via wide contribution spans and a
 *   3–97 clamp (no floor at 40 like the old engine).
 * - Negative signals materially reduce scores: a contraction event is −15
 *   Timing, a regional posting decline is up to −20 Territory, a
 *   "trending down" RepVue trajectory is −5.
 * - See /methodology for a worked example rendered from live data.
 */
import { getJobsAnalysis } from "../jobs/cache";
import type { JobsAnalysis } from "../jobs/analyze";
import { getEventsForCompany, type CompanyEvent } from "../events";
import { getCachedRepvueProfile } from "../scrapers/repvue/cache";
import type { RepVueProfile } from "../scrapers/repvue/types";
import { getPeopleDataProvider } from "../people-data/exa-provider";
import type { PeopleSignals } from "../people-data/provider";
import { getAggregatesForCompany } from "../submissions/store";
import type { SubmissionAggregate } from "../submissions/types";
import { getProductPricing } from "../pricing";
import { getTeamIntelForCompany } from "../team-intel";
import type { MetricSource } from "../provenance";
import type {
  AnzDetection,
  CompanyScorecard,
  DimensionScore,
  ScoreContribution,
} from "./types";

const clamp = (value: number, min = 3, max = 97) =>
  Math.round(Math.min(max, Math.max(min, value)));

function jobBoardSource(analysis: JobsAnalysis): MetricSource {
  return {
    source_name: "Public job board (official ATS API)",
    url: analysis.boardUrl,
    retrieved_at: analysis.fetchedAt,
    confidence: "high",
    method: "scraped",
  };
}

function repvueSource(profile: RepVueProfile): MetricSource {
  const ratings = profile.totalRatings ?? 0;
  return {
    source_name: "RepVue company profile",
    url: profile.canonicalUrl,
    retrieved_at: profile.fetchedAt,
    confidence: ratings >= 100 ? "high" : ratings >= 20 ? "medium" : "low",
    method: "scraped",
    note: `${ratings} rep ratings on RepVue`,
  };
}

function submissionSource(agg: SubmissionAggregate): MetricSource {
  return {
    source_name: `Verified community submissions (${agg.region}, n=${agg.n})`,
    retrieved_at: agg.latestSubmittedAt,
    confidence: agg.n >= 10 ? "high" : "medium",
    method: "manual",
    note: agg.includesSampleData
      ? "Includes seeded sample rows, clearly labelled in the UI"
      : "Work-email-hash or invite-code verified",
  };
}

function percentile(
  profile: RepVueProfile,
  category: string
): number | null {
  return (
    profile.categoryRankings.find((r) => r.category === category)
      ?.percentile ?? null
  );
}

function buildScore(
  base: number,
  contributions: ScoreContribution[]
): DimensionScore {
  const total = contributions.reduce((sum, c) => sum + c.delta, base);
  const sources = dedupeSources(contributions.flatMap((c) => c.sources));
  return { value: clamp(total), sources, contributions };
}

function insufficient(reason: string): DimensionScore {
  return { value: null, sources: [], contributions: [], insufficientReason: reason };
}

function dedupeSources(sources: MetricSource[]): MetricSource[] {
  const seen = new Set<string>();
  const out: MetricSource[] = [];
  for (const s of sources) {
    const key = `${s.source_name}|${s.url ?? ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

const MONTH_MS = 30.44 * 24 * 60 * 60 * 1000;

function monthsAgo(dateIso: string): number {
  return (Date.now() - Date.parse(dateIso)) / MONTH_MS;
}

// ---------------------------------------------------------------------------
// Dimension: Timing
// ---------------------------------------------------------------------------

function scoreTiming(
  jobs: JobsAnalysis | null,
  events: CompanyEvent[],
  repvue: RepVueProfile | null
): DimensionScore {
  const funding = events.filter((e) => e.type === "funding");
  if (!jobs && funding.length === 0) {
    return insufficient(
      "No public job-board snapshot and no sourced funding events"
    );
  }

  const contributions: ScoreContribution[] = [];

  const recentFunding = funding.find((e) => monthsAgo(e.date) <= 12);
  const olderFunding = funding.find(
    (e) => monthsAgo(e.date) > 12 && monthsAgo(e.date) <= 24
  );
  if (recentFunding) {
    const size = recentFunding.amountUsdM ?? 100;
    const delta = Math.min(22, Math.round(8 + Math.log10(size) * 4));
    contributions.push({
      label: `${recentFunding.headline} (${recentFunding.date.slice(0, 7)})`,
      delta,
      sources: recentFunding.sources,
    });
  } else if (olderFunding) {
    contributions.push({
      label: `Funding round ${olderFunding.date.slice(0, 7)} (12–24 months old)`,
      delta: 8,
      sources: olderFunding.sources,
    });
  } else if (funding.length === 0) {
    contributions.push({
      label: "No sourced funding event on record",
      delta: -6,
      sources: [],
    });
  }

  if (jobs) {
    const n = jobs.gtmPostings;
    const delta =
      n >= 100 ? 18 : n >= 40 ? 14 : n >= 15 ? 9 : n >= 5 ? 4 : n > 0 ? 1 : -12;
    contributions.push({
      label: `${n} open GTM postings on the public job board`,
      delta,
      sources: [jobBoardSource(jobs)],
    });
    if (jobs.recentGtmPostings >= 10) {
      contributions.push({
        label: `${jobs.recentGtmPostings} GTM postings published in the last 90 days`,
        delta: 6,
        sources: [jobBoardSource(jobs)],
      });
    }
  }

  const contraction = events.find(
    (e) => e.type === "contraction" && monthsAgo(e.date) <= 14
  );
  if (contraction) {
    contributions.push({
      label: `Contraction signal: ${contraction.headline}`,
      delta: -15,
      sources: contraction.sources,
    });
  }

  if (repvue?.trend) {
    if (/down/i.test(repvue.trend)) {
      contributions.push({
        label: "RepVue rep-sentiment trending down",
        delta: -5,
        sources: [repvueSource(repvue)],
      });
    } else if (/up/i.test(repvue.trend)) {
      contributions.push({
        label: "RepVue rep-sentiment trending up",
        delta: 5,
        sources: [repvueSource(repvue)],
      });
    }
  }

  return buildScore(45, contributions);
}

// ---------------------------------------------------------------------------
// Dimension: Territory
// ---------------------------------------------------------------------------

function scoreTerritory(
  jobs: JobsAnalysis | null,
  events: CompanyEvent[]
): DimensionScore {
  if (!jobs) {
    return insufficient("No public job-board snapshot for this company");
  }
  const contributions: ScoreContribution[] = [];
  const source = jobBoardSource(jobs);

  const activeRegions = Object.entries(jobs.gtmByRegion).filter(
    ([region, count]) =>
      region !== "REMOTE" && region !== "UNKNOWN" && (count ?? 0) >= 2
  );
  contributions.push({
    label: `GTM hiring active in ${activeRegions.length} region${activeRegions.length === 1 ? "" : "s"} (${activeRegions.map(([r]) => r).join(", ") || "none"})`,
    delta: Math.min(28, activeRegions.length * 7),
    sources: [source],
  });

  const total = jobs.gtmPostings || 1;
  const amer = jobs.gtmByRegion.AMER ?? 0;
  const intlShare = (total - amer) / total;
  if (jobs.gtmPostings >= 5) {
    contributions.push({
      label: `${Math.round(intlShare * 100)}% of GTM postings outside AMER`,
      delta: Math.round(intlShare * 20),
      sources: [source],
    });
  }

  const anzCount = jobs.anzGtmPostings.length;
  if (anzCount > 0) {
    contributions.push({
      label: `${anzCount} AU/NZ GTM posting${anzCount === 1 ? "" : "s"} live`,
      delta: 6,
      sources: [source],
    });
  }
  if (jobs.newAnzSignal) {
    contributions.push({
      label: `Fresh ANZ posting: "${jobs.newAnzSignal.title}"`,
      delta: 6,
      sources: [
        { ...source, url: jobs.newAnzSignal.url, note: "Job posting" },
      ],
    });
  }

  for (const [region, pct] of Object.entries(jobs.regionChangePct)) {
    if (pct != null && pct <= -25) {
      contributions.push({
        label: `${region} GTM postings dropped ${Math.abs(pct)}% since last snapshot`,
        delta: Math.max(-20, Math.round(pct * 0.4)),
        sources: [source],
      });
    }
  }

  const regionalContraction = events.find(
    (e) =>
      e.type === "contraction" &&
      e.feedsThreeT.includes("territory") &&
      monthsAgo(e.date) <= 14
  );
  if (regionalContraction) {
    contributions.push({
      label: `Regional contraction: ${regionalContraction.headline}`,
      delta: -12,
      sources: regionalContraction.sources,
    });
  }

  return buildScore(35, contributions);
}

// ---------------------------------------------------------------------------
// Dimension: Talent
// ---------------------------------------------------------------------------

function scoreTalent(
  repvue: RepVueProfile | null,
  people: PeopleSignals | null,
  aggregates: SubmissionAggregate[]
): DimensionScore {
  if (!repvue && !people && aggregates.length === 0) {
    return insufficient(
      "No RepVue profile, people-data signals, or verified submissions"
    );
  }
  const contributions: ScoreContribution[] = [];

  if (repvue) {
    const source = repvueSource(repvue);
    const factors: [string, number | null, number][] = [
      ["Incentive comp structure", percentile(repvue, "Incentive Compensation Structure"), 0.2],
      ["Base compensation", percentile(repvue, "Base Compensation"), 0.12],
      ["Culture & leadership", percentile(repvue, "Culture and Leadership"), 0.15],
      ["Professional development", percentile(repvue, "Professional Development and Training"), 0.08],
    ];
    for (const [label, pct, weight] of factors) {
      if (pct != null) {
        // Centered on the 50th percentile so weak percentiles subtract.
        const delta = Math.round((pct - 50) * weight * 2);
        contributions.push({
          label: `RepVue ${label.toLowerCase()}: ${pct}th percentile`,
          delta,
          sources: [source],
        });
      }
    }
    if (repvue.trend && /down/i.test(repvue.trend)) {
      contributions.push({
        label: "RepVue trending down",
        delta: -4,
        sources: [source],
      });
    }
  }

  if (people) {
    if (people.avgTenureMonths != null) {
      const t = people.avgTenureMonths;
      const delta = t >= 18 ? 5 : t < 9 ? -8 : 0;
      if (delta !== 0) {
        contributions.push({
          label: `Average GTM tenure ${Math.round(t)} months (${people.sources[0]?.source_name})`,
          delta,
          sources: people.sources,
        });
      }
    }
    if ((people.newHiresLast6Months ?? 0) >= 5) {
      contributions.push({
        label: `${people.newHiresLast6Months} GTM hires detected in the last 6 months`,
        delta: 4,
        sources: people.sources,
      });
    }
  }

  for (const agg of aggregates) {
    contributions.push({
      label: `Verified submissions (${agg.region}, n=${agg.n}): attainment index ${agg.attainmentScore}`,
      delta: Math.round((agg.attainmentScore - 70) * 0.3),
      sources: [submissionSource(agg)],
    });
  }

  return buildScore(50, contributions);
}

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

function scoreGtmMomentum(jobs: JobsAnalysis | null): DimensionScore {
  if (!jobs) return insufficient("No public job-board snapshot");
  const contributions: ScoreContribution[] = [];
  const source = jobBoardSource(jobs);
  const n = jobs.gtmPostings;
  contributions.push({
    label: `${n} open GTM postings`,
    delta: n >= 150 ? 40 : n >= 60 ? 32 : n >= 25 ? 22 : n >= 10 ? 12 : n >= 3 ? 4 : -20,
    sources: [source],
  });
  if (jobs.recentGtmPostings > 0) {
    const share = jobs.recentGtmPostings / Math.max(1, n);
    contributions.push({
      label: `${jobs.recentGtmPostings} published in the last 90 days (${Math.round(share * 100)}% of open GTM roles)`,
      delta: Math.round(share * 15),
      sources: [source],
    });
  }
  if (jobs.gtmChangePct != null) {
    contributions.push({
      label: `GTM postings ${jobs.gtmChangePct >= 0 ? "up" : "down"} ${Math.abs(jobs.gtmChangePct)}% vs prior snapshot`,
      delta: Math.max(-20, Math.min(15, Math.round(jobs.gtmChangePct * 0.4))),
      sources: [source],
    });
  }
  return buildScore(40, contributions);
}

function scoreFundingVelocity(events: CompanyEvent[]): DimensionScore {
  const funding = events.filter((e) => e.type === "funding");
  if (funding.length === 0) {
    return insufficient("No sourced funding events on record");
  }
  const contributions: ScoreContribution[] = [];
  for (const event of funding) {
    const months = monthsAgo(event.date);
    const size = event.amountUsdM ?? 100;
    const recencyFactor = months <= 12 ? 1 : months <= 24 ? 0.6 : 0.25;
    contributions.push({
      label: `${event.headline} (${event.date.slice(0, 7)})`,
      delta: Math.round(Math.min(45, (10 + Math.log10(size) * 9) * recencyFactor)),
      sources: event.sources,
    });
  }
  return buildScore(30, contributions);
}

function scoreQuotaReality(
  repvue: RepVueProfile | null,
  aggregates: SubmissionAggregate[]
): DimensionScore {
  if (aggregates.length === 0 && !repvue) {
    return insufficient(
      "No verified community submissions and no RepVue profile"
    );
  }
  const contributions: ScoreContribution[] = [];

  // Verified submissions take precedence (P2.12) — scraped proxies are
  // deprecated for regions where submission data exists.
  if (aggregates.length > 0) {
    for (const agg of aggregates) {
      contributions.push({
        label: `Attainment index ${agg.attainmentScore} from verified submissions (${agg.region}, n=${agg.n}, median ramp ${agg.medianRampMonths}mo)`,
        delta: Math.round((agg.attainmentScore - 50) * 0.9),
        sources: [submissionSource(agg)],
      });
    }
    return buildScore(50, contributions);
  }

  const source = repvueSource(repvue!);
  const incentive = percentile(repvue!, "Incentive Compensation Structure");
  const inbound = percentile(repvue!, "Inbound Lead / Opportunity Flow");
  if (incentive == null && inbound == null) {
    return insufficient("RepVue profile lacks comp/lead-flow percentiles");
  }
  if (incentive != null) {
    contributions.push({
      label: `RepVue incentive comp structure: ${incentive}th percentile`,
      delta: Math.round((incentive - 50) * 0.55),
      sources: [source],
    });
  }
  if (inbound != null) {
    contributions.push({
      label: `RepVue inbound lead flow: ${inbound}th percentile`,
      delta: Math.round((inbound - 50) * 0.35),
      sources: [source],
    });
  }
  return buildScore(50, contributions);
}

function scoreRegionalBalance(jobs: JobsAnalysis | null): DimensionScore {
  if (!jobs || jobs.gtmPostings < 3) {
    return insufficient("Too few GTM postings to assess regional balance");
  }
  const contributions: ScoreContribution[] = [];
  const source = jobBoardSource(jobs);

  const buckets = ["AMER", "EMEA", "APAC", "ANZ", "LATAM"] as const;
  const counts = buckets.map((b) => jobs.gtmByRegion[b] ?? 0);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  // Normalized Shannon entropy over regional distribution → 0 (single
  // region) to 1 (evenly spread across all five buckets).
  let entropy = 0;
  for (const c of counts) {
    if (c > 0) {
      const p = c / total;
      entropy -= p * Math.log(p);
    }
  }
  const normalized = entropy / Math.log(buckets.length);
  contributions.push({
    label: `Regional spread index ${Math.round(normalized * 100)}/100 across ${counts.filter((c) => c > 0).length} regions`,
    delta: Math.round(normalized * 55),
    sources: [source],
  });

  for (const [region, pct] of Object.entries(jobs.regionChangePct)) {
    if (pct != null && pct <= -25) {
      contributions.push({
        label: `${region} postings declined ${Math.abs(pct)}%`,
        delta: Math.max(-25, Math.round(pct * 0.5)),
        sources: [source],
      });
    }
  }
  return buildScore(35, contributions);
}

function scorePmfStrength(repvue: RepVueProfile | null): DimensionScore {
  const pmf = repvue ? percentile(repvue, "Product - Market Fit") : null;
  if (repvue == null || pmf == null) {
    return insufficient("No RepVue product-market-fit percentile available");
  }
  return buildScore(0, [
    {
      label: `RepVue product-market-fit rating: ${pmf}th percentile among rated companies`,
      delta: pmf,
      sources: [repvueSource(repvue)],
    },
  ]);
}

// ---------------------------------------------------------------------------
// ANZ expansion detectors (P1.7)
// ---------------------------------------------------------------------------

function detectAnz(
  companySlug: string,
  jobs: JobsAnalysis | null
): AnzDetection[] {
  const detections: AnzDetection[] = [];

  if (jobs && jobs.anzGtmPostings.length > 0) {
    const first = jobs.anzGtmPostings[0];
    detections.push({
      detector: "first_au_job_posting",
      label: "AU/NZ job postings live",
      detail: `${jobs.anzGtmPostings.length} GTM posting${jobs.anzGtmPostings.length === 1 ? "" : "s"} in AU/NZ, e.g. "${first.title}" (${first.location})`,
      date: first.publishedAt,
      sources: [
        {
          source_name: "Public job board (official ATS API)",
          url: first.url,
          retrieved_at: jobs.fetchedAt,
          confidence: "high",
          method: "scraped",
        },
      ],
    });
  }

  // Curated detectors: AU leadership hires from the team_intel table.
  for (const record of getTeamIntelForCompany(companySlug)) {
    if (record.region === "ANZ") {
      detections.push({
        detector: "first_au_gtm_hire",
        label: "AU GTM leadership in seat",
        detail: `${record.leader_role} (ex-${record.prior_companies.join(", ex-")}, joined at ${record.joined_stage})`,
        date: null,
        sources: [
          {
            source_name: "team_intel (curated record)",
            retrieved_at: record.curated_at,
            confidence: "medium",
            method: "manual",
            note: `Curated by ${record.curated_by}. Verify AU entity via ASIC: https://connectonline.asic.gov.au`,
          },
        ],
      });
    }
  }

  return detections;
}

// ---------------------------------------------------------------------------
// Scorecard assembly
// ---------------------------------------------------------------------------

const scorecardCache = new Map<string, CompanyScorecard>();

export function computeScorecard(companySlug: string): CompanyScorecard {
  const cached = scorecardCache.get(companySlug);
  if (cached) return cached;

  const jobs = getJobsAnalysis(companySlug);
  const events = getEventsForCompany(companySlug);
  const repvue = getCachedRepvueProfile(companySlug);
  const provider = getPeopleDataProvider();
  const peopleResult = provider.getSignals(companySlug);
  const people = peopleResult instanceof Promise ? null : peopleResult;
  const aggregates = getAggregatesForCompany(companySlug);
  const pricing = getProductPricing(companySlug);

  // rep_comp_model comes from human submissions only (P1.9).
  let repCompModel: CompanyScorecard["repCompModel"] = {
    model: "unknown",
    sources: [],
    fromSampleData: false,
  };
  const compAgg = aggregates.find(
    (a) => Object.keys(a.compModels).length > 0
  );
  if (compAgg) {
    const [topModel] = Object.entries(compAgg.compModels).sort(
      (a, b) => (b[1] ?? 0) - (a[1] ?? 0)
    )[0];
    repCompModel = {
      model: topModel as CompanyScorecard["repCompModel"]["model"],
      sources: [submissionSource(compAgg)],
      fromSampleData: compAgg.includesSampleData,
    };
  }

  const dimensions = {
    timing: scoreTiming(jobs, events, repvue),
    territory: scoreTerritory(jobs, events),
    talent: scoreTalent(repvue, people, aggregates),
  };

  const benchmarks = {
    gtm_momentum: scoreGtmMomentum(jobs),
    funding_velocity: scoreFundingVelocity(events),
    quota_reality: scoreQuotaReality(repvue, aggregates),
    regional_balance: scoreRegionalBalance(jobs),
    pmf_strength: scorePmfStrength(repvue),
  };

  const allSources = [
    ...Object.values(dimensions).flatMap((d) => d.sources),
    ...Object.values(benchmarks).flatMap((d) => d.sources),
  ];
  let lastUpdated: string | null = null;
  for (const s of allSources) {
    if (!lastUpdated || s.retrieved_at > lastUpdated) {
      lastUpdated = s.retrieved_at;
    }
  }

  const scorecard: CompanyScorecard = {
    companySlug,
    dimensions,
    benchmarks,
    roleMix: jobs?.roleMix ?? null,
    gtmPostings: jobs?.gtmPostings ?? null,
    gtmByRegion: jobs?.gtmByRegion ?? null,
    jobBoardUrl: jobs?.boardUrl ?? null,
    anzDetections: detectAnz(companySlug, jobs),
    productPricing: pricing,
    repCompModel,
    lastUpdated,
  };
  scorecardCache.set(companySlug, scorecard);
  return scorecard;
}
