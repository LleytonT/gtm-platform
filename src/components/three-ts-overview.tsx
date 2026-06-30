import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "@/components/score-ring";
import { ThreeTs } from "@/lib/types";
import { THREE_T_META, THREE_T_ORDER } from "@/lib/three-ts";
import { Clock, Map, Users } from "lucide-react";

const ICONS = {
  clock: Clock,
  map: Map,
  users: Users,
} as const;

export function ThreeTsOverview({
  threeTs,
  size = "md",
}: {
  threeTs: ThreeTs;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={
        size === "sm"
          ? "flex gap-3"
          : "grid gap-4 sm:grid-cols-3"
      }
    >
      {THREE_T_ORDER.map((key) => {
        const dimension = threeTs[key];
        const meta = THREE_T_META[key];
        const Icon = ICONS[meta.icon];

        if (size === "sm") {
          return (
            <ScoreRing
              key={key}
              score={dimension.score}
              label={meta.label}
              size="sm"
            />
          );
        }

        return (
          <Card key={key} className="border-dashed">
            <CardContent className="flex flex-col items-center pt-6 text-center">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {meta.order}
                </span>
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </div>
              <ScoreRing
                score={dimension.score}
                label=""
                size={size === "lg" ? "lg" : "md"}
              />
              <p className="mt-3 text-xs font-medium leading-snug text-foreground">
                {dimension.verdict}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
