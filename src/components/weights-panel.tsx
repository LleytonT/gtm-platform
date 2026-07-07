"use client";

import { Slider } from "@/components/ui/slider";
import { useWeights } from "@/components/weights-provider";
import {
  ROLE_LENS_LABELS,
  WEIGHT_PRESETS,
  normalizeWeights,
  type RoleLens,
} from "@/lib/scoring/weights";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

const LENSES: RoleLens[] = ["all", "ae", "se_fde", "sdr"];

export function WeightsPanel({ className }: { className?: string }) {
  const { presetId, weights, lens, setPreset, setCustomWeights, setLens } =
    useWeights();

  const normalized = normalizeWeights(weights);
  const pct = {
    timing: Math.round(normalized.timing * 100),
    territory: Math.round(normalized.territory * 100),
    talent: Math.round(normalized.talent * 100),
  };

  return (
    <div className={cn("border border-rule bg-card p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gravy" aria-hidden />
          Your scoring weights
        </p>
        <p className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
          Timing {pct.timing} / Territory {pct.territory} / Talent {pct.talent}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {WEIGHT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setPreset(preset.id)}
            title={preset.description}
            className={cn(
              "focus-ring border px-2.5 py-1 text-xs font-medium transition-colors",
              presetId === preset.id
                ? "border-brief bg-brief text-primary-foreground"
                : "border-rule bg-background text-muted-foreground hover:bg-accent"
            )}
          >
            {preset.label}
          </button>
        ))}
        <span
          className={cn(
            "border px-2.5 py-1 text-xs font-medium",
            presetId === "custom"
              ? "border-brief bg-brief text-primary-foreground"
              : "border-dashed border-rule text-muted-foreground"
          )}
        >
          Custom
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {(
          [
            ["timing", "Timing"],
            ["territory", "Territory"],
            ["talent", "Talent"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium">{label}</span>
              <span className="font-mono-data text-muted-foreground">
                {weights[key]}
              </span>
            </div>
            <Slider
              value={weights[key]}
              min={0}
              max={100}
              step={5}
              aria-label={`${label} weight`}
              onValueChange={(value) => {
                const v = Array.isArray(value) ? value[0] : value;
                setCustomWeights({ ...weights, [key]: v as number });
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-rule pt-3">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Role lens — re-ranks by hiring investment in your role
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LENSES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLens(l)}
              aria-pressed={lens === l}
              className={cn(
                "focus-ring border px-2.5 py-1 text-xs font-medium transition-colors",
                lens === l
                  ? "border-gravy bg-gravy/15 text-brief"
                  : "border-rule bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              {ROLE_LENS_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[10px] text-muted-foreground">
        Weights persist on this device. Composite scores only render when all
        three dimensions have source-backed data — see{" "}
        <a href="/methodology" className="underline">
          methodology
        </a>
        .
      </p>
    </div>
  );
}
