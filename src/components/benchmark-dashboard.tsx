"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Company } from "@/lib/types";
import {
  BENCHMARKS,
  BenchmarkId,
  COMP_MODEL_LABELS,
  SALES_MOTION_LABELS,
  rankCompanies,
} from "@/lib/benchmarks";
import { BenchmarkBarChart } from "@/components/benchmark-charts";
import { cn } from "@/lib/utils";
import { ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BenchmarkDashboard({ companies }: { companies: Company[] }) {
  const [activeBenchmark, setActiveBenchmark] =
    useState<BenchmarkId>("gravy_train");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "forbes_ai50" | "hyperscaler" | "established"
  >("all");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return companies;
    return companies.filter((c) => c.categories.includes(categoryFilter));
  }, [companies, categoryFilter]);

  const rankings = useMemo(
    () => rankCompanies(filtered, activeBenchmark, 12),
    [filtered, activeBenchmark]
  );

  const benchmark = BENCHMARKS.find((b) => b.id === activeBenchmark)!;
  const hoveredCompany = hoveredSlug
    ? companies.find((c) => c.slug === hoveredSlug)
    : rankings[0]?.company;

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
                setCategoryFilter(
                  e.target.value as typeof categoryFilter
                )
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
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold">
              {benchmark.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {benchmark.description}
            </p>
          </div>

          <BenchmarkBarChart
            items={rankings.map((r) => ({
              slug: r.company.slug,
              name: r.company.name,
              value: r.value,
              rank: r.rank,
            }))}
            unit={benchmark.unit}
            highlightedSlug={hoveredSlug}
            onHover={setHoveredSlug}
          />

          <div className="mt-4 flex justify-end">
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
        {hoveredCompany && (
          <div className="border border-rule bg-card p-4">
            <p className="font-mono-data text-xs uppercase tracking-widest text-gravy">
              Company snapshot
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold">
              {hoveredCompany.name}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {hoveredCompany.sellsItself}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Gravy train</dt>
                <dd className="font-mono-data font-semibold">
                  {hoveredCompany.gravyTrainScore}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sales motion</dt>
                <dd>{SALES_MOTION_LABELS[hoveredCompany.salesMotion]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Comp model</dt>
                <dd>{COMP_MODEL_LABELS[hoveredCompany.compModel]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GTM momentum</dt>
                <dd className="font-mono-data font-semibold">
                  {hoveredCompany.benchmarks.gtmMomentum}
                </dd>
              </div>
            </dl>
            <Button
              className="mt-4 w-full"
              size="sm"
              render={<Link href={`/companies/${hoveredCompany.slug}`} />}
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
            Benchmarks combine quantitative signals — funding, LinkedIn GTM
            headcount, regional balance, and quota proxies — so you can find
            where the product is actually selling, not just where recruiters
            say it is.
          </p>
        </div>
      </aside>
    </div>
  );
}
