"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SourceList, getScoreTone } from "@/components/provenance";
import { useWeights } from "@/components/weights-provider";
import { latestRetrievedAt, formatRetrievedAt } from "@/lib/provenance";
import {
  computeComposite,
  getCompositeVerdict,
  normalizeWeights,
} from "@/lib/scoring/weights";
import type { CompanyScorecard } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";
import { Train } from "lucide-react";

/**
 * The Gravy Train composite, computed live from the user's weights and role
 * lens. Click for the weighted breakdown + provenance. Shows "insufficient
 * data" when any dimension lacks sources (P0.4).
 */
export function CompositeBadge({
  scorecard,
  size = "default",
  className,
}: {
  scorecard: CompanyScorecard;
  size?: "default" | "lg";
  className?: string;
}) {
  const { weights, lens } = useWeights();
  const composite = computeComposite(scorecard, weights, lens);
  const normalized = normalizeWeights(weights);
  const dims = scorecard.dimensions;
  const allSources = [
    ...dims.timing.sources,
    ...dims.territory.sources,
    ...dims.talent.sources,
  ];
  const updated = latestRetrievedAt(allSources);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 border px-3 py-1 font-mono-data font-semibold transition-colors",
          composite.value != null
            ? cn(
                getScoreTone(composite.value),
                composite.value >= 75
                  ? "border-emerald-200 bg-emerald-50"
                  : composite.value >= 60
                    ? "border-blue-200 bg-blue-50"
                    : composite.value >= 45
                      ? "border-amber-200 bg-amber-50"
                      : "border-red-200 bg-red-50"
              )
            : "border-dashed border-rule bg-muted/30 text-muted-foreground",
          size === "lg" ? "text-sm" : "text-xs",
          className
        )}
        aria-label={
          composite.value != null
            ? `Gravy Train composite ${composite.value}. View breakdown.`
            : "Gravy Train composite: insufficient data. View why."
        }
      >
        <Train className={cn(size === "lg" ? "h-4 w-4" : "h-3 w-3")} aria-hidden />
        {composite.value != null ? (
          <>
            <span>{composite.value}</span>
            <span className="opacity-70">·</span>
            <span>{getCompositeVerdict(composite.value)}</span>
          </>
        ) : (
          <span className="font-sans font-medium">insufficient data</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <p className="font-mono-data text-[10px] uppercase tracking-widest text-gravy">
          Gravy Train composite — your weights
        </p>
        {composite.value == null ? (
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            <p>
              Composite not rendered — missing source-backed data for:{" "}
              <span className="font-medium text-foreground">
                {composite.missingDimensions.join(", ")}
              </span>
              .
            </p>
            {composite.missingDimensions.map((key) => (
              <p key={key} className="text-xs">
                <span className="font-medium capitalize">{key}:</span>{" "}
                {dims[key].insufficientReason}
              </p>
            ))}
            <p className="text-xs">
              We never synthesize a number to fill the gap. See{" "}
              <a href="/methodology" className="underline">
                methodology
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-3 space-y-1 text-xs">
              {(
                [
                  ["timing", "Timing"],
                  ["territory", "Territory"],
                  ["talent", "Talent"],
                ] as const
              ).map(([key, label]) => (
                <li key={key} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {label} {dims[key].value} × {Math.round(normalized[key] * 100)}%
                  </span>
                  <span className="font-mono-data font-semibold tabular-nums">
                    {(dims[key].value! * normalized[key]).toFixed(1)}
                  </span>
                </li>
              ))}
              {composite.lensBonus > 0 && (
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {composite.lensExplanation}
                  </span>
                  <span className="font-mono-data font-semibold text-emerald-600">
                    +{composite.lensBonus}
                  </span>
                </li>
              )}
            </ul>
            <div className="mt-3 border-t border-rule pt-3">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Sources
              </p>
              <SourceList sources={allSources.slice(0, 6)} />
            </div>
            {updated && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                Last updated {formatRetrievedAt(updated)}
              </p>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
