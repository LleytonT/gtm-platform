import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BenchmarkDashboard } from "@/components/benchmark-dashboard";
import { BenchmarkOverviewGrid } from "@/components/benchmark-overview";
import { NotableActivityFeed } from "@/components/notable-activity-feed";
import { companies } from "@/lib/data";
import { BENCHMARKS } from "@/lib/benchmarks";
import { ArrowRight, Train } from "lucide-react";

export default function Home() {
  const forbesCount = companies.filter((c) =>
    c.categories.includes("forbes_ai50")
  ).length;
  const hyperscalerCount = companies.filter((c) =>
    c.categories.includes("hyperscaler")
  ).length;

  return (
    <div className="flex flex-col">
      {/* Hero — benchmark-first, data visible immediately */}
      <section className="hairline-b">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <p className="font-mono-data text-xs font-medium uppercase tracking-[0.25em] text-gravy">
              GTM benchmarks · live signals
            </p>
            <h1 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Find your next{" "}
              <span className="text-brief underline decoration-gravy decoration-2 underline-offset-4">
                gravy train
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Quantitative benchmarks for GTM teams — funding velocity, GTM
              headcount momentum, regional balance, and quota reality. Not
              recruiter spin. Not lagging review sites. Signals that show where
              the product is actually selling.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                <strong className="font-mono-data text-foreground">
                  {companies.length}
                </strong>{" "}
                companies tracked
              </span>
              <span aria-hidden>·</span>
              <span>
                <strong className="font-mono-data text-foreground">
                  {forbesCount}
                </strong>{" "}
                Forbes AI 50
              </span>
              <span aria-hidden>·</span>
              <span>
                <strong className="font-mono-data text-foreground">
                  {hyperscalerCount}
                </strong>{" "}
                hyperscalers
              </span>
              <span aria-hidden>·</span>
              <span>
                <strong className="font-mono-data text-foreground">
                  {BENCHMARKS.length}
                </strong>{" "}
                benchmark dimensions
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI overview cards */}
      <section className="hairline-b bg-muted/20 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BenchmarkOverviewGrid companies={companies} />
        </div>
      </section>

      {/* Main interactive benchmark dashboard */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BenchmarkDashboard companies={companies} />
        </div>
      </section>

      {/* Notable activity + problem statement */}
      <section className="hairline-b bg-muted/20 py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <NotableActivityFeed limit={10} />
            <div className="flex flex-col justify-center">
              <h2 className="font-display text-2xl font-semibold">
                Why benchmarks, not reviews?
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                The best intel on whether a GTM org is winning lives inside the
                company. Recruiters won&apos;t tell you when quota is brutal.
                Other sellers won&apos;t share when they&apos;re struggling.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                But quantitative signals don&apos;t lie: a growing AMER team with
                shrinking APAC headcount, a Series G with aggressive AE hiring,
                or consumption revenue accelerating while booking stalls — these
                show up in the data before they show up on RepVue.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Match sales motion to your experience — enterprise vs SMB, booking vs consumption",
                  "Filter by Forbes AI 50, hyperscalers, or established SaaS",
                  "Cross-reference funding events with GTM hiring patterns",
                  "Spot regional red flags before you take the call",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-gravy" aria-hidden>
                      →
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-fit" render={<Link href="/companies" />}>
                Explore all companies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Three T's framework — condensed */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono-data text-xs uppercase tracking-widest text-gravy">
              Scoring methodology
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold">
              The Three T&apos;s power every benchmark
            </h2>
            <p className="mt-3 text-muted-foreground">
              Timing → Territory → Talent. In that order. Talent is the least
              important when the product sells itself.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                key: "Timing",
                weight: "50%",
                desc: "Market tailwinds, funding, category growth, buying urgency",
              },
              {
                key: "Territory",
                weight: "30%",
                desc: "Regional expansion, greenfield segments, geo-specific headcount signals",
              },
              {
                key: "Talent",
                weight: "20%",
                desc: "GTM org maturity, comp accuracy, quota attainment proxies",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="border border-rule bg-card p-5 text-center"
              >
                <p className="font-mono-data text-xs text-gravy">{item.weight}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">
                  {item.key}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hairline-b py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="hero-panel mx-auto max-w-2xl px-8 py-12">
            <Train className="mx-auto h-8 w-8 text-gravy" aria-hidden />
            <h2 className="font-display mt-4 text-2xl font-semibold text-primary-foreground">
              Stop grinding. Start riding.
            </h2>
            <p className="mt-3 text-primary-foreground/70">
              {companies.length} companies benchmarked. Find where timing,
              territory, and the product are all working in your favor.
            </p>
            <Button
              size="lg"
              className="mt-6"
              variant="secondary"
              render={<Link href="/companies" />}
            >
              Browse benchmarks
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
