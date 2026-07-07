import Link from "next/link";
import { notableActivities } from "@/lib/notable-activity";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Minus,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const TYPE_ICONS = {
  funding: TrendingUp,
  hiring: Users,
  expansion: Building2,
  leadership: Users,
  product: Zap,
  contraction: ArrowDownRight,
} as const;

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

export function NotableActivityFeed({ limit = 8 }: { limit?: number }) {
  const activities = notableActivities.slice(0, limit);

  return (
    <div className="border border-rule bg-card">
      <div className="hairline-b flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Notable GTM activity
          </h2>
          <p className="text-xs text-muted-foreground">
            Funding, hiring shifts, and regional signals that move the benchmarks
          </p>
        </div>
      </div>
      <ul className="divide-y divide-rule">
        {activities.map((activity) => {
          const Icon = TYPE_ICONS[activity.type];
          const ImpactIcon =
            activity.impact === "positive"
              ? ArrowUpRight
              : activity.impact === "negative"
                ? ArrowDownRight
                : Minus;

          return (
            <li key={activity.id}>
              <Link
                href={`/companies/${activity.companySlug}`}
                className="focus-ring group flex gap-4 px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border",
                    IMPACT_STYLES[activity.impact]
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                      {formatDate(activity.date)}
                    </span>
                    <span className="text-xs font-medium text-gravy">
                      {activity.companyName}
                    </span>
                    <ImpactIcon
                      className={cn(
                        "h-3 w-3",
                        activity.impact === "positive" && "text-signal",
                        activity.impact === "negative" && "text-destructive",
                        activity.impact === "neutral" && "text-muted-foreground"
                      )}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-1 text-sm font-medium group-hover:text-brief">
                    {activity.headline}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {activity.detail}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
