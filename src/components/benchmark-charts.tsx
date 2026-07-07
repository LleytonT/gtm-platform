"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getScoreColor } from "@/lib/scoring";

export function BenchmarkBarChart({
  items,
  unit = "/100",
  maxValue = 100,
  highlightedSlug,
  onHover,
}: {
  items: { slug: string; name: string; value: number; rank: number }[];
  unit?: string;
  maxValue?: number;
  highlightedSlug?: string | null;
  onHover?: (slug: string | null) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = highlightedSlug ?? hovered;

  const scale = useMemo(() => {
    const top = items[0]?.value ?? maxValue;
    return Math.max(top, maxValue);
  }, [items, maxValue]);

  return (
    <div className="space-y-1.5" role="list" aria-label="Benchmark rankings">
      {items.map((item) => {
        const width = (item.value / scale) * 100;
        const isActive = active === item.slug;

        return (
          <Link
            key={item.slug}
            href={`/companies/${item.slug}`}
            role="listitem"
            className={cn(
              "group flex items-center gap-3 px-2 py-1.5 transition-colors",
              isActive && "bg-accent/60"
            )}
            onMouseEnter={() => {
              setHovered(item.slug);
              onHover?.(item.slug);
            }}
            onMouseLeave={() => {
              setHovered(null);
              onHover?.(null);
            }}
          >
            <span className="font-mono-data w-6 shrink-0 text-right text-xs text-muted-foreground">
              {item.rank}
            </span>
            <span className="w-28 shrink-0 truncate text-sm font-medium sm:w-36">
              {item.name}
            </span>
            <div className="relative min-w-0 flex-1">
              <div className="h-7 bg-muted/40">
                <div
                  className={cn(
                    "flex h-full items-center justify-end pr-2 transition-all duration-300",
                    item.rank <= 3 ? "bg-gravy/80" : "bg-brief/70",
                    isActive && "bg-gravy"
                  )}
                  style={{ width: `${width}%` }}
                >
                  <span className="font-mono-data text-xs font-semibold text-primary-foreground">
                    {item.value}
                    {unit}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function BenchmarkSparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("text-gravy", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function ScorePill({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "font-mono-data inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold tabular-nums",
        getScoreColor(score)
      )}
    >
      {score}
    </span>
  );
}
