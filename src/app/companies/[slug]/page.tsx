import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  Globe,
  MapPin,
  Train,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompositeBadge } from "@/components/composite-badge";
import {
  CuratedFlag,
  LastUpdated,
  SourceChip,
  SourcedScore,
} from "@/components/provenance";
import { SignalFeed } from "@/components/signal-feed";
import { companies, getCompanyBySlug } from "@/lib/data";
import { computeScorecard } from "@/lib/scoring/engine";
import { getJobsAnalysis } from "@/lib/jobs/cache";
import { getTeamIntelForCompany } from "@/lib/team-intel";
import { getSignalLogForCompany } from "@/lib/signal-log";
import { getEventsForCompany } from "@/lib/events";
import { getAggregatesForCompany } from "@/lib/submissions/store";
import { PRODUCT_PRICING_LABELS, REP_COMP_LABELS } from "@/lib/pricing";
import { MIN_AGGREGATE_N } from "@/lib/submissions/types";
import type { DimensionScore } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return companies.map((company) => ({
    slug: company.slug,
  }));
}

const DIMENSION_META: {
  key: "timing" | "territory" | "talent";
  label: string;
  blurb: string;
}[] = [
  {
    key: "timing",
    label: "Timing",
    blurb:
      "Sourced funding events, open GTM hiring volume, publish velocity, and contraction penalties.",
  },
  {
    key: "territory",
    label: "Territory",
    blurb:
      "Regional spread of GTM postings, international share, ANZ signals, and regional-decline penalties.",
  },
  {
    key: "talent",
    label: "Talent",
    blurb:
      "RepVue comp/culture percentiles, people-data tenure signals, and verified community submissions.",
  },
];

