import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import {
  Building2,
  Mail,
  Phone,
  ArrowRight,
  Train,
  Users,
  Clock,
  Map,
  UserSearch,
  Coffee,
  TrendingUp,
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
      {/* Hero — asymmetric intelligence brief */}
      <section className="hairline-b overflow-hidden">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <p className="font-mono-data reveal-up text-xs font-medium uppercase tracking-[0.25em] text-gravy">
              Gravy train intelligence
            </p>
            <h1 className="font-display reveal-up reveal-up-delay-1 mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Find companies where the product{" "}
              <span className="text-brief underline decoration-gravy decoration-2 underline-offset-4">
                sells itself
              </span>
            </h1>
            <p className="reveal-up reveal-up-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              APAC expansions, new GTM pods, fresh segments — the signals are
              there. We read LinkedIn, hiring data, and coffee chat intel so you
              know where reps actually win.
            </p>
            <div className="reveal-up reveal-up-delay-3 mt-10 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/companies" />}>
                <Train className="mr-2 h-4 w-4" aria-hidden />
                Find the gravy train
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/scenarios" />}
              >
                <Phone className="mr-2 h-4 w-4" aria-hidden />
                Practice cold calls
              </Button>
            </div>
          </div>

          <aside
            className="hero-panel reveal-up reveal-up-delay-2 flex flex-col justify-center border-l border-white/10 px-4 py-12 sm:px-8 sm:py-16 lg:px-10"
            aria-label="Top gravy train scores"
          >
            <p className="font-mono-data text-xs font-medium uppercase tracking-[0.2em] text-gravy">
              Live index · Three T&apos;s weighted
            </p>
            <p className="mt-2 text-sm text-primary-foreground/70">
              Highest-scoring companies right now
            </p>
            <div className="mt-8 space-y-3">
              {gravyTrainCompanies.map((company, i) => (
                <Link
                  key={company.slug}
                  href={`/companies/${company.slug}`}
                  className="group flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-gravy/40 hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono-data text-xs text-gravy/80">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-medium text-primary-foreground group-hover:text-gravy">
                        {company.name}
                      </p>
                      <p className="text-xs text-primary-foreground/50">
                        T{company.threeTs.timing.score} · Tr
                        {company.threeTs.territory.score} · Tl
                        {company.threeTs.talent.score}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-data text-2xl font-semibold tabular-nums text-gravy">
                    {company.gravyTrainScore}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Three T's Framework */}
      <section className="hairline-b py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Timing → Territory → Talent"
            title="The Three T's — in that order"
            description="There's a saying in sales: Timing, Territory, Talent determine your success. In that order. Talent is the least important."
          />
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {(["timing", "territory", "talent"] as const).map((key) => {
              const meta = THREE_T_META[key];
              const Icon =
                key === "timing" ? Clock : key === "territory" ? Map : Users;
              const colors = {
                timing: "border-gravy/30 bg-gravy/10 text-gravy",
                territory: "border-brief/20 bg-brief/5 text-brief",
                talent: "border-signal/30 bg-signal/10 text-signal",
              };

              return (
                <Card key={key} className="relative overflow-hidden border bg-card shadow-none">
                  <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center border border-rule font-mono-data text-xs font-semibold">
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
              <SectionHeader
                align="left"
                eyebrow="What a trained eye sees"
                title="The data job boards don't show you"
                description="A company posting 'we're hiring 50 AEs' tells you nothing. What matters is whether they're building a new APAC pod, launching a fresh product line, or just backfilling churn."
              />
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
