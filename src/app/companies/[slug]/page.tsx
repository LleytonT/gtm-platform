import dynamic from "next/dynamic";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/score-ring";
import { GravyTrainBadge } from "@/components/gravy-train-badge";
import { ThreeTsOverview } from "@/components/three-ts-overview";
import { QualitativeSignals } from "@/components/qualitative-signals";
import {
  companies,
  getCompanyBySlug,
  getResearchForCompany,
  getScoreColor,
  getScoreBg,
  getScoreLabel,
} from "@/lib/data";
import { COMP_MODEL_LABELS, SALES_MOTION_LABELS } from "@/lib/benchmarks";
import { getActivitiesForCompany } from "@/lib/notable-activity";
import { THREE_T_META, THREE_T_ORDER } from "@/lib/three-ts";
import { cn } from "@/lib/utils";

const ResearchPlaybook = dynamic(
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

export function generateStaticParams() {
  return companies.map((company) => ({
    slug: company.slug,
  }));
}

export default async function CompanyDetailPage(
  props: PageProps<"/companies/[slug]">
) {
  const { slug } = await props.params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const research = getResearchForCompany(company);
  const activities = getActivitiesForCompany(slug);

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
              <GravyTrainBadge
                score={company.gravyTrainScore}
                verdict={company.gravyTrainVerdict}
                size="lg"
              />
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
            {company.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {company.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs capitalize">
                    {cat.replace("_", " ")}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">
                  {SALES_MOTION_LABELS[company.salesMotion]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {COMP_MODEL_LABELS[company.compModel]}
                </Badge>
              </div>
            )}
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

      {/* Benchmark scores */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Gravy Train", value: company.gravyTrainScore },
          { label: "GTM Momentum", value: company.benchmarks.gtmMomentum },
          { label: "Funding", value: company.benchmarks.fundingVelocity },
          { label: "Quota Reality", value: company.benchmarks.quotaReality },
          { label: "Regional", value: company.benchmarks.regionalBalance },
          { label: "PMF", value: company.benchmarks.pmfStrength },
        ].map((b) => (
          <div
            key={b.label}
            className="border border-rule bg-card px-3 py-3 text-center"
          >
            <p className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
              {b.label}
            </p>
            <p className={cn("font-mono-data mt-1 text-2xl font-semibold tabular-nums", getScoreColor(b.value))}>
              {b.value}
            </p>
          </div>
        ))}
      </div>

      {/* Three T's — the core framework */}
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">The Three T&apos;s</h2>
          <p className="mt-1 text-muted-foreground">
            Timing, Territory, Talent — in that order. This is what separates a
            gravy train from a grind.
          </p>
        </div>
        <div className="mb-6">
          <ThreeTsOverview threeTs={company.threeTs} size="lg" />
        </div>

        <div className="space-y-6">
          {THREE_T_ORDER.map((key) => {
            const dimension = company.threeTs[key];
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
                    <Badge variant="outline" className={cn(getScoreColor(dimension.score))}>
                      {dimension.score}/100
                    </Badge>
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

      {/* Research Playbook — the 5-step diligence workflow */}
      <div className="mb-12">
        <ResearchPlaybook
          research={research}
          companyName={company.name}
          companySlug={slug}
        />
      </div>

      {/* Supporting context */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Supporting context</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Financials, PMF, and comp — useful background, but the Three
          T&apos;s tell you whether you&apos;ll actually win.
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreRing score={company.financials.score} label="Financials" size="md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreRing score={company.pmf.score} label="Product-Market Fit" size="md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreRing score={company.packages.score} label="Comp & Packages" size="md" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Financials
                <Badge variant="outline" className={cn(getScoreColor(company.financials.score))}>
                  {company.financials.score}/100 — {getScoreLabel(company.financials.score)}
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
                  <p className="text-xs text-muted-foreground">Runway</p>
                  <p className="text-sm font-medium">{company.financials.runway}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Product-Market Fit
                <Badge variant="outline" className={cn(getScoreColor(company.pmf.score))}>
                  {company.pmf.score}/100 — {getScoreLabel(company.pmf.score)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">NPS Score</p>
                  <p className="text-lg font-semibold">{company.pmf.nps}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Net Dollar Retention</p>
                  <p className="text-lg font-semibold">{company.pmf.retention}</p>
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
                <Badge variant="outline" className={cn(getScoreColor(company.packages.score))}>
                  {company.packages.score}/100 — {getScoreLabel(company.packages.score)}
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
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Quota Attainment</p>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={parseInt(company.packages.quotaAttainment)} className="h-2" />
                  <span className="text-sm font-semibold">{company.packages.quotaAttainment}</span>
                </div>
              </div>
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

          <Card className={cn("border-2", getScoreBg(company.gravyTrainScore))}>
            <CardHeader>
              <CardTitle className="text-base">Benchmark verdict</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {company.gravyTrainVerdict === "On the gravy train"
                  ? "Strong across benchmarks — product momentum and GTM investment align."
                  : "Review benchmark dimensions above. Regional and quota signals matter most."}
              </p>
              {activities.length > 0 && (
                <div className="space-y-2 border-t border-rule pt-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Recent activity
                  </p>
                  {activities.map((a) => (
                    <p key={a.id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{a.headline}</span>
                    </p>
                  ))}
                </div>
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
