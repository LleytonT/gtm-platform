"use client";

import { Company } from "@/lib/types";
import { BENCHMARKS, rankCompanies } from "@/lib/benchmarks";
import { BenchmarkSparkline } from "@/components/benchmark-charts";
import { cn } from "@/lib/utils";

export function BenchmarkOverviewGrid({
  companies,
}: {
  companies: Company[];
}) {
  const topBenchmarks = BENCHMARKS.slice(0, 4);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {topBenchmarks.map((benchmark) => {
        const top3 = rankCompanies(companies, benchmark.id, 3);
        const sparkData = top3.map((r) => r.value).reverse();

        return (
          <div
            key={benchmark.id}
            className="border border-rule bg-card p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
                  {benchmark.shortLabel}
                </p>
                <p className="mt-1 font-mono-data text-2xl font-semibold tabular-nums">
                  {top3[0]?.value ?? "—"}
                  <span className="text-sm font-normal text-muted-foreground">
                    {benchmark.unit}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Top: {top3[0]?.company.name ?? "—"}
                </p>
              </div>
              <BenchmarkSparkline data={sparkData} className="h-8 w-16 opacity-70" />
            </div>
            <ol className="mt-3 space-y-1">
              {top3.map((r) => (
                <li
                  key={r.company.slug}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate text-muted-foreground">
                    {r.rank}. {r.company.name}
                  </span>
                  <span
                    className={cn(
                      "font-mono-data font-semibold tabular-nums",
                      r.rank === 1 && "text-gravy"
                    )}
                  >
                    {r.value}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
