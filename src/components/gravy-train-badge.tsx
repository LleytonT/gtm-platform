import { Badge } from "@/components/ui/badge";
import { GravyTrainVerdict } from "@/lib/types";
import {
  getGravyTrainBadgeVariant,
  getGravyTrainBg,
  getGravyTrainColor,
} from "@/lib/three-ts";
import { cn } from "@/lib/utils";
import { Train } from "lucide-react";

export function GravyTrainBadge({
  score,
  verdict,
  size = "default",
}: {
  score: number;
  verdict: GravyTrainVerdict;
  size?: "default" | "lg";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 border px-3 py-1 font-mono-data font-semibold",
        getGravyTrainBg(score),
        getGravyTrainColor(score),
        size === "lg" ? "text-sm" : "text-xs"
      )}
    >
      <Train className={cn(size === "lg" ? "h-4 w-4" : "h-3 w-3")} />
      <span>{score}</span>
      <span className="opacity-70">·</span>
      <span>{verdict}</span>
    </div>
  );
}

export function GravyTrainBadgeCompact({
  verdict,
}: {
  verdict: GravyTrainVerdict;
}) {
  return (
    <Badge variant={getGravyTrainBadgeVariant(verdict)} className="text-[10px]">
      {verdict}
    </Badge>
  );
}
