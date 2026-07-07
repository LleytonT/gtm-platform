"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CONFIDENCE_LABELS,
  METHOD_LABELS,
  formatRetrievedAt,
  latestRetrievedAt,
  type MetricSource,
} from "@/lib/provenance";
import type { DimensionScore, ScoreContribution } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";
import { CircleHelp, Clock3, ExternalLink } from "lucide-react";

const CONFIDENCE_DOT: Record<MetricSource["confidence"], string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-red-500",
};

export function SourceList({ sources }: { sources: MetricSource[] }) {
  if (sources.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No source records — this value is not rendered as data.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {sources.map((s, i) => (
        <li key={`${s.source_name}-${i}`} className="text-xs">
          <div className="flex items-start gap-1.5">
            <span
              className={cn(
                "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                CONFIDENCE_DOT[s.confidence]
              )}
              aria-hidden
            />
            <div className="min-w-0">
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline decoration-rule underline-offset-2 hover:decoration-foreground"
                >
                  {s.source_name}
                  <ExternalLink className="ml-1 inline h-2.5 w-2.5" aria-hidden />
                </a>
              ) : (
                <span className="font-medium text-foreground">
                  {s.source_name}
                </span>
              )}
              <p className="text-muted-foreground">
                {CONFIDENCE_LABELS[s.confidence]} · {METHOD_LABELS[s.method]} ·
                retrieved {formatRetrievedAt(s.retrieved_at)}
              </p>
              {s.note && <p className="text-muted-foreground">{s.note}</p>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ContributionList({
  contributions,
}: {
  contributions: ScoreContribution[];
}) {
  if (contributions.length === 0) return null;
  return (
    <ul className="space-y-1">
      {contributions.map((c, i) => (
        <li key={i} className="flex items-start justify-between gap-2 text-xs">
          <span className="text-muted-foreground">{c.label}</span>
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
    </ul>
  );
}

export function getScoreTone(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 45) return "text-amber-600";
  return "text-red-600";
}

/**
 * A score with provenance: click/hover shows sources, contribution
 * breakdown, and retrieval timestamps. Renders "insufficient data" when the
 * metric has no source-backed value (P0.4).
 */
export function SourcedScore({
  label,
  score,
  className,
  valueClassName,
  showBreakdown = true,
}: {
  label: string;
  score: DimensionScore;
  className?: string;
  valueClassName?: string;
  showBreakdown?: boolean;
}) {
  const updated = latestRetrievedAt(score.sources);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "focus-ring group flex w-full flex-col items-center gap-0.5 border border-rule bg-card px-3 py-3 text-center transition-colors hover:border-brief/40 hover:bg-accent/30",
          className
        )}
        aria-label={`${label}: ${score.value ?? "insufficient data"}. View sources.`}
      >
        <span className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {score.value != null ? (
          <span
            className={cn(
              "font-mono-data text-2xl font-semibold tabular-nums",
              getScoreTone(score.value),
              valueClassName
            )}
          >
            {score.value}
          </span>
        ) : (
          <span className="py-1 text-xs font-medium leading-tight text-muted-foreground">
            insufficient
            <br />
            data
          </span>
        )}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <CircleHelp className="h-2.5 w-2.5" aria-hidden />
          {score.value != null
            ? `${score.sources.length} source${score.sources.length === 1 ? "" : "s"}`
            : "why?"}
        </span>
      </PopoverTrigger>
      <PopoverContent className="max-h-96 w-96 overflow-y-auto">
        <p className="font-mono-data text-[10px] uppercase tracking-widest text-gravy">
          {label} — provenance
        </p>
        {score.value == null ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {score.insufficientReason ??
              "No source-backed data for this metric."}{" "}
            We never render synthesized scores.
          </p>
        ) : (
          <>
            {showBreakdown && (
              <div className="mt-3">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Score breakdown
                </p>
                <ContributionList contributions={score.contributions} />
              </div>
            )}
            <div className="mt-3 border-t border-rule pt-3">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Sources
              </p>
              <SourceList sources={score.sources} />
            </div>
            {updated && (
              <p className="mt-3 flex items-center gap-1 border-t border-rule pt-2 text-[10px] text-muted-foreground">
                <Clock3 className="h-3 w-3" aria-hidden />
                Last updated {formatRetrievedAt(updated)}
              </p>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Inline provenance chip for non-score facts (pricing model, events…). */
export function SourceChip({
  sources,
  label = "sources",
}: {
  sources: MetricSource[];
  label?: string;
}) {
  if (sources.length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger
        className="focus-ring inline-flex items-center gap-1 border border-rule bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent"
        aria-label={`View ${label}`}
      >
        <CircleHelp className="h-2.5 w-2.5" aria-hidden />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <SourceList sources={sources} />
      </PopoverContent>
    </Popover>
  );
}

export function LastUpdated({
  iso,
  prefix = "Last updated",
  className,
}: {
  iso: string | null;
  prefix?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] text-muted-foreground",
        className
      )}
    >
      <Clock3 className="h-2.5 w-2.5" aria-hidden />
      {iso ? `${prefix} ${formatRetrievedAt(iso)}` : "No source data yet"}
    </span>
  );
}

/** Flag for hand-curated, illustrative content (P0.4). */
export function CuratedFlag({
  label = "Curated analyst note",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800",
        className
      )}
    >
      {label}
    </span>
  );
}
