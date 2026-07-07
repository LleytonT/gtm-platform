import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  MapPin,
  Calendar,
  Globe,
  Building2,
  Briefcase,
  ExternalLink,
  Train,
  Clock,
  Map,
  Radar,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GravyTrainBadge } from "@/components/gravy-train-badge";
import { ThreeTsOverview } from "@/components/three-ts-overview";
import { BenchmarkStrip } from "@/components/benchmark-strip";
import { QualitativeSignals } from "@/components/qualitative-signals";
import { AnzExpansionBadge } from "@/components/company-card";
import {
  InsufficientData,
  LastUpdated,
  WithSources,
} from "@/components/provenance";
import { WeightControls, RoleLensTabs } from "@/components/score-settings";
import { getCompanyBySlug, getResearchForCompany } from "@/lib/data";
import { buildScorecard, getCommunityAggregates } from "@/lib/scorecards";
import { getScoreColor } from "@/lib/scoring";
import { SALES_MOTION_LABELS } from "@/lib/benchmarks";
import { PRODUCT_PRICING_LABELS, REP_COMP_LABELS, RepCompModel } from "@/lib/pricing-models";
import { getEventsForCompany } from "@/lib/curated-events";
import { getTeamIntelForCompany } from "@/lib/team-intel";
import { getAnzSignalsForCompany, ANZ_SIGNAL_LABELS } from "@/lib/signals/anz-expansion";
import { getSignalLogForCompany, describeChange } from "@/lib/signal-log";
import { getAggregatesForCompany } from "@/lib/community/aggregate";
import { THREE_T_META, THREE_T_ORDER } from "@/lib/three-ts";
import { formatRetrievedAt } from "@/lib/provenance";
import { cn } from "@/lib/utils";

const ResearchPlaybook = dynamicImport(
  () =>
    import("@/components/research-playbook").then((m) => ({
      default: m.ResearchPlaybook,
    })),
  {
    loading: () => (
      <div className="border border-dashed border-rule bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        Loading research playbook…
      </div>
    ),
  }
);

const DIMENSION_ICONS = {
  timing: Clock,
  territory: Map,
  talent: Users,
};

/**
 * Rendered on demand: company pages surface runtime data (community
 * submission aggregates, cron-appended signal-log entries, refreshed job
 * boards) that changes between deploys.
 */
export const dynamic = "force-dynamic";

