import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Phone,
  TrendingUp,
  ArrowRight,
  Train,
  Users,
  Zap,
  Clock,
  Map,
  UserSearch,
  Coffee,
} from "lucide-react";
import { companies } from "@/lib/data";
import { THREE_T_META } from "@/lib/three-ts";
import { GravyTrainBadgeCompact } from "@/components/gravy-train-badge";

export default function Home() {
  const gravyTrainCompanies = companies
    .sort((a, b) => b.gravyTrainScore - a.gravyTrainScore)
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Train className="mr-1 h-3 w-3" />
              Join the gravy train
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find companies where the product{" "}
              <span className="text-primary">sells itself</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              Loads of companies are expanding into APAC, hiring GTM teams, and
              launching new segments — but only a trained eye spots the ones
              where reps actually win. We read the signals so you don&apos;t have
              to.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" render={<Link href="/companies" />}>
                <Train className="mr-2 h-4 w-4" />
                Find the Gravy Train
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/scenarios" />}>
                <Phone className="mr-2 h-4 w-4" />
                Practice Cold Calls
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Three T's Framework */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              The Three T&apos;s — in that order
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              There&apos;s a saying in sales: Timing, Territory, Talent determine
              your success. In that order. Talent is the least important.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {(["timing", "territory", "talent"] as const).map((key) => {
              const meta = THREE_T_META[key];
              const Icon =
                key === "timing" ? Clock : key === "territory" ? Map : Users;
              const colors = {
                timing: "bg-amber-100 text-amber-700",
                territory: "bg-blue-100 text-blue-700",
                talent: "bg-purple-100 text-purple-700",
              };

              return (
                <Card key={key} className="relative overflow-hidden">
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {meta.order}
                  </div>
                  <CardContent className="pt-8">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[key]}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{meta.label}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">
                      {meta.tagline}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {meta.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Qualitative signals */}
      <section className="border-b bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Zap className="mr-1 h-3 w-3" />
                What a trained eye sees
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                The data job boards don&apos;t show you
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A company posting &ldquo;we&apos;re hiring 50 AEs&rdquo; tells you
                nothing. What matters is whether they&apos;re building a new APAC
                pod, launching a fresh product line, or just backfilling churn.
              </p>
              <p className="mt-4 text-muted-foreground">
                We track the qualitative signals that actually predict whether
                you&apos;ll crush quota or burn out in month three.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: UserSearch,
                  title: "LinkedIn activity",
                  desc: "Who's joining, which regions, new VP hires",
                },
                {
                  icon: Building2,
                  title: "Hiring patterns",
                  desc: "New segments vs. backfill, GTM team structure",
                },
                {
                  icon: TrendingUp,
                  title: "Market timing",
                  desc: "Category tailwinds, funding, buying urgency",
                },
                {
                  icon: Coffee,
                  title: "Coffee chat intel",
                  desc: "What reps actually say about quota and culture",
                },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="pt-6">
                    <item.icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Research playbook methodology */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              The 5-step research playbook
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              How great reps diligence a company before they join — built into
              every profile. Your workflow, systematized.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                step: "1",
                title: "Coffee chats",
                desc: "Current & former employees — quota reality, ramp, culture",
              },
              {
                step: "2",
                title: "RepVue & Glassdoor",
                desc: "Quota attainment, OTE accuracy, leadership patterns",
              },
              {
                step: "3",
                title: "Team LinkedIn",
                desc: "Pedigrees, tenure, red flags, where alumni go next",
              },
              {
                step: "4",
                title: "Media & competition",
                desc: "Funding, press, who they beat (and lose to) in deals",
              },
              {
                step: "5",
                title: "Industry growth",
                desc: "Category tailwinds, budget trends, market CAGR",
              },
            ].map((item) => (
              <Card key={item.step}>
                <CardContent className="pt-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
            Each lens feeds the Three T&apos;s. Coffee chat intel shapes Talent.
            LinkedIn sweeps shape Territory. Industry data shapes Timing.
          </p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Stop grinding. Start riding.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The difference between a top performer and a burned-out rep is
              usually the company they picked — not their talent.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-red-800">
                  &ldquo;The grind&rdquo;
                </p>
                <p className="mt-2 text-sm text-red-700/80">
                  Bad timing in a saturated territory. Product needs heavy
                  evangelism. Quota unattainable. You&apos;re talented — but
                  you&apos;re pushing a boulder uphill.
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-emerald-800">
                  &ldquo;The gravy train&rdquo;
                </p>
                <p className="mt-2 text-sm text-emerald-700/80">
                  Market pulling the product. Greenfield territory with real
                  investment. Inbound pipeline and short cycles. You show up,
                  run your process, and the product does the heavy lifting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-4 text-muted-foreground">
              From &ldquo;where should I go?&rdquo; to &ldquo;I&apos;m in the
              interview&rdquo;
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Train className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                1. Score the Three T&apos;s
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse companies rated on Timing, Territory, and Talent with
                qualitative signals from LinkedIn, hiring data, and community
                intel.
              </p>
              <Button variant="link" className="mt-3" render={<Link href="/companies" />}>
                Find the gravy train <ArrowRight className="ml-1 h-3 w-3" />
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
                Generate personalized emails and LinkedIn messages to get in the
                door at companies worth joining.
              </p>
              <Button variant="link" className="mt-3" render={<Link href="/outreach" />}>
                Build outreach <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                3. Practice your pitch
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Run scenario-based mock calls. If the product sells itself, your
                job in the interview is to prove you can ride it.
              </p>
              <Button variant="link" className="mt-3" render={<Link href="/scenarios" />}>
                Start practicing <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Top gravy train companies */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                On the gravy train
              </h2>
              <p className="mt-2 text-muted-foreground">
                Highest-scoring companies on the Three T&apos;s right now
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex" render={<Link href="/companies" />}>
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gravyTrainCompanies.map((company) => (
              <Link key={company.slug} href={`/companies/${company.slug}`}>
                <Card className="group h-full transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-white text-lg font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        <Train className="h-3 w-3" />
                        {company.gravyTrainScore}
                      </div>
                    </div>
                    <h3 className="mt-4 font-semibold group-hover:text-primary">
                      {company.name}
                    </h3>
                    <div className="mt-2">
                      <GravyTrainBadgeCompact verdict={company.gravyTrainVerdict} />
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                      {company.sellsItself}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        T: {company.threeTs.timing.score}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Map className="h-3 w-3" />
                        T: {company.threeTs.territory.score}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        T: {company.threeTs.talent.score}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to join the gravy train?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Stop guessing which companies are worth your talent. Find the ones
              where timing, territory, and the product are all working in your
              favor.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="secondary"
                render={<Link href="/companies" />}
              >
                <Train className="mr-2 h-4 w-4" />
                Find Companies
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
