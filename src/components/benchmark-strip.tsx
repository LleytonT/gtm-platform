"use client";

/**
 * Six-metric benchmark strip for a company page. Every value renders with a
 * provenance popover; unsourced metrics render "insufficient data".
 */
import { BENCHMARKS, getBenchmarkValue } from "@/lib/benchmarks";
import { CompanyScorecard, getScoreColor } from "@/lib/scoring";
import { InsufficientData, WithSources } from "@/components/provenance";
import { useScoreSettings } from "@/components/score-settings";
import { cn } from "@/lib/utils";

export function BenchmarkStrip({ scorecard }: { scorecard: CompanyScorecard }) {
  const { effectiveWeights } = useScoreSettings();

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {BENCHMARKS.map((benchmark) => {
        const { value, sources } = getBenchmarkValue(
          scorecard,
          benchmark.id,
          effectiveWeights
        );
        return (
          <div
            key={benchmark.id}
            className="border border-rule bg-card px-3 py-3 text-center"
          >
            <p className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
              {benchmark.shortLabel}
            </p>
            <div className="mt-1 flex items-center justify-center">
              {value === null ? (
                <InsufficientData compact className="my-1.5" />
              ) : (
                <WithSources sources={sources} label={benchmark.label}>
                  <span
                    className={cn(
                      "font-mono-data text-2xl font-semibold tabular-nums",
                      getScoreColor(value)
                    )}
                  >
                    {value}
                  </span>
                </WithSources>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
