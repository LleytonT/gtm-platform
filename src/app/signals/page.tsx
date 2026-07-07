import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import { SignalFeed } from "@/components/signal-feed";
import {
  ANZ_SIGNAL_LABELS,
  getAnzExpansionSignals,
} from "@/lib/signals/anz-expansion";
import { describeChange, getSignalLog } from "@/lib/signal-log";
import { getCompanyBySlug } from "@/lib/data";
import { formatRetrievedAt } from "@/lib/provenance";
import { MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Signals — GTM Hire",
  description:
    "ANZ expansion detections and the full signal-change log: every score movement, diffable and explained with its source.",
};

export const dynamic = "force-dynamic";

export default function SignalsPage() {
  const anzSignals = getAnzExpansionSignals();
  const changeLog = getSignalLog();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Signals"
        title="What changed, and why"
        description="Two live streams: companies expanding into ANZ, and the diffable signal-change log behind every score movement. Each item links its source."
        align="left"
      />

      {/* ANZ expansion feed */}
      <section aria-labelledby="anz-feed" className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-signal" aria-hidden />
          <h2 id="anz-feed" className="font-display text-2xl font-semibold">
            Expanding into ANZ
          </h2>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Detectors: first AU/NZ job posting (automated from public boards), AU
          entity registration (manual check against the ASIC public register),
          first AU GTM hire announcement, and AU event presence (curated).
        </p>
        {anzSignals.length === 0 ? (
          <div className="border border-dashed border-rule bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No active ANZ expansion signals.
          </div>
        ) : (
          <ol className="space-y-2">
            {anzSignals.map((signal) => {
              const name =
                getCompanyBySlug(signal.companySlug)?.name ??
                signal.companySlug;
              return (
                <li
                  key={`${signal.companySlug}-${signal.type}-${signal.detectedAt}`}
                  className="border border-signal/30 bg-signal/5 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/companies/${signal.companySlug}`}
                      className="focus-ring text-sm font-semibold text-foreground hover:underline"
                    >
                      {name}
                    </Link>
                    <Badge variant="outline" className="text-[9px] uppercase">
                      {ANZ_SIGNAL_LABELS[signal.type]}
                    </Badge>
                    <span className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                      {formatRetrievedAt(signal.detectedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {signal.headline}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {signal.detail}
                    {" · "}
                    <a
                      href={signal.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-gravy"
                    >
                      {signal.source.source_name}
                    </a>
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Signal-change log */}
      <section aria-labelledby="change-log" className="mt-14">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gravy" aria-hidden />
          <h2 id="change-log" className="font-display text-2xl font-semibold">
            Signal-change log
          </h2>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Every material score movement, appended by the daily job-board
          refresh and weekly funding/news recompute. Diffable, explained, and
          sourced — e.g.{" "}
          <span className="font-mono-data text-xs">
            &ldquo;Score moved 87→81 because APAC GTM postings dropped
            40%.&rdquo;
          </span>
        </p>
        {changeLog.length === 0 ? (
          <div className="border border-dashed border-rule bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No logged score changes yet — entries appear after the first cron
            refresh.
          </div>
        ) : (
          <ol className="hairline divide-y divide-rule border border-rule bg-card">
            {changeLog.map((entry) => {
              const dropped =
                entry.before !== null &&
                entry.after !== null &&
                entry.after < entry.before;
              const Icon = dropped ? TrendingDown : TrendingUp;
              return (
                <li key={entry.id} className="flex items-start gap-3 p-4">
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      dropped ? "text-destructive" : "text-signal"
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/companies/${entry.companySlug}`}
                        className="focus-ring text-sm font-semibold text-foreground hover:underline"
                      >
                        {entry.companyName}
                      </Link>
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {entry.metric.replace(/_/g, " ")}
                      </Badge>
                      {entry.before !== null && entry.after !== null && (
                        <span
                          className={cn(
                            "font-mono-data text-xs font-semibold",
                            dropped ? "text-destructive" : "text-signal"
                          )}
                        >
                          {entry.before}→{entry.after}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {describeChange(entry)}
                    </p>
                    {entry.source && (
                      <p className="mt-1 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                        <a
                          href={entry.source.url}
                          target={
                            entry.source.url.startsWith("/")
                              ? undefined
                              : "_blank"
                          }
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-gravy"
                        >
                          {entry.source.source_name}
                        </a>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Combined recent feed */}
      <section className="mt-14">
        <SignalFeed limit={8} />
      </section>
    </main>
  );
}
