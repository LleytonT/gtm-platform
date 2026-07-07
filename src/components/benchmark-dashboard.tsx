"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BENCHMARKS,
  BenchmarkId,
  SALES_MOTION_LABELS,
  ScoredCompany,
  getBenchmarkValue,
  rankScorecards,
} from "@/lib/benchmarks";
import { PRODUCT_PRICING_LABELS, REP_COMP_LABELS } from "@/lib/pricing-models";
import { BenchmarkBarChart } from "@/components/benchmark-charts";
import { LastUpdated } from "@/components/provenance";
import {
  RoleLensTabs,
  WeightControls,
  useScoreSettings,
} from "@/components/score-settings";
import { cn } from "@/lib/utils";
import { ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BenchmarkDashboard({ items }: { items: ScoredCompany[] }) {
  const { effectiveWeights } = useScoreSettings();
  const [activeBenchmark, setActiveBenchmark] =
    useState<BenchmarkId>("gravy_train");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "forbes_ai50" | "hyperscaler" | "established"
  >("all");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return items;
    return items.filter((item) =>
      item.company.categories.includes(categoryFilter)
    );
  }, [items, categoryFilter]);

  const { ranked, insufficient } = useMemo(
    () => rankScorecards(filtered, activeBenchmark, effectiveWeights, 12),
    [filtered, activeBenchmark, effectiveWeights]
  );

  const benchmark = BENCHMARKS.find((b) => b.id === activeBenchmark)!;
  const hovered = hoveredSlug
    ? items.find((item) => item.company.slug === hoveredSlug)
    : ranked[0]
      ? items.find((item) => item.company.slug === ranked[0].company.slug)
      : undefined;

  const hoveredScore = hovered
    ? getBenchmarkValue(hovered.scorecard, "gravy_train", effectiveWeights)
        .value
    : null;
  const hoveredMomentum = hovered
    ? hovered.scorecard.benchmarks.gtm_momentum.value
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {BENCHMARKS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveBenchmark(b.id)}
                className={cn(
                  "focus-ring font-mono-data border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors",
                  activeBenchmark === b.id
                    ? "border-brief bg-brief text-primary-foreground"
                    : "border-rule bg-card text-muted-foreground hover:bg-accent"
                )}
              >
                {b.shortLabel}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as typeof categoryFilter)
              }
              className="focus-ring border border-rule bg-card px-2 py-1.5 text-xs font-medium"
              aria-label="Filter by company category"
            >
              <option value="all">All companies</option>
              <option value="forbes_ai50">Forbes AI 50</option>
              <option value="hyperscaler">Hyperscalers</option>
              <option value="established">Established SaaS</option>
            </select>
          </div>
        </div>

        <div className="border border-rule bg-card p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">
                {benchmark.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {benchmark.description}
              </p>
            </div>
            <RoleLensTabs className="shrink-0" />
          </div>

          <BenchmarkBarChart
            items={ranked.map((r) => ({
              slug: r.company.slug,
              name: r.company.name,
              value: r.value,
              rank: r.rank,
            }))}
            unit={benchmark.unit}
            highlightedSlug={hoveredSlug}
            onHover={setHoveredSlug}
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {insufficient > 0 &&
                `${insufficient} compan${insufficient === 1 ? "y" : "ies"} excluded — insufficient sourced data for this metric.`}
            </p>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={`/companies?sort=${activeBenchmark}`} />}
            >
              View all rankings
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <WeightControls />

        {hovered && (
          <div className="border border-rule bg-card p-4">
            <p className="font-mono-data text-xs uppercase tracking-widest text-gravy">
              Company snapshot
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold">
              {hovered.company.name}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {hovered.company.sellsItself}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Gravy train</dt>
                <dd className="font-mono-data font-semibold">
                  {hoveredScore ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sales motion</dt>
                <dd>{SALES_MOTION_LABELS[hovered.company.salesMotion]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Product pricing</dt>
                <dd>{PRODUCT_PRICING_LABELS[hovered.company.productPricingModel]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rep comp model</dt>
                <dd>{REP_COMP_LABELS[hovered.company.repCompModel]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GTM momentum</dt>
                <dd className="font-mono-data font-semibold">
                  {hoveredMomentum ?? "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-3">
              <LastUpdated iso={hovered.scorecard.lastUpdated} />
            </div>
            <Button
              className="mt-4 w-full"
              size="sm"
              render={<Link href={`/companies/${hovered.company.slug}`} />}
            >
              Full benchmark profile
            </Button>
          </div>
        )}

        <div className="border border-rule bg-brief p-4 text-primary-foreground">
          <p className="font-mono-data text-xs uppercase tracking-widest text-gravy">
            How to read this
          </p>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Every number is computed from sourced inputs — public job boards,
            curated funding records, verified rep ratings, and community
            submissions. Hover any score for its sources, or read the{" "}
            <Link href="/methodology" className="underline underline-offset-2">
              full methodology
            </Link>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}
