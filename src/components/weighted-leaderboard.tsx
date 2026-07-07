"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getScoreTone } from "@/components/provenance";
import { useWeights } from "@/components/weights-provider";
import { computeComposite } from "@/lib/scoring/weights";
import type { ScoredCompany } from "@/lib/scored";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

const TONE_BARS: [number, string][] = [
  [75, "bg-emerald-500"],
  [60, "bg-blue-500"],
  [45, "bg-amber-500"],
  [0, "bg-red-500"],
];

function barTone(value: number): string {
  for (const [min, cls] of TONE_BARS) {
    if (value >= min) return cls;
  }
  return "bg-red-500";
}

/**
 * Live leaderboard re-ranked by the user's weights + role lens (P1.8,
 * P1.10). Companies without source-backed data for all three dimensions are
 * listed separately as "insufficient data" — never given a synthetic rank.
 */
export function WeightedLeaderboard({
  items,
  limit = 12,
}: {
  items: ScoredCompany[];
  limit?: number;
}) {
  const { weights, lens } = useWeights();

  const { ranked, insufficient } = useMemo(() => {
    const scored = items.map((item) => ({
      item,
      composite: computeComposite(item.scorecard, weights, lens),
    }));
    const ranked = scored
      .filter((s) => s.composite.value != null)
      .sort((a, b) => (b.composite.value ?? 0) - (a.composite.value ?? 0))
      .slice(0, limit);
    const insufficient = scored.filter((s) => s.composite.value == null);
    return { ranked, insufficient };
  }, [items, weights, lens, limit]);

  const max = ranked[0]?.composite.value ?? 100;

  return (
    <div className="border border-rule bg-card p-4 sm:p-6">
      <ol className="space-y-2.5">
        {ranked.map(({ item, composite }, i) => {
          const value = composite.value!;
          return (
            <li key={item.company.slug} className="flex items-center gap-3">
              <span className="font-mono-data w-6 shrink-0 text-right text-xs text-muted-foreground">
                {i + 1}.
              </span>
              <div className="w-40 min-w-0 shrink-0 sm:w-48">
                <Link
                  href={`/companies/${item.company.slug}`}
                  className="focus-ring block truncate text-sm font-medium hover:text-brief hover:underline"
                >
                  {item.company.name}
                </Link>
              </div>
              <div className="relative h-5 min-w-0 flex-1 bg-muted/40">
                <div
                  className={cn("h-full", barTone(value))}
                  style={{ width: `${Math.max(4, (value / max) * 100)}%` }}
                />
                {item.scorecard.anzDetections.length > 0 && (
                  <MapPin
                    className="absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-brief"
                    aria-label="Expanding into ANZ"
                  />
                )}
              </div>
              <span
                className={cn(
                  "font-mono-data w-8 shrink-0 text-right text-sm font-semibold tabular-nums",
                  getScoreTone(value)
                )}
              >
                {value}
              </span>
            </li>
          );
        })}
      </ol>
      {insufficient.length > 0 && (
        <p className="mt-4 border-t border-rule pt-3 text-xs text-muted-foreground">
          Not ranked (insufficient source-backed data):{" "}
          {insufficient.map(({ item }, i) => (
            <span key={item.company.slug}>
              {i > 0 && ", "}
              <Link
                href={`/companies/${item.company.slug}`}
                className="underline hover:text-foreground"
              >
                {item.company.name}
              </Link>
            </span>
          ))}
          . We never rank on synthesized scores.
        </p>
      )}
    </div>
  );
}
