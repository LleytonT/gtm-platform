import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WEIGHT_PRESETS, ROLE_LENS_META } from "@/lib/scoring";
import { METHOD_LABELS } from "@/lib/provenance";
import {
  BookOpenText,
  Clock,
  Map,
  Mail,
  ShieldAlert,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology — GTM Hire",
  description:
    "Exact inputs per scoring dimension, weighting, data sources, known limitations, and how to dispute or correct a data point.",
};

const DIMENSIONS = [
  {
    key: "timing",
    icon: Clock,
    label: "Timing",
    formula: "0.6 × Funding Velocity + 0.4 × GTM Momentum",
    inputs: [
      {
        name: "Funding Velocity",
        detail:
          "Curated funding records with press sources. Private companies: recency score max(0, 100 − 2.5 × months since announcement, capped at 80) + size bonus (+20 for ≥$1B, +15 for ≥$250M, +10 for ≥$100M, +5 otherwise). Public companies score a flat 65 (stable capital access, no private step-up upside).",
        method: "manual",
      },
      {
        name: "GTM Momentum",
        detail:
          "Public Greenhouse/Lever/Ashby job boards, polled daily. Score = min(50, GTM share of postings × 125) + min(25, GTM postings ÷ 8) + week-over-week GTM posting change (clamped to ±25).",
        method: "scraped",
      },
    ],
  },
  {
    key: "territory",
    icon: Map,
    label: "Territory",
    formula:
      "0.6 × Regional Balance + 0.4 × GTM Momentum, +5 bonus if active AU/NZ GTM postings",
    inputs: [
      {
        name: "Regional Balance",
        detail:
          "Distribution of open GTM postings across AMER/EMEA/APAC/ANZ/LATAM from public job boards. Score = non-AMER share × 140 + 8 points per distinct non-AMER region with ≥1 posting, clamped to 0–100.",
        method: "scraped",
      },
      {
        name: "ANZ expansion detectors",
        detail:
          "First AU/NZ job posting (automated), AU entity registration (manual check against the ASIC public register), first AU GTM hire announcement, AU event presence (curated). Surfaced as the \"Expanding into ANZ\" badge and feed — the +5 territory bonus is the only score effect.",
        method: "manual",
      },
    ],
  },
  {
    key: "talent",
    icon: Users,
    label: "Talent",
    formula:
      "0.6 × Talent Components (RepVue percentile + licensed people-data tenure model) + 0.4 × Quota Reality",
    inputs: [
      {
        name: "RepVue verified ratings",
        detail:
          "Overall percentile from RepVue's verified sales-rep ratings (scraped, medium confidence).",
        method: "scraped",
      },
      {
        name: "Licensed people data",
        detail:
          "Team tenure, internal promotion rate, and hiring rate from a licensed people-data provider behind a swappable adapter (currently Exa; Coresignal / People Data Labs / Live Data Technologies / Harmonic adapters are stubbed). We do NOT scrape LinkedIn. Base 50, adjusted: avg tenure ≥18mo +15 / ≥12mo +8 / <9mo −10; >50% of team under 12 months −15, <25% +10; promotion rate ≥50% +15 / ≥25% +8; hiring rate >30% +10. Requires sample size ≥10.",
        method: "licensed",
      },
      {
        name: "Quota Reality",
        detail:
          "Verified community submissions take priority: attainment-band midpoints weighted by sample size, shown only when n ≥ 3 per company-region. Fallback: RepVue incentive-comp percentile (0.7) + inbound-lead-flow percentile (0.3), labeled as a scraped proxy. Scraped proxies are deprecated for a region once submission data exists there.",
        method: "manual",
      },
    ],
  },
];