/** Server-rendered contribution breakdown — every delta with its sources. */
function ContributionBreakdown({ score }: { score: DimensionScore }) {
  if (score.value == null) {
    return (
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Insufficient data:</span>{" "}
        {score.insufficientReason}. We never render a synthesized number —
        see <Link href="/methodology" className="underline">methodology</Link>.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {score.contributions.map((c, i) => (
        <li
          key={i}
          className="flex items-start justify-between gap-3 text-sm"
        >
          <span className="min-w-0 text-muted-foreground">
            {c.label}{" "}
            {c.sources.length > 0 && <SourceChip sources={c.sources} />}
          </span>
          <span
            className={cn(
              "font-mono-data shrink-0 font-semibold tabular-nums",
              c.delta > 0
                ? "text-emerald-600"
                : c.delta < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
            )}
          >
            {c.delta > 0 ? `+${c.delta}` : c.delta}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function CompanyDetailPage(
  props: PageProps<"/companies/[slug]">
) {
  const { slug } = await props.params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const scorecard = computeScorecard(slug);
  const jobs = getJobsAnalysis(slug);
  const teamIntel = getTeamIntelForCompany(slug);
  const signalEntries = getSignalLogForCompany(slug);
  const events = getEventsForCompany(slug);
  const aggregates = getAggregatesForCompany(slug);
  const dims = scorecard.dimensions;

  const regionRows = jobs
    ? (Object.entries(jobs.gtmByRegion) as [string, number][])
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
    : [];

  const roleRows = scorecard.roleMix
    ? ([
        ["AE", scorecard.roleMix.ae],
        ["SE / FDE", scorecard.roleMix.se_fde],
        ["SDR", scorecard.roleMix.sdr],
        ["CS", scorecard.roleMix.cs],
        ["GTM leadership", scorecard.roleMix.gtm_leadership],
        ["Other GTM", scorecard.roleMix.gtm_other],
      ] as [string, number][])
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        render={<Link href="/companies" />}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All Companies
      </Button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center border border-rule bg-background font-display text-2xl font-semibold text-brief">
            {company.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold">
                {company.name}
              </h1>
              <CompositeBadge scorecard={scorecard} size="lg" />
            </div>
            <p className="mt-2 text-muted-foreground">{company.description}</p>
            <p className="mt-3 border border-rule bg-muted/30 px-4 py-3 text-sm font-medium">
              <Train className="mr-1.5 inline h-4 w-4 text-gravy" aria-hidden />
              {company.sellsItself}{" "}
              <CuratedFlag className="ml-1 align-middle" />
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
                {company.industry}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {company.hq}
              </span>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-brief hover:underline"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden />
                Website
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
              <LastUpdated
                iso={scorecard.lastUpdated}
                prefix="Signals last updated"
                className="text-sm"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {company.categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="text-xs capitalize"
                >
                  {cat.replace("_", " ")}
                </Badge>
              ))}
              {scorecard.anzDetections.length > 0 && (
                <Badge className="border-gravy/40 bg-gravy/15 text-xs text-brief">
                  <MapPin className="mr-1 h-3 w-3" aria-hidden />
                  Expanding into ANZ
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sourced benchmark scores — click any tile for provenance */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Benchmark scores</h2>
        <p className="text-xs text-muted-foreground">
          Click any score for sources, method, and breakdown
        </p>
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <SourcedScore label="Timing" score={dims.timing} />
        <SourcedScore label="Territory" score={dims.territory} />
        <SourcedScore label="Talent" score={dims.talent} />
        <SourcedScore
          label="GTM Momentum"
          score={scorecard.benchmarks.gtm_momentum}
        />
        <SourcedScore
          label="Funding"
          score={scorecard.benchmarks.funding_velocity}
        />
        <SourcedScore
          label="Quota Reality"
          score={scorecard.benchmarks.quota_reality}
        />
        <SourcedScore
          label="Regional"
          score={scorecard.benchmarks.regional_balance}
        />
        <SourcedScore label="PMF" score={scorecard.benchmarks.pmf_strength} />
      </div>

      {/* Three T's with full contribution breakdowns */}
      <section className="mb-10">
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold">The Three T&apos;s</h2>
          <p className="mt-1 text-muted-foreground">
            Every point is a signed contribution from a sourced signal —
            negative signals subtract. Default weights are Timing 50 /
            Territory 30 / Talent 20; adjust them on the{" "}
            <Link href="/companies" className="underline">
              companies page
            </Link>
            .
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {DIMENSION_META.map(({ key, label, blurb }) => (
            <Card key={key} className="border-rule shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {label}
                  <span className="font-mono-data text-lg tabular-nums">
                    {dims[key].value ?? "—"}
                    <span className="text-xs text-muted-foreground">/100</span>
                  </span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{blurb}</p>
              </CardHeader>
              <CardContent>
                <ContributionBreakdown score={dims[key]} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Job board pipeline */}
          <Card className="border-rule shadow-none">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-gravy" aria-hidden />
                Public job-board signals
                {jobs && (
                  <a
                    href={jobs.boardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-xs font-normal text-brief hover:underline"
                  >
                    Official board
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Polled daily from the company&apos;s official Greenhouse /
                Lever / Ashby API — the legal-safe replacement for LinkedIn
                scraping.
              </p>
            </CardHeader>
            <CardContent>
              {jobs ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="border border-rule bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Open GTM postings
                      </p>
                      <p className="font-mono-data text-xl font-semibold">
                        {jobs.gtmPostings}
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}
                          / {jobs.totalPostings} total
                        </span>
                      </p>
                    </div>
                    <div className="border border-rule bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Published last 90 days
                      </p>
                      <p className="font-mono-data text-xl font-semibold">
                        {jobs.recentGtmPostings}
                      </p>
                    </div>
                    <div className="border border-rule bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        AU/NZ GTM postings
                      </p>
                      <p className="font-mono-data text-xl font-semibold">
                        {jobs.anzGtmPostings.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Role mix (AE vs SE/FDE vs SDR)
                      </p>
                      <ul className="space-y-1.5">
                        {roleRows.map(([label, count]) => (
                          <li
                            key={label}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {label}
                            </span>
                            <span className="font-mono-data font-semibold tabular-nums">
                              {count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        GTM postings by region
                      </p>
                      <ul className="space-y-1.5">
                        {regionRows.map(([region, count]) => (
                          <li
                            key={region}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {region}
                            </span>
                            <span className="font-mono-data font-semibold tabular-nums">
                              {count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-4 border-t border-rule pt-3 text-[11px] text-muted-foreground">
                    Retrieved {new Date(jobs.fetchedAt).toLocaleString()} from{" "}
                    the official ATS API. Momentum diffs compare against the
                    prior snapshot
                    {jobs.priorFetchedAt
                      ? ` (${jobs.priorFetchedAt.slice(0, 10)})`
                      : " — first snapshot, diffs begin next refresh"}
                    .
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No public ATS board is tracked for this company yet —
                  job-derived metrics render as &ldquo;insufficient
                  data&rdquo; rather than an estimate.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quota reality — community submissions first */}
          <Card className="border-rule shadow-none">
            <CardHeader>
              <CardTitle className="text-base">
                Quota reality — verified community data
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Aggregates render only when {MIN_AGGREGATE_N}+ verified
                submissions exist per company-region. Where submission data
                exists, scraped review-site proxies are deprecated for that
                region.
              </p>
            </CardHeader>
            <CardContent>
              {aggregates.length > 0 ? (
                <div className="space-y-4">
                  {aggregates.map((agg) => (
                    <div
                      key={`${agg.company}-${agg.region}`}
                      className="border border-rule bg-muted/20 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {agg.region} · n={agg.n}
                        </Badge>
                        {agg.includesSampleData && (
                          <CuratedFlag label="Includes seeded sample rows" />
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          Latest submission{" "}
                          {agg.latestSubmittedAt.slice(0, 10)}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Attainment index
                          </p>
                          <p className="font-mono-data text-lg font-semibold">
                            {agg.attainmentScore}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Median ramp
                          </p>
                          <p className="font-mono-data text-lg font-semibold">
                            {agg.medianRampMonths} mo
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Rep comp model (submitted)
                          </p>
                          <p className="text-sm font-medium">
                            {Object.entries(agg.compModels)
                              .map(([m, n]) => `${m} (${n})`)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 border-t border-rule pt-2 text-[11px] text-muted-foreground">
                        RepVue/Glassdoor proxies are deprecated for{" "}
                        {agg.region} — this aggregate takes precedence in
                        Quota Reality.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No company-region cohort has reached {MIN_AGGREGATE_N}{" "}
                  verified submissions yet. Quota Reality falls back to
                  RepVue percentiles (labelled as a proxy) or shows
                  &ldquo;insufficient data&rdquo;.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                render={<Link href={`/submit?company=${slug}`} />}
              >
                Submit your comp / quota data anonymously
              </Button>
            </CardContent>
          </Card>

          {/* Signal-change log */}
          <div>
            <h2 className="mb-1 font-display text-xl font-bold">
              Signal-change log
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Diffable history of what moved and why — refreshed daily from
              job boards, weekly for funding/news.
            </p>
            {signalEntries.length > 0 ? (
              <SignalFeed entries={signalEntries.slice(0, 8)} />
            ) : (
              <p className="border border-dashed border-rule bg-card px-4 py-6 text-sm text-muted-foreground">
                No logged signal changes yet — tracking begins with the first
                job-board snapshot.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* ANZ expansion detectors */}
          <Card className="border-rule shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-gravy" aria-hidden />
                ANZ expansion detectors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scorecard.anzDetections.length > 0 ? (
                <ul className="space-y-3">
                  {scorecard.anzDetections.map((d, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-medium">
                        {d.label}{" "}
                        <SourceChip sources={d.sources} />
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {d.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No ANZ signals detected: no AU/NZ postings on the official
                  board, no curated AU leadership records. Detectors also
                  watch ASIC entity registrations and AU event presence.
                </p>
              )}
            </CardContent>
          </Card>

          {/* team_intel — facts, not scores */}
          <Card className="border-rule shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-gravy" aria-hidden />
                AU/APAC leadership intel
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Curated facts, deliberately not a numeric &ldquo;team
                strength&rdquo; score — small regions make scoring
                identifiable individuals both unfair and statistically
                meaningless.
              </p>
            </CardHeader>
            <CardContent>
              {teamIntel.length > 0 ? (
                <ul className="space-y-4">
                  {teamIntel.map((record, i) => (
                    <li key={i} className="border border-rule bg-muted/20 p-3">
                      <p className="text-sm font-medium">
                        {record.leader_role}{" "}
                        <span className="text-muted-foreground">
                          · {record.region}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ex-{record.prior_companies.join(", ex-")} · joined at{" "}
                        {record.joined_stage} · tenure {record.tenure}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {record.notable_signals.map((signal) => (
                          <li
                            key={signal}
                            className="text-xs text-muted-foreground"
                          >
                            → {signal}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        Curated by {record.curated_by} ·{" "}
                        {record.curated_at}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No curated leadership records for this company yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pricing vs rep comp — deliberately separate */}
          <Card className="border-rule shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Pricing vs rep comp</CardTitle>
              <p className="text-xs text-muted-foreground">
                Two different things: how the product is priced (public
                pages) and how reps are actually paid (human submissions
                only).
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border border-rule bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">
                  product_pricing_model
                </p>
                {scorecard.productPricing ? (
                  <p className="mt-1 text-sm font-medium">
                    {PRODUCT_PRICING_LABELS[scorecard.productPricing.model]}{" "}
                    <SourceChip
                      sources={scorecard.productPricing.sources}
                    />
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    insufficient data — no verified pricing-page read
                  </p>
                )}
              </div>
              <div className="border border-rule bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">rep_comp_model</p>
                <p className="mt-1 text-sm font-medium">
                  {REP_COMP_LABELS[scorecard.repCompModel.model]}
                  {scorecard.repCompModel.sources.length > 0 && (
                    <SourceChip
                      sources={scorecard.repCompModel.sources}
                    />
                  )}
                </p>
                {scorecard.repCompModel.model === "unknown" ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Defaults to unknown until verified rep submissions exist —
                    never inferred from the pricing model.
                  </p>
                ) : (
                  scorecard.repCompModel.fromSampleData && (
                    <CuratedFlag
                      label="From seeded sample submissions"
                      className="mt-1"
                    />
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Curated events with sources */}
          <Card className="border-rule shadow-none">
            <CardHeader>
              <CardTitle className="text-base">
                Curated events (sourced)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <ul className="space-y-3">
                  {events
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((event) => (
                      <li key={event.id} className="text-sm">
                        <p className="font-medium">
                          {event.headline} <SourceChip sources={event.sources} />
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {event.date} · {event.detail}
                        </p>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No curated events on record for this company.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
