import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignalFeed } from "@/components/signal-feed";
import { WeightedLeaderboard } from "@/components/weighted-leaderboard";
import { WeightsPanel } from "@/components/weights-panel";
import { LastUpdated } from "@/components/provenance";
import { getScoredCompanies } from "@/lib/scored";
import { getJobsCacheMeta } from "@/lib/jobs/cache";
import {
  getAnzFeedEntries,
  getSignalLogEntries,
} from "@/lib/signal-log";
import { ArrowRight, MapPin, Train } from "lucide-react";

export default function Home() {
  const items = getScoredCompanies();
  const jobsMeta = getJobsCacheMeta();
  const signalEntries = getSignalLogEntries(8);
  const anzEntries = getAnzFeedEntries(6);

  const forbesCount = items.filter((i) =>
    i.company.categories.includes("forbes_ai50")
  ).length;
  const hyperscalerCount = items.filter((i) =>
    i.company.categories.includes("hyperscaler")
  ).length;
  const anzCompanyCount = items.filter(
    (i) => i.scorecard.anzDetections.length > 0
  ).length;

  return (
    <div className="flex flex-col">
      {/* Hero — benchmark-first, data visible immediately */}
      <section className="hairline-b">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <p className="font-mono-data text-xs font-medium uppercase tracking-[0.25em] text-gravy">
              GTM benchmarks · sourced signals
            </p>
            <h1 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Find your next{" "}
              <span className="text-brief underline decoration-gravy decoration-2 underline-offset-4">
                gravy train
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Benchmarks computed from public job boards, sourced funding
              events, RepVue, and verified community submissions. Every score
              carries provenance you can click — and when the data
              isn&apos;t there, we say &ldquo;insufficient data&rdquo;, not a
              made-up number.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                <strong className="font-mono-data text-foreground">
                  {items.length}
                </strong>{" "}
                companies tracked
              </span>
              <span aria-hidden>·</span>
              <span>
                <strong className="font-mono-data text-foreground">
                  {jobsMeta.count}
                </strong>{" "}
                job boards polled daily
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
              <LastUpdated
                iso={jobsMeta.scrapedAt}
                prefix="Job boards refreshed"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Weighted leaderboard */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Gravy Train leaderboard — your weights
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Re-ranks live as you change presets, sliders, or the role
                lens. Weights persist on this device.
              </p>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/companies" />}>
              All companies
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <WeightedLeaderboard items={items} limit={12} />
            <WeightsPanel />
          </div>
        </div>
      </section>

      {/* Signal feed + ANZ expansion feed */}
      <section className="hairline-b bg-muted/20 py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <SignalFeed
              entries={signalEntries}
              title="Signal-change log"
              description="Fresh, diffable entries from the daily job-board refresh — replaces the old hand-written news feed"
            />
            <div className="flex flex-col gap-6">
              <div className="border border-rule bg-card">
                <div className="hairline-b flex items-center gap-2 px-4 py-3">
                  <MapPin className="h-4 w-4 text-gravy" aria-hidden />
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      Expanding into ANZ
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {anzCompanyCount} companies with active ANZ detectors —
                      first AU/NZ postings, AU leadership hires
                    </p>
                  </div>
                </div>
                {anzEntries.length > 0 ? (
                  <ul className="divide-y divide-rule">
                    {anzEntries.map((entry) => (
                      <li key={entry.id} className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <Link
                            href={`/companies/${entry.companySlug}`}
                            className="focus-ring text-xs font-medium text-gravy hover:underline"
                          >
                            {entry.companyName}
                          </Link>
                        </div>
                        <p className="mt-1 text-sm font-medium">
                          {entry.headline}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    No ANZ expansion signals detected yet.
                  </p>
                )}
                <div className="hairline-b border-t px-4 py-3">
                  <Link
                    href="/companies?anz=1"
                    className="focus-ring text-xs font-medium text-brief hover:underline"
                  >
                    Browse all companies expanding into ANZ →
                  </Link>
                </div>
              </div>
              <div className="border border-rule bg-brief p-4 text-primary-foreground">
                <p className="font-mono-data text-xs uppercase tracking-widest text-gravy">
                  Why benchmarks, not reviews?
                </p>
                <p className="mt-2 text-sm text-primary-foreground/80">
                  Recruiters won&apos;t tell you when quota is brutal. But
                  public job boards, sourced funding events, and verified rep
                  submissions don&apos;t lie: shrinking APAC postings, a
                  region hiring its first AE, or a contraction penalty show
                  up here before they show up on review sites.
                </p>
              </div>
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
              Timing → Territory → Talent, weighted 50/30/20 by default —
              or however you want. Every input is sourced;{" "}
              <Link href="/methodology" className="underline">
                the methodology is public
              </Link>
              .
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                key: "Timing",
                weight: "50%",
                desc: "Sourced funding events, GTM posting volume and velocity, contraction penalties",
              },
              {
                key: "Territory",
                weight: "30%",
                desc: "Regional posting spread, international share, ANZ detectors, regional-decline penalties",
              },
              {
                key: "Talent",
                weight: "20%",
                desc: "RepVue comp/culture percentiles, tenure signals, verified community submissions",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="border border-rule bg-card p-5 text-center"
              >
                <p className="font-mono-data text-xs text-gravy">
                  {item.weight} default
                </p>
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
              {items.length} companies benchmarked on sourced signals. Set
              your weights, pick your role lens, and get alerted when the
              data moves.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" render={<Link href="/companies" />}>
                Browse benchmarks
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                render={<Link href="/alerts" />}
              >
                Set up alerts
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
