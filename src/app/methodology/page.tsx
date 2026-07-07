import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceChip } from "@/components/provenance";
import { computeScorecard } from "@/lib/scoring/engine";
import { getCompanyBySlug } from "@/lib/data";
import { WEIGHT_PRESETS } from "@/lib/scoring/weights";
import { MIN_AGGREGATE_N } from "@/lib/submissions/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Methodology — GTM Hire",
  description:
    "Exact inputs per dimension, weighting, calibration, known limitations, and how to dispute or correct a data point.",
};

const DIMENSION_INPUTS: {
  name: string;
  weight: string;
  inputs: string[];
}[] = [
  {
    name: "Timing",
    weight: "50% default",
    inputs: [
      "Curated funding events with source records (round size + recency; +8 to +22)",
      "Open GTM postings on the official Greenhouse/Lever/Ashby board (−12 to +18)",
      "GTM postings published in the last 90 days (+6 when ≥ 10)",
      "Contraction events within 14 months (−15)",
      "RepVue rep-sentiment trend (±5)",
    ],
  },
  {
    name: "Territory",
    weight: "30% default",
    inputs: [
      "Number of regions with active GTM hiring (+7 per region, max +28)",
      "Share of GTM postings outside AMER (up to +20)",
      "Live AU/NZ GTM postings (+6) and fresh ANZ postings (+6)",
      "Regional posting declines ≥ 25% vs prior snapshot (up to −20)",
      "Regional contraction events (−12)",
    ],
  },
  {
    name: "Talent",
    weight: "20% default",
    inputs: [
      "RepVue percentiles for incentive comp, base comp, culture, and development — centered on the 50th percentile so weak percentiles subtract",
      "People-data tenure signals via the provider adapter (−8 to +5)",
      "Verified community submissions: attainment index vs 70 baseline",
      "RepVue trending down (−4)",
    ],
  },
];

const BENCHMARK_INPUTS: { name: string; inputs: string }[] = [
  {
    name: "GTM Momentum",
    inputs:
      "Open GTM posting volume, 90-day publish share, and % change vs the prior job-board snapshot (declines subtract up to −20).",
  },
  {
    name: "Funding Velocity",
    inputs:
      "Every sourced funding event, scaled by log of round size and decayed by recency (≤ 12 months full weight, ≤ 24 months 60%, older 25%).",
  },
  {
    name: "Quota Reality",
    inputs: `Verified community submissions take precedence where a company-region cohort has n ≥ ${MIN_AGGREGATE_N} (scraped proxies deprecated for that region). Fallback: RepVue incentive-comp and inbound-lead-flow percentiles, labelled as a proxy.`,
  },
  {
    name: "Regional Balance",
    inputs:
      "Normalized Shannon entropy of GTM postings across AMER/EMEA/APAC/ANZ/LATAM, minus penalties for regional declines ≥ 25%.",
  },
  {
    name: "PMF Strength",
    inputs:
      "RepVue product-market-fit percentile only. No RepVue percentile → insufficient data (we do not synthesize an estimate).",
  },
];

const LIMITATIONS: string[] = [
  "Job boards measure hiring intent, not headcount. A company can grow without posting publicly, and postings can stay live after roles are filled.",
  "Not every company runs a public ATS board we can poll. Those companies show 'insufficient data' on job-derived metrics rather than an estimate.",
  "RepVue percentiles are self-reported by reps and skew toward larger AMER-based sales orgs; confidence is downgraded below 100 ratings.",
  "Curated events (funding, contractions) are entered manually with source links and reviewed weekly — they can lag the news by a few days.",
  "Community submission aggregates require n ≥ 3 per company-region, so small-region data (e.g. AU) appears slowly by design to protect anonymity.",
  "Seeded sample submissions used for demonstrations are always flagged in the UI and in the source records.",
  "People-data providers (Coresignal, People Data Labs, Live Data Technologies, Harmonic) are stubbed behind an adapter and not yet licensed; tenure signals currently come from cached public-web queries.",
  "We do not scrape LinkedIn, and we never score identifiable individuals — AU/APAC leadership intel is rendered as curated facts only.",
];

