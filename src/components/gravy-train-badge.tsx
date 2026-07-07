"use client";

/**
 * User-weighted Gravy Train badge. The score is computed on the client from
 * the sourced scorecard and the viewer's saved weights + role lens.
 */
import { Badge } from "@/components/ui/badge";
import { WithSources } from "@/components/provenance";
import { useScoreSettings } from "@/components/score-settings";
import {
  CompanyScorecard,
  GravyTrainVerdict,
  computeWeightedScore,
  getScoreBg,
  getScoreColor,
  getVerdict,
} from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Train } from "lucide-react";

function verdictBadgeVariant(
  verdict: GravyTrainVerdict
): "default" | "secondary" | "outline" {
  if (verdict === "On the gravy train") return "default";
  if (verdict === "Insufficient data") return "outline";
  return "secondary";
}

export function GravyTrainBadge({
  scorecard,
  size = "default",
}: {
  scorecard: CompanyScorecard;
  size?: "default" | "lg";
}) {
  const { effectiveWeights } = useScoreSettings();
  const { value } = computeWeightedScore(scorecard, effectiveWeights);
  const verdict = getVerdict(value);
  const sources = (["timing", "territory", "talent"] as const).flatMap(
    (d) => scorecard.dimensions[d].sources
  );

  return (
    <WithSources sources={sources} label="Gravy Train score">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 border px-3 py-1 font-mono-data font-semibold",
          getScoreBg(value),
          getScoreColor(value),
          size === "lg" ? "text-sm" : "text-xs"
        )}
      >
        <Train className={cn(size === "lg" ? "h-4 w-4" : "h-3 w-3")} aria-hidden />
        <span>{value ?? "—"}</span>
        <span className="opacity-70">·</span>
        <span>{verdict}</span>
      </span>
    </WithSources>
  );
}

export function GravyTrainBadgeCompact({
  scorecard,
}: {
  scorecard: CompanyScorecard;
}) {
  const { effectiveWeights } = useScoreSettings();
  const { value } = computeWeightedScore(scorecard, effectiveWeights);
  const verdict = getVerdict(value);
  return (
    <Badge variant={verdictBadgeVariant(verdict)} className="text-[10px]">
      {verdict}
    </Badge>
  );
}
