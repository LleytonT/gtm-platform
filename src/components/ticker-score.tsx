import { cn } from "@/lib/utils";

export function TickerScore({
  label,
  score,
  suffix,
  className,
}: {
  label: string;
  score: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono-data border border-rule bg-card/80 px-3 py-2",
        className
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {score}
        {suffix && (
          <span className="text-sm font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
