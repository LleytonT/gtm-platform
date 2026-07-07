import Link from "next/link";
import { getCuratedEvents } from "@/lib/curated-events";
import { getSignalLog } from "@/lib/signal-log";
import { getAnzExpansionSignals } from "@/lib/signals/anz-expansion";
import { getCompanyBySlug } from "@/lib/data";
import { SourceRecord, formatRetrievedAt } from "@/lib/provenance";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  DollarSign,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedItem {
  id: string;
  date: string; // ISO
  companySlug: string;
  companyName: string;
  kind: "score_change" | "anz_expansion" | "curated_event";
  tone: "positive" | "neutral" | "negative";
  headline: string;
  detail: string;
  source?: SourceRecord;
}

const FRESHNESS_WINDOW_MONTHS = 12;

function buildFeed(now: Date, limit: number): FeedItem[] {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - FRESHNESS_WINDOW_MONTHS);
  const cutoffIso = cutoff.toISOString();

  const items: FeedItem[] = [];

  for (const entry of getSignalLog()) {
    if (entry.date < cutoffIso) continue;
    const dropped =
      entry.before !== null &&
      entry.after !== null &&
      entry.after < entry.before;
    items.push({
      id: `log-${entry.id}`,
      date: entry.date,
      companySlug: entry.companySlug,
      companyName: entry.companyName,
      kind: entry.metric === "anz_expansion" ? "anz_expansion" : "score_change",
      tone:
        entry.metric === "anz_expansion"
          ? "positive"
          : dropped
            ? "negative"
            : "positive",
      headline:
        entry.before !== null && entry.after !== null
          ? `${entry.companyName}: ${entry.metric.replace(/_/g, " ")} ${entry.before}→${entry.after}`
          : `${entry.companyName}: ${entry.metric.replace(/_/g, " ")} signal`,
      detail: entry.reason,
      source: entry.source,
    });
  }

  for (const signal of getAnzExpansionSignals()) {
    const iso = signal.detectedAt.length === 10
      ? `${signal.detectedAt}T00:00:00.000Z`
      : signal.detectedAt;
    if (iso < cutoffIso) continue;
    const name =
      getCompanyBySlug(signal.companySlug)?.name ?? signal.companySlug;
    items.push({
      id: `anz-${signal.companySlug}-${signal.type}`,
      date: iso,
      companySlug: signal.companySlug,
      companyName: name,
      kind: "anz_expansion",
      tone: "positive",
      headline: `${name}: ${signal.headline}`,
      detail: signal.detail,
      source: signal.source,
    });
  }

  for (const event of getCuratedEvents()) {
    const iso = `${event.date}T00:00:00.000Z`;
    if (iso < cutoffIso) continue;
    items.push({
      id: `event-${event.id}`,
      date: iso,
      companySlug: event.companySlug,
      companyName: event.companyName,
      kind: "curated_event",
      tone: event.impact,
      headline: event.headline,
      detail: event.detail,
      source: event.source,
    });
  }

  return items
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

const TONE_STYLES = {
  positive: "text-signal border-signal/30 bg-signal/5",
  neutral: "text-muted-foreground border-rule bg-muted/30",
  negative: "text-destructive border-destructive/30 bg-destructive/5",
} as const;

const KIND_ICONS = {
  score_change: TrendingUp,
  anz_expansion: MapPin,
  curated_event: DollarSign,
} as const;

export function SignalFeed({ limit = 10 }: { limit?: number }) {
  const now = new Date();
  const items = buildFeed(now, limit);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono-data text-xs uppercase tracking-widest text-gravy">
            Signal feed
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold">
            What moved recently
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Score changes from the refresh pipeline, ANZ expansion detections,
            and curated events (each with a source, items older than 12 months
            are hidden).
          </p>
        </div>
        <Link
          href="/signals"
          className="focus-ring inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brief hover:underline"
        >
          All signals
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-rule bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No signals in the last 12 months — the feed hides stale items until
          the next refresh.
        </div>
      ) : (
        <ol className="space-y-2">
          {items.map((item) => {
            const Icon =
              item.tone === "negative" ? TrendingDown : KIND_ICONS[item.kind];
            return (
              <li
                key={item.id}
                className={cn("border p-3", TONE_STYLES[item.tone])}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/companies/${item.companySlug}`}
                        className="focus-ring text-sm font-semibold text-foreground hover:underline"
                      >
                        {item.headline}
                      </Link>
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {item.kind === "anz_expansion"
                          ? "ANZ expansion"
                          : item.kind === "score_change"
                            ? "score change"
                            : "curated event"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                    <p className="mt-1.5 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                      {formatRetrievedAt(item.date)}
                      {item.source && (
                        <>
                          {" · "}
                          <a
                            href={item.source.url}
                            target={
                              item.source.url.startsWith("/")
                                ? undefined
                                : "_blank"
                            }
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:text-gravy"
                          >
                            {item.source.source_name}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
