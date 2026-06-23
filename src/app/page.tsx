import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Phone,
  TrendingUp,
  DollarSign,
  Target,
  ArrowRight,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { companies } from "@/lib/data";

export default function Home() {
  const topCompanies = companies
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Zap className="mr-1 h-3 w-3" />
              Built for SDRs and GTM professionals
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find companies{" "}
              <span className="text-primary">worth selling for</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              Stop guessing which companies are actually good to work for. We
              rate companies on their financials, product-market fit, and comp
              packages — then help you get in the door.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" render={<Link href="/companies" />}>
                <Building2 className="mr-2 h-4 w-4" />
                Browse Companies
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/scenarios" />}>
                <Phone className="mr-2 h-4 w-4" />
                Practice Cold Calls
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              The problem with finding your next GTM role
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              You know you want to move, but you&apos;re stuck on two questions
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-red-800">
                  &ldquo;Where should I even apply?&rdquo;
                </p>
                <p className="mt-2 text-sm text-red-700/80">
                  Job boards show you open roles, not whether the company is
                  worth joining. You can&apos;t tell if they have real PMF, good
                  comp, or a sales culture that sets reps up to win.
                </p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-red-800">
                  &ldquo;How do I actually get in?&rdquo;
                </p>
                <p className="mt-2 text-sm text-red-700/80">
                  Even when you find a good company, cold applying into an ATS
                  doesn&apos;t work. You need warm intros, compelling outreach to
                  hiring managers, and the ability to sell yourself.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-12 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-8 text-center">
            <p className="text-xl font-bold text-emerald-800">
              GTM Hire solves both.
            </p>
            <p className="mt-2 text-emerald-700/80">
              We rate companies so you know where to look, then give you the
              tools to actually land the role.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-4 text-muted-foreground">
              Three steps from &ldquo;I need a new role&rdquo; to
              &ldquo;I&apos;m in the interview process&rdquo;
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">1. Find companies</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse companies rated on financials, PMF, and comp packages.
                Filter by stage, industry, and role to find your best fit.
              </p>
              <Button variant="link" className="mt-3" render={<Link href="/companies" />}>
                Explore ratings <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                2. Craft your outreach
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate personalized emails, LinkedIn messages, and referral
                asks tailored to the company and hiring manager.
              </p>
              <Button variant="link" className="mt-3" render={<Link href="/outreach" />}>
                Build outreach <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                3. Practice your pitch
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Run scenario-based mock calls. Practice selling the
                company&apos;s product so you can demonstrate it in interviews.
              </p>
              <Button variant="link" className="mt-3" render={<Link href="/scenarios" />}>
                Start practicing <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies Preview */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Top-rated companies
              </h2>
              <p className="mt-2 text-muted-foreground">
                Highest-scoring companies across financials, PMF, and packages
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex" render={<Link href="/companies" />}>
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {topCompanies.map((company) => (
              <Link key={company.slug} href={`/companies/${company.slug}`}>
                <Card className="group h-full transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-white text-lg font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        <Star className="h-3 w-3 fill-current" />
                        {company.overallScore}
                      </div>
                    </div>
                    <h3 className="mt-4 font-semibold group-hover:text-primary">
                      {company.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {company.industry}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        {company.packages.ote}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {company.financials.growthRate}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {company.gtmTeamSize}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" render={<Link href="/companies" />}>
              View all companies <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to find your next role?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Stop scrolling job boards. Start finding companies that are
              actually worth selling for — and learn how to get in.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="secondary"
                render={<Link href="/companies" />}
              >
                Browse Companies
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                render={<Link href="/outreach" />}
              >
                Build Outreach
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