const LIMITATIONS = [
  "Job-board coverage is partial: 26 of the tracked companies expose public Greenhouse/Lever/Ashby boards. Companies without a public board show \"insufficient data\" for job-board-derived metrics — they are never given a synthesized score.",
  "Week-over-week momentum requires at least 7 days of history; the first snapshots after launch carry no delta component.",
  "Funding records are manually curated from press coverage and may lag announcements by a few days.",
  "RepVue percentiles are scraped from public profile pages (medium confidence) and can lag real quota changes by months — that's exactly why verified community submissions replace them where available.",
  "Role classification (AE / SE / FDE / SDR) is regex-based on job titles and misclassifies unusual titles.",
  "Curated background facts (revenue, retention, comp ranges on company pages) are descriptive context, clearly flagged as unverified, and never feed scores.",
  "Team intel records are rendered as facts and intentionally excluded from all scoring — we do not score identifiable individuals in small regions.",
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono-data text-xs font-medium uppercase tracking-[0.25em] text-gravy">
        Public methodology
      </p>
      <h1 className="font-display mt-2 flex items-center gap-3 text-3xl font-semibold">
        <BookOpenText className="h-7 w-7 text-gravy" aria-hidden />
        How every score is computed
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Every number on this site is computed from a sourced input and carries
        source records: <em>who</em> we got it from, <em>when</em> we retrieved
        it, at what confidence, and by which method (
        {Object.values(METHOD_LABELS).join(", ").toLowerCase()}). When a metric
        has no source record we render{" "}
        <span className="font-mono-data text-sm">insufficient data</span> —
        never a synthesized score.
      </p>

      {/* Composite + weighting */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">
          1. The composite: user-weighted Three T&apos;s
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          The Gravy Train Index is a weighted average of three dimensions —
          Timing, Territory, Talent — each scored 0–100 from sourced metrics.
          Weights are yours: the default preset is{" "}
          <strong>Timing 50 / Territory 30 / Talent 20</strong>, and your
          chosen preset or custom sliders are saved in your browser. A role
          lens (AE, SE/FDE, SDR) blends 50/50 with your weights to re-rank for
          your role.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {WEIGHT_PRESETS.map((preset) => (
            <div key={preset.id} className="border border-rule bg-card p-3">
              <p className="text-sm font-semibold">{preset.label}</p>
              <p className="font-mono-data mt-0.5 text-xs text-gravy">
                T {preset.weights.timing} / T {preset.weights.territory} / T{" "}
                {preset.weights.talent}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {preset.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Coverage rule: all three dimensions sourced → full score. Two of
          three → weights renormalize over the available dimensions and the
          score is flagged partial. Fewer than two → no composite is rendered.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(ROLE_LENS_META).map(([id, meta]) => (
            <Badge key={id} variant="outline" className="text-xs">
              {meta.label}: {meta.weights.timing}/{meta.weights.territory}/
              {meta.weights.talent}
            </Badge>
          ))}
        </div>
      </section>

      {/* Per-dimension inputs */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">
          2. Exact inputs per dimension
        </h2>
        <div className="mt-4 space-y-4">
          {DIMENSIONS.map((dim) => (
            <Card key={dim.key} id={dim.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <dim.icon className="h-5 w-5 text-primary" aria-hidden />
                  {dim.label}
                </CardTitle>
                <p className="font-mono-data text-xs text-gravy">
                  {dim.formula}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {dim.inputs.map((input) => (
                    <li key={input.name} className="text-sm">
                      <span className="font-semibold">{input.name}</span>{" "}
                      <Badge variant="secondary" className="ml-1 text-[10px]">
                        {METHOD_LABELS[input.method as keyof typeof METHOD_LABELS]}
                      </Badge>
                      <p className="mt-1 text-muted-foreground">{input.detail}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground" id="funding-velocity">
          Benchmarks shown alongside the composite (GTM Momentum, Funding
          Velocity, Quota Reality, Regional Balance, PMF Strength) are the raw
          sourced metrics above; PMF Strength is RepVue&apos;s
          product-market-fit percentile.
        </p>
      </section>

      {/* Negative signals + worked example */}
      <section className="mt-10">
        <h2 className="font-display flex items-center gap-2 text-2xl font-semibold">
          <ShieldAlert className="h-6 w-6 text-destructive" aria-hidden />
          3. Negative signals and a worked example
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Curated negative events (layoffs, regional headcount contractions)
          within the last 12 months subtract{" "}
          <strong>8 points per affected dimension</strong>, and posting
          declines flow through the momentum/balance formulas directly. Scores
          are calibrated to the full 0–100 range: ≥75 &quot;On the gravy
          train&quot;, 55–74 &quot;Building momentum&quot;, 35–54 &quot;Watch
          closely&quot;, &lt;35 &quot;Too early&quot;.
        </p>
        <Card className="mt-4 border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base">
              Worked example: Gong, 2026-07-01
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-mono-data font-semibold text-foreground">
                Score moved 87→81 on 2026-07-01
              </span>{" "}
              because APAC GTM postings dropped 40% (15→9) on Gong&apos;s
              public job board.
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Regional Balance recomputed from the new snapshot: the non-AMER
                share fell, dropping the metric 12 points.
              </li>
              <li>
                The August 2025 APAC contraction (curated, press-sourced) is
                still inside the 12-month window, so Territory carries a −8
                penalty on top: Territory 74→62.
              </li>
              <li>
                With default weights (50/30/20), the composite moved 87→81.
                Both entries are in{" "}
                <Link
                  href="/companies/gong"
                  className="underline underline-offset-2"
                >
                  Gong&apos;s signal change log
                </Link>{" "}
                with their sources.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Freshness */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">4. Freshness</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Job boards are re-polled daily and funding/news scores are recomputed
          weekly by cron. Every material score movement (≥2 points) is appended
          to the public{" "}
          <Link href="/signals" className="underline underline-offset-2">
            signal change log
          </Link>{" "}
          with a human-readable reason. Every company card shows a visible
          &quot;last updated&quot; timestamp derived from the newest source
          record behind its metrics.
        </p>
      </section>

      {/* Data policy */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">
          5. What we deliberately don&apos;t do
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong>No LinkedIn scraping.</strong> People-derived signals come
            from public job boards and licensed people-data providers behind a
            swappable adapter.
          </li>
          <li>
            <strong>No scoring of identifiable individuals.</strong> Curated
            leadership intel is rendered as facts (&quot;ex-Datadog, joined at
            Series B&quot;), never as a numeric team-strength score.
          </li>
          <li>
            <strong>No synthesized numbers.</strong> Metrics without a source
            record render as &quot;insufficient data&quot;.
          </li>
          <li>
            <strong>No internal employer data.</strong> Segment-success signals
            use public proxies only: case-study/logo announcements,
            segment-specific job postings, and earnings/press statements.
          </li>
          <li>
            <strong>No pay-to-reveal.</strong> Signal alerts are free.
          </li>
        </ul>
      </section>

      {/* Limitations */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">
          6. Known limitations
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          {LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Dispute */}
      <section className="mt-10 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" aria-hidden />
              Disputes & corrections
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Work at one of these companies and see something wrong? Email{" "}
              <a
                href="mailto:corrections@gtmhire.example?subject=Data%20correction"
                className="font-medium text-brief underline underline-offset-2"
              >
                corrections@gtmhire.example
              </a>{" "}
              with the company, the metric, and (ideally) a public source. We
              review disputes within 5 business days; corrected metrics show a
              new retrieval timestamp, and material score changes appear in the
              signal change log like any other movement.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
