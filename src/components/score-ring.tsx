import { cn } from "@/lib/utils";
import { getScoreColor, getScoreLabel } from "@/lib/data";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreRing({ score, label, size = "md" }: ScoreRingProps) {
  const radius = size === "lg" ? 54 : size === "md" ? 40 : 30;
  const stroke = size === "lg" ? 8 : size === "md" ? 6 : 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const viewBox = `0 0 ${radius * 2} ${radius * 2}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width={radius * 2} height={radius * 2} viewBox={viewBox}>
          <circle
            stroke="currentColor"
            className="text-muted/40"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            className={cn(getScoreColor(score))}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-bold",
              size === "lg"
                ? "text-2xl"
                : size === "md"
                  ? "text-lg"
                  : "text-sm",
              getScoreColor(score)
            )}
          >
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-[10px] font-semibold",
          getScoreColor(score)
        )}
      >
        {getScoreLabel(score)}
      </span>
    </div>
  );
}
