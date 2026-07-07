"use client";

/**
 * Provenance UI primitives.
 *
 * Every rendered metric carries its source records; hovering or clicking the
 * value reveals where the number came from, when it was retrieved, and at
 * what confidence. Metrics without sources render as "insufficient data".
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  CONFIDENCE_LABELS,
  METHOD_LABELS,
  SourceRecord,
  formatRetrievedAt,
} from "@/lib/provenance";
import { cn } from "@/lib/utils";
import { Clock, ExternalLink, Info } from "lucide-react";

export function SourceList({ sources }: { sources: SourceRecord[] }) {
  if (sources.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No source records — this metric is not rendered as a number.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {sources.map((s, i) => (
        <li key={`${s.url}-${i}`} className="text-xs">
          <a
            href={s.url}
            target={s.url.startsWith("/") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-rule underline-offset-2 hover:decoration-gravy"
          >
            {s.source_name}
            <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden />
          </a>
          <p className="mt-0.5 text-muted-foreground">
            {METHOD_LABELS[s.method]} · {CONFIDENCE_LABELS[s.confidence]} ·
            retrieved {formatRetrievedAt(s.retrieved_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Wraps a rendered value with a hover/click provenance popover.
 */
export function WithSources({
  sources,
  label,
  children,
  align = "left",
}: {
  sources: SourceRecord[];
  label?: string;
  children: ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center gap-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Sources${label ? ` for ${label}` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="focus-ring inline-flex text-muted-foreground/60 hover:text-gravy"
      >
        <Info className="h-3 w-3" aria-hidden />
      </button>
      {open && (
        <div
          id={panelId}
          role="tooltip"
          className={cn(
            "absolute top-full z-40 mt-1 w-72 border border-rule bg-popover p-3 shadow-md",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <p className="mb-2 font-mono-data text-[10px] font-medium uppercase tracking-widest text-gravy">
            {label ? `${label} — sources` : "Sources"}
          </p>
          <SourceList sources={sources} />
        </div>
      )}
    </span>
  );
}

/** "Insufficient data" marker — rendered instead of any unsourced number. */
export function InsufficientData({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-dashed border-rule bg-muted/30 px-1.5 py-0.5 font-mono-data text-muted-foreground",
        compact ? "text-[10px]" : "text-xs",
        className
      )}
      title="No source record for this metric — we never render synthesized numbers."
    >
      insufficient data
    </span>
  );
}

/** Visible "last updated" timestamp for cards and page headers. */
export function LastUpdated({
  iso,
  className,
  prefix = "Updated",
}: {
  iso: string | null;
  className?: string;
  prefix?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      <Clock className="h-3 w-3" aria-hidden />
      {iso ? `${prefix} ${formatRetrievedAt(iso)}` : "No source data yet"}
    </span>
  );
}