export default async function CompanyDetailPage(
  props: PageProps<"/companies/[slug]">
) {
  const { slug } = await props.params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const scorecard = buildScorecard(slug);
  const research = getResearchForCompany(company);
  const events = getEventsForCompany(slug);
  const teamIntel = getTeamIntelForCompany(slug);
  const anzSignals = getAnzSignalsForCompany(slug);
  const changeLog = getSignalLogForCompany(slug);
  const aggregates = getAggregatesForCompany(getCommunityAggregates(), slug);

  // Rep comp model comes from verified human submissions only.
  const repCompModel: RepCompModel =
    aggregates.map((a) => a.compModelConsensus).find((m) => m !== "unknown") ??
    "unknown";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6" render={<Link href="/companies" />}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        All Companies
      </Button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-white text-2xl font-bold text-primary shadow-sm">
            {company.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <GravyTrainBadge scorecard={scorecard} size="lg" />
              {anzSignals.length > 0 && <AnzExpansionBadge />}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <LastUpdated iso={scorecard.lastUpdated} prefix="Data updated" />
            </div>
            <p className="mt-2 text-muted-foreground">{company.description}</p>
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm font-medium text-emerald-900">
              <Train className="mr-1.5 inline h-4 w-4" />
              {company.sellsItself}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {company.industry}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {company.hq}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {company.headcount} employees
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Founded {company.founded}
              </span>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {company.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs capitalize">
                  {cat.replace("_", " ")}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                {SALES_MOTION_LABELS[company.salesMotion]}
              </Badge>
              {company.productPricingSource ? (
                <WithSources
                  sources={[company.productPricingSource]}
                  label="Product pricing model"
                >
                  <Badge variant="outline" className="text-xs">
                    {PRODUCT_PRICING_LABELS[company.productPricingModel]}
                  </Badge>
                </WithSources>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {PRODUCT_PRICING_LABELS.unknown}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  repCompModel === "unknown" && "text-muted-foreground"
                )}
                title="How reps are paid — sourced from verified human submissions only, never inferred from the pricing model."
              >
                Reps: {REP_COMP_LABELS[repCompModel]}
                {repCompModel === "unknown" && " (no verified submissions)"}
              </Badge>
            </div>
            {company.expandingRegions && company.expandingRegions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {company.expandingRegions.map((region) => (
                  <Badge key={region} variant="outline" className="text-xs">
                    <MapPin className="mr-1 h-3 w-3" />
                    Expanding: {region}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benchmark scores — every value carries provenance */}
      <div className="mb-8">
        <BenchmarkStrip scorecard={scorecard} />
        <p className="mt-2 text-xs text-muted-foreground">
          Hover or click any score for its sources. Formulas are public on the{" "}
          <Link href="/methodology" className="underline underline-offset-2">
            methodology page
          </Link>
          .
        </p>
      </div>

      {/* Weight + lens controls */}
      <div className="mb-8 grid gap-4 lg:grid-cols-[320px_1fr]">
        <WeightControls />
        <div className="flex flex-col justify-center border border-rule bg-card p-4">
          <RoleLensTabs />
          <p className="mt-3 text-sm text-muted-foreground">
            The Gravy Train score above is computed from your saved weights and
            role lens — change them and every score on the site re-ranks. The
            underlying sourced metrics never move.
          </p>
        </div>
      </div>

      {/* Negative signal penalties */}
      {scorecard.penalties.length > 0 && (
        <div className="mb-8 border border-destructive/30 bg-destructive/5 p-4">
          <p className="flex items-center gap-2 font-medium text-destructive">
            <ShieldAlert className="h-4 w-4" aria-hidden />
            Negative signals currently reducing this score
          </p>
          <ul className="mt-2 space-y-1.5">
            {scorecard.penalties.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                <span className="font-mono-data font-semibold text-destructive">
                  −{p.points} {THREE_T_META[p.dimension].label}
                </span>{" "}
                — {p.reason}{" "}
                <a
                  href={p.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  ({p.source.source_name})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Three T's — the core framework */}
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">The Three T&apos;s</h2>
          <p className="mt-1 text-muted-foreground">
            Timing, Territory, Talent — in that order. Computed from sourced
            inputs; dimensions without sourced data show &quot;insufficient
            data&quot;, never a synthesized number.
          </p>
        </div>
        <div className="mb-6">
          <ThreeTsOverview
            threeTs={company.threeTs}
            scorecard={scorecard}
            size="lg"
          />
        </div>

        <div className="space-y-6">
          {THREE_T_ORDER.map((key) => {
            const dimension = company.threeTs[key];
            const metric = scorecard.dimensions[key];
            const meta = THREE_T_META[key];
            const Icon = DIMENSION_ICONS[key];

            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {meta.order}
                    </span>
                    <Icon className="h-5 w-5 text-primary" />
                    {meta.label}
                    {metric.value === null ? (
                      <InsufficientData />
                    ) : (
                      <WithSources sources={metric.sources} label={meta.label}>
                        <Badge
                          variant="outline"
                          className={cn(getScoreColor(metric.value))}
                        >
                          {metric.value}/100
                        </Badge>
                      </WithSources>
                    )}
                    <span className="text-sm font-normal text-muted-foreground">
                      — {dimension.verdict}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{meta.description}</p>
                </CardHeader>
                <CardContent>
                  <QualitativeSignals signals={dimension.signals} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ANZ expansion signals */}
      {anzSignals.length > 0 && (
        <section className="mb-8">
          <Card className="border-sky-200 bg-sky-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-sky-700" aria-hidden />
                Expanding into ANZ
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Detected by the ANZ expansion watchers — first AU/NZ job
                postings, entity registrations (ASIC public search), GTM hire
                announcements, and event presence.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {anzSignals.map((signal, i) => (
                  <li key={i} className="border border-sky-200 bg-white/60 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-sky-300 text-[10px] text-sky-800">
                        {ANZ_SIGNAL_LABELS[signal.type]}
                      </Badge>
                      <span className="text-sm font-medium">{signal.headline}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {signal.detail}
                    </p>
                    <p className="mt-1.5 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                      {formatRetrievedAt(signal.detectedAt)} ·{" "}
                      <a
                        href={signal.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {signal.source.source_name}
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Team intel — facts, not scores */}
      {teamIntel.length > 0 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" aria-hidden />
                Team intel (curated facts)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manually curated leadership records, rendered as facts — never
                converted into a numeric &quot;team strength&quot; score. We
                don&apos;t score identifiable individuals in small regions.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {teamIntel.map((record, i) => (
                  <div key={i} className="border border-rule bg-muted/20 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {record.leader_role}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {record.region}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ex-{record.prior_companies.join(", ex-")} · joined at{" "}
                      {record.joined_stage} · tenure {record.tenure}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {record.notable_signals.map((signal) => (
                        <li key={signal} className="text-xs text-muted-foreground">
                          • {signal}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                      Curated by {record.curated_by} · {record.curated_at}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Community quota reality */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" aria-hidden />
              Quota reality — verified community submissions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Anonymous, verified rep submissions (Levels.fyi model).
              Aggregates only appear when n ≥ 3 per company-region — no
              individual data points are ever shown.
            </p>
          </CardHeader>
          <CardContent>
            {aggregates.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {aggregates.map((agg) => (
                  <div key={agg.region} className="border border-rule bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{agg.region}</Badge>
                      <span className="font-mono-data text-xs text-muted-foreground">
                        n={agg.n}
                      </span>
                    </div>
                    <dl className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Median OTE</dt>
                        <dd className="font-mono-data font-semibold">
                          ${Math.round(agg.medianOteUsd / 1000)}K
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Median base</dt>
                        <dd className="font-mono-data font-semibold">
                          ${Math.round(agg.medianBaseUsd / 1000)}K
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Avg attainment</dt>
                        <dd className="font-mono-data font-semibold">
                          {Math.round(agg.avgAttainmentPct)}%
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Avg ramp</dt>
                        <dd className="font-mono-data font-semibold">
                          {agg.avgRampMonths.toFixed(1)} mo
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Comp model</dt>
                        <dd>{REP_COMP_LABELS[agg.compModelConsensus]}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-rule bg-muted/20 px-4 py-6 text-center">
                <InsufficientData />
                <p className="mt-2 text-sm text-muted-foreground">
                  Fewer than 3 verified submissions per region for{" "}
                  {company.name}. Where submissions exist, they replace scraped
                  review-site proxies in the Quota Reality score.
                </p>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="outline" render={<Link href={`/submit?company=${slug}`} />}>
                Submit your comp data (anonymous)
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Signal change log */}
      {changeLog.length > 0 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-primary" aria-hidden />
                Signal change log
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Every score movement is diffable and explained — refreshed
                daily (job boards) and weekly (funding/news).
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {changeLog.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="border border-rule bg-muted/20 p-3 text-sm">
                    <p className="text-foreground">{describeChange(entry)}</p>
                    {entry.source && (
                      <a
                        href={entry.source.url}
                        target={entry.source.url.startsWith("/") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="mt-1 inline-block font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground underline underline-offset-2"
                      >
                        {entry.source.source_name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Research Playbook — the 5-step diligence workflow */}
      <div className="mb-12">
        <ResearchPlaybook
          research={research}
          companyName={company.name}
          companySlug={slug}
        />
      </div>

      {/* Supporting context — curated background, clearly flagged */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Supporting context</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Curated background facts (funding, retention, comp ranges). These are
          manually maintained descriptions —{" "}
          <span className="font-medium text-foreground">
            not scored and not independently verified
          </span>
          . The Three T&apos;s above are the sourced signals.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Financials
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  curated · unverified
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-lg font-semibold">{company.financials.revenue}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Growth Rate</p>
                  <p className="text-lg font-semibold">{company.financials.growthRate}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Funding</p>
                  <p className="text-sm font-medium">{company.financials.funding}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Last round</p>
                  <p className="text-sm font-medium">{company.financials.lastRound}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Product-Market Fit
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  curated · unverified
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Retention (reported)</p>
                  <p className="text-lg font-semibold">{company.pmf.retention}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Market growth</p>
                  <p className="text-sm font-medium">{company.pmf.marketGrowth}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {company.pmf.signals.map((signal) => (
                  <li key={signal} className="text-sm text-muted-foreground">
                    • {signal}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Comp &amp; Packages
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  curated · unverified
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Base Salary</p>
                  <p className="text-lg font-semibold">{company.packages.baseSalary}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">OTE</p>
                  <p className="text-lg font-semibold">{company.packages.ote}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Quota attainment is intentionally not shown here — see the
                Quota Reality section, which uses verified community
                submissions (n ≥ 3) or clearly-labeled scraped proxies.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4" />
                Open GTM Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {company.hiringRoles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm font-medium">{role}</span>
                    <Badge variant="secondary" className="text-xs">
                      Hiring
                    </Badge>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                GTM Team Size: {company.gtmTeamSize}
              </p>
              <p className="text-xs text-muted-foreground">
                Stage: {company.stage}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.length > 0 ? (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="border-b border-rule pb-2 last:border-b-0">
                      <p className="text-xs font-medium text-foreground">
                        {event.headline}
                      </p>
                      <p className="mt-0.5 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                        {event.date} ·{" "}
                        <a
                          href={event.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {event.source.source_name}
                        </a>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No curated events for this company yet.
                </p>
              )}
              <Button className="w-full" variant="outline" render={<Link href="/" />}>
                Compare benchmarks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
