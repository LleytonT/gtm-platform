import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/score-ring";
import {
  companies,
  getCompanyBySlug,
  getScenariosByCompany,
  getScoreColor,
  getScoreBg,
  getScoreLabel,
} from "@/lib/data";
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
  CheckCircle2,
  Mail,
  Phone,
  Star,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const scenarios = getScenariosByCompany(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back */}
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                <Star className="h-4 w-4 fill-current" />
                {company.overallScore}/100
              </div>
            </div>
            <p className="mt-1 text-muted-foreground">{company.description}</p>
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
          </div>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href={`/outreach?company=${company.slug}`} />}>
            <Mail className="mr-2 h-4 w-4" />
            Build Outreach
          </Button>
          {scenarios.length > 0 && (
            <Button variant="outline" render={<Link href={`/scenarios?company=${company.slug}`} />}>
              <Phone className="mr-2 h-4 w-4" />
              Practice Pitch
            </Button>
          )}
        </div>
      </div>

      {/* Score Overview */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card className={cn("border-2", getScoreBg(company.overallScore))}>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreRing
              score={company.overallScore}
              label="Overall Score"
              size="lg"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreRing
              score={company.financials.score}
              label="Financials"
              size="lg"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreRing
              score={company.pmf.score}
              label="Product-Market Fit"
              size="lg"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-6">
            <ScoreRing
              score={company.packages.score}
              label="Comp & Packages"
              size="lg"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column — details */}
        <div className="space-y-8 lg:col-span-2">
          {/* Financials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Financials
                <Badge
                  variant="outline"
                  className={cn(getScoreColor(company.financials.score))}
                >
                  {company.financials.score}/100 —{" "}
                  {getScoreLabel(company.financials.score)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-lg font-semibold">
                    {company.financials.revenue}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Growth Rate</p>
                  <p className="text-lg font-semibold">
                    {company.financials.growthRate}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Funding</p>
                  <p className="text-sm font-medium">
                    {company.financials.funding}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Runway</p>
                  <p className="text-sm font-medium">
                    {company.financials.runway}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Last Round</p>
                  <p className="text-sm font-medium">
                    {company.financials.lastRound}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Key Investors
                  </p>
                  <p className="text-sm font-medium">
                    {company.financials.investors.join(", ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PMF */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Product-Market Fit
                <Badge
                  variant="outline"
                  className={cn(getScoreColor(company.pmf.score))}
                >
                  {company.pmf.score}/100 —{" "}
                  {getScoreLabel(company.pmf.score)}
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
                  <p className="text-xs text-muted-foreground">
                    Net Dollar Retention
                  </p>
                  <p className="text-lg font-semibold">
                    {company.pmf.retention}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Market Growth</p>
                  <p className="text-sm font-medium">
                    {company.pmf.marketGrowth}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Competitive Position
                  </p>
                  <p className="text-sm font-medium">
                    {company.pmf.competitivePosition}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">PMF Signals</p>
                <ul className="space-y-1.5">
                  {company.pmf.signals.map((signal) => (
                    <li
                      key={signal}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Comp Packages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Comp &amp; Packages
                <Badge
                  variant="outline"
                  className={cn(getScoreColor(company.packages.score))}
                >
                  {company.packages.score}/100 —{" "}
                  {getScoreLabel(company.packages.score)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Base Salary</p>
                  <p className="text-lg font-semibold">
                    {company.packages.baseSalary}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">OTE</p>
                  <p className="text-lg font-semibold">
                    {company.packages.ote}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Equity</p>
                  <p className="text-sm font-medium">
                    {company.packages.equity}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Quota</p>
                  <p className="text-sm font-medium">
                    {company.packages.quota}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Quota Attainment
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Progress
                    value={parseInt(company.packages.quotaAttainment)}
                    className="h-2"
                  />
                  <span className="text-sm font-semibold">
                    {company.packages.quotaAttainment}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Benefits</p>
                <div className="flex flex-wrap gap-2">
                  {company.packages.benefits.map((benefit) => (
                    <Badge key={benefit} variant="secondary">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — sidebar */}
        <div className="space-y-6">
          {/* Hiring Roles */}
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Get in the door</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" render={<Link href={`/outreach?company=${company.slug}`} />}>
                <Mail className="mr-2 h-4 w-4" />
                Generate Outreach
              </Button>
              {scenarios.length > 0 && (
                <Button className="w-full" variant="outline" render={<Link href={`/scenarios?company=${company.slug}`} />}>
                  <Phone className="mr-2 h-4 w-4" />
                  Practice Mock Call
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Prepare your outreach and practice selling {company.name}&apos;s
                product before your interview.
              </p>
            </CardContent>
          </Card>

          {/* Scenario Plays */}
          {scenarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Scenario Plays ({scenarios.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scenarios.map((scenario) => (
                  <Link
                    key={scenario.id}
                    href={`/scenarios?company=${company.slug}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <p className="text-sm font-medium">{scenario.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant={
                          scenario.difficulty === "beginner"
                            ? "secondary"
                            : scenario.difficulty === "intermediate"
                              ? "default"
                              : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {scenario.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {scenario.targetRole}
                      </span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