export default function MethodologyPage() {
  // Live worked example (P0.5): Gong's Timing score with the sourced
  // APAC-contraction penalty applied, versus what it would be without it.
  const gong = getCompanyBySlug("gong");
  const gongCard = gong ? computeScorecard("gong") : null;
  const timing = gongCard?.dimensions.timing ?? null;
  const negatives =
    timing?.contributions.filter((c) => c.delta < 0) ?? [];
  const negativeTotal = negatives.reduce((sum, c) => sum + c.delta, 0);
  const withoutPenalties =
    timing?.value != null
      ? Math.min(97, timing.value - negativeTotal)
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono-data text-xs font-medium uppercase tracking-[0.25em] text-gravy">
        Public methodology
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold">
        How every score is computed
      </h1>
      <p className="mt-3 text-muted-foreground">
        Every number on this site is computed from source-backed inputs and
        carries a provenance record — source name, URL, retrieval date,
        confidence, and method. When the inputs don&apos;t exist, we render
        &ldquo;insufficient data&rdquo;. We never synthesize a score to fill
        a gap.
      </p>

      {/* Calibration */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Calibration</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Scores use the full 0–100 range, clamped to 3–97. There is no
            hidden floor — weak companies score in the 20s and 30s.
          </li>
          <li>
            Every score is a base value plus signed contributions from
            sourced signals. Negative signals materially subtract: a
            contraction event is −15 Timing, a regional posting decline of
            25%+ subtracts up to −20 Territory / −25 Regional Balance, a
            declining RepVue trend is −5.
          </li>
          <li>
            Composite verdict bands: 75+ &ldquo;On the gravy train&rdquo;,
            60–74 &ldquo;Building momentum&rdquo;, 45–59 &ldquo;Watch
            closely&rdquo;, below 45 &ldquo;Too early / thin data&rdquo;.
          </li>
        </ul>
      </section>

      {/* Worked example */}
      {timing && timing.value != null && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">
            Worked example: a negative signal drops a score
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This example is rendered live from Gong&apos;s current scorecard,
            not hand-written. Gong&apos;s sourced APAC contraction event and
            other negative signals subtract directly from its Timing score:
          </p>
          <Card className="mt-4 border-rule shadow-none">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3 text-base">
                Gong — Timing breakdown
                <span className="font-mono-data text-sm font-semibold">
                  {withoutPenalties} → {timing.value}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({negativeTotal} from negative signals)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Base (neutral prior before signals)
                  </span>
                  <span className="font-mono-data font-semibold">45</span>
                </li>
                {timing.contributions.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 text-muted-foreground">
                      {c.label}{" "}
                      {c.sources.length > 0 && (
                        <SourceChip sources={c.sources} />
                      )}
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
                <li className="flex justify-between border-t border-rule pt-2 text-sm font-medium">
                  <span>Timing score (clamped 3–97)</span>
                  <span className="font-mono-data font-semibold">
                    {timing.value}
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Without the negative signals, Gong&apos;s Timing would be{" "}
                {withoutPenalties}. The same mechanics apply to every
                dimension — score changes are logged per company in the
                signal-change log (&ldquo;Score moved 87→81 because APAC GTM
                postings dropped 40%&rdquo;).
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Dimension inputs */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">
          Exact inputs per dimension
        </h2>
        <div className="mt-4 space-y-4">
          {DIMENSION_INPUTS.map((dim) => (
            <Card key={dim.name} className="border-rule shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {dim.name}
                  <span className="font-mono-data text-xs text-gravy">
                    {dim.weight}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                  {dim.inputs.map((input) => (
                    <li key={input}>{input}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benchmarks */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Benchmark inputs</h2>
        <div className="mt-4 space-y-3">
          {BENCHMARK_INPUTS.map((b) => (
            <div key={b.name} className="border border-rule bg-card p-4">
              <p className="text-sm font-semibold">{b.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.inputs}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Weighting */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Weighting</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The composite is a weighted average of Timing, Territory, and
          Talent, normalized to your chosen weights, plus a role-lens bonus
          (0–10) based on how much of the company&apos;s open GTM hiring is
          in your role family. Weights persist per user on-device.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {WEIGHT_PRESETS.map((preset) => (
            <div key={preset.id} className="border border-rule bg-card p-4">
              <p className="flex items-center justify-between text-sm font-semibold">
                {preset.label}
                <span className="font-mono-data text-xs text-muted-foreground">
                  {preset.weights.timing}/{preset.weights.territory}/
                  {preset.weights.talent}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {preset.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          A composite renders only when all three dimensions have
          source-backed data — otherwise the company is listed as
          &ldquo;insufficient data&rdquo; and excluded from rankings.
        </p>
      </section>

      {/* Data collection */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">
          Data collection & refresh cadence
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Job boards (daily):</span>{" "}
            official public Greenhouse / Lever / Ashby APIs. We do not scrape
            LinkedIn.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Funding & news (weekly):
            </span>{" "}
            curated events with source links, audited weekly for staleness.
            The public feed hides entries older than 10 months.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Community submissions (continuous):
            </span>{" "}
            verified via work-email hash (we store only the SHA-256 hash,
            never the address) or invite code; aggregates render at n ≥{" "}
            {MIN_AGGREGATE_N} per company-region.
          </li>
          <li>
            <span className="font-medium text-foreground">
              People data (adapter):
            </span>{" "}
            a swappable provider interface for licensed sources (Coresignal,
            People Data Labs, Live Data Technologies, Harmonic). Currently
            backed by cached public-web signals; no LinkedIn scraping.
          </li>
        </ul>
      </section>

      {/* Limitations */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Known limitations</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Disputes */}
      <section className="mt-10 border border-rule bg-card p-6">
        <h2 className="font-display text-xl font-bold">
          Disputes & corrections
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          If you believe a data point is wrong — a stale posting count, a
          mis-dated funding event, an incorrect pricing model — email{" "}
          <a
            href="mailto:corrections@gtmhire.example"
            className="font-medium text-brief underline"
          >
            corrections@gtmhire.example
          </a>{" "}
          with the company, the metric, and a public source. Corrections are
          reviewed within one weekly refresh cycle, and every correction is
          recorded in the company&apos;s signal-change log.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Companies can claim their profile through the same address to
          supply verifiable public sources (pricing pages, press releases,
          official job boards).
        </p>
        <p className="mt-3 text-sm">
          <Link href="/companies" className="text-brief underline">
            Back to the benchmarks →
          </Link>
        </p>
      </section>
    </div>
  );
}
