import Link from "next/link";
import { SourceChip } from "@/components/provenance";
import type { SignalLogEntry } from "@/lib/signal-log-types";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  MapPin,
  Minus,
  Radar,
  TrendingUp,
} from "lucide-react";

const TYPE_ICONS: Record<SignalLogEntry["type"], typeof TrendingUp> = {
  score_change: TrendingUp,
  jobs_change: Briefcase,
  new_region: MapPin,
  anz_detector: MapPin,
  funding: TrendingUp,
  contraction: ArrowDownRight,
  tracking_started: Radar,
};

const IMPACT_STYLES = {
  positive: "text-signal border-signal/30 bg-signal/5",
  neutral: "text-muted-foreground border-rule bg-muted/30",
  negative: "text-destructive border-destructive/30 bg-destructive/5",
} as const;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Signal-change feed (P2.13): diffable entries produced by the daily
 * job-board refresh and weekly news audit. Replaces the old hand-written
 * "notable activity" list — every entry here carries source records.
 */
export function SignalFeed({
  entries,
  title,
  description,
}: {
  entries: SignalLogEntry[];
  title?: string;
  description?: string;
}) {
  return (
    <div className="border border-rule bg-card">
      {title && (
        <div className="hairline-b flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      )}
      <ul className="divide-y divide-rule">
        {entries.map((entry) => {
          const Icon = TYPE_ICONS[entry.type];
          const ImpactIcon =
            entry.impact === "positive"
              ? ArrowUpRight
              : entry.impact === "negative"
                ? ArrowDownRight
                : Minus;

          return (
            <li key={entry.id} className="flex gap-4 px-4 py-3">
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border",
                  IMPACT_STYLES[entry.impact]
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                    {formatDate(entry.date)}
                  </span>
                  <Link
                    href={`/companies/${entry.companySlug}`}
                    className="focus-ring text-xs font-medium text-gravy hover:underline"
                  >
                    {entry.companyName}
                  </Link>
                  <ImpactIcon
                    className={cn(
                      "h-3 w-3",
                      entry.impact === "positive" && "text-signal",
                      entry.impact === "negative" && "text-destructive",
                      entry.impact === "neutral" && "text-muted-foreground"
                    )}
                    aria-hidden
                  />
                  <SourceChip sources={entry.sources} />
                </div>
                <p className="mt-1 text-sm font-medium">{entry.headline}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {entry.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
