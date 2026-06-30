import { QualitativeSignal, SignalSource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Coffee,
  DollarSign,
  UserSearch,
  TrendingUp,
} from "lucide-react";
import { SIGNAL_SOURCE_LABELS } from "@/lib/three-ts";

const SOURCE_ICONS: Record<SignalSource, typeof UserSearch> = {
  linkedin: UserSearch,
  hiring: Briefcase,
  funding: DollarSign,
  market: TrendingUp,
  community: Coffee,
};

const CONFIDENCE_STYLES = {
  high: "border-emerald-200 bg-emerald-50/60",
  medium: "border-blue-200 bg-blue-50/60",
  emerging: "border-amber-200 bg-amber-50/60",
};

export function QualitativeSignals({
  signals,
  compact,
}: {
  signals: QualitativeSignal[];
  compact?: boolean;
}) {
  return (
    <ul className={cn("space-y-2", compact && "space-y-1.5")}>
      {signals.map((signal) => {
        const Icon = SOURCE_ICONS[signal.source];
        return (
          <li
            key={signal.text}
            className={cn(
              "rounded-lg border p-3",
              CONFIDENCE_STYLES[signal.confidence]
            )}
          >
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-muted-foreground",
                    compact ? "text-xs" : "text-sm"
                  )}
                >
                  {signal.text}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {SIGNAL_SOURCE_LABELS[signal.source]}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {signal.confidence}
                  </Badge>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function SignalSourceLegend() {
  const sources: SignalSource[] = [
    "linkedin",
    "hiring",
    "funding",
    "market",
    "community",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((source) => {
        const Icon = SOURCE_ICONS[source];
        return (
          <div
            key={source}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Icon className="h-3 w-3" />
            {SIGNAL_SOURCE_LABELS[source]}
          </div>
        );
      })}
    </div>
  );
}
