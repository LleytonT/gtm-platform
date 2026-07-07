"use client";

/**
 * User-weighted scoring settings, persisted per-user in localStorage.
 *
 * Provides the active weight preset (or custom sliders) and role lens to
 * every component that renders a weighted score.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_WEIGHTS,
  ROLE_LENS_META,
  RoleLens,
  ThreeTWeights,
  WEIGHT_PRESETS,
  WeightPresetId,
  applyRoleLens,
  getPreset,
  normalizeWeights,
} from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

const STORAGE_KEY = "gtmhire:score-settings:v1";

interface StoredSettings {
  presetId: WeightPresetId;
  customWeights: ThreeTWeights;
  lens: RoleLens;
}

interface ScoreSettingsValue {
  presetId: WeightPresetId;
  customWeights: ThreeTWeights;
  lens: RoleLens;
  /** User weights (preset or custom) BEFORE the role lens is applied. */
  userWeights: ThreeTWeights;
  /** Weights actually used for scoring: user weights blended with the lens. */
  effectiveWeights: ThreeTWeights;
  setPresetId: (id: WeightPresetId) => void;
  setCustomWeights: (w: ThreeTWeights) => void;
  setLens: (lens: RoleLens) => void;
}

const ScoreSettingsContext = createContext<ScoreSettingsValue | null>(null);

export function ScoreSettingsProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetIdState] = useState<WeightPresetId>("default");
  const [customWeights, setCustomWeightsState] =
    useState<ThreeTWeights>(DEFAULT_WEIGHTS);
  const [lens, setLensState] = useState<RoleLens>("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as StoredSettings;
      if (stored.presetId) setPresetIdState(stored.presetId);
      if (stored.customWeights) setCustomWeightsState(stored.customWeights);
      if (stored.lens) setLensState(stored.lens);
    } catch {
      // Incognito or corrupted storage — fall back to defaults.
    }
  }, []);

  const persist = useCallback((next: StoredSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const setPresetId = useCallback(
    (id: WeightPresetId) => {
      setPresetIdState(id);
      setCustomWeightsState((weights) => {
        persist({ presetId: id, customWeights: weights, lens });
        return weights;
      });
    },
    [persist, lens]
  );

  const setCustomWeights = useCallback(
    (w: ThreeTWeights) => {
      setCustomWeightsState(w);
      setPresetIdState("custom");
      persist({ presetId: "custom", customWeights: w, lens });
    },
    [persist, lens]
  );

  const setLens = useCallback(
    (nextLens: RoleLens) => {
      setLensState(nextLens);
      setCustomWeightsState((weights) => {
        setPresetIdState((preset) => {
          persist({ presetId: preset, customWeights: weights, lens: nextLens });
          return preset;
        });
        return weights;
      });
    },
    [persist]
  );

  const userWeights = useMemo(
    () =>
      presetId === "custom" ? customWeights : getPreset(presetId).weights,
    [presetId, customWeights]
  );

  const effectiveWeights = useMemo(
    () => applyRoleLens(userWeights, lens),
    [userWeights, lens]
  );

  const value = useMemo(
    () => ({
      presetId,
      customWeights,
      lens,
      userWeights,
      effectiveWeights,
      setPresetId,
      setCustomWeights,
      setLens,
    }),
    [
      presetId,
      customWeights,
      lens,
      userWeights,
      effectiveWeights,
      setPresetId,
      setCustomWeights,
      setLens,
    ]
  );

  return (
    <ScoreSettingsContext.Provider value={value}>
      {children}
    </ScoreSettingsContext.Provider>
  );
}

export function useScoreSettings(): ScoreSettingsValue {
  const ctx = useContext(ScoreSettingsContext);
  if (!ctx) {
    throw new Error(
      "useScoreSettings must be used within a ScoreSettingsProvider"
    );
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

const DIM_LABELS = [
  { key: "timing", label: "Timing" },
  { key: "territory", label: "Territory" },
  { key: "talent", label: "Talent" },
] as const;

export function WeightControls({ className }: { className?: string }) {
  const {
    presetId,
    customWeights,
    userWeights,
    setPresetId,
    setCustomWeights,
  } = useScoreSettings();
  const normalized = normalizeWeights(userWeights);

  return (
    <div className={cn("border border-rule bg-card p-4", className)}>
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-gravy" aria-hidden />
        <p className="font-mono-data text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Your scoring weights
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Weight presets">
        {WEIGHT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setPresetId(preset.id)}
            aria-pressed={presetId === preset.id}
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

      <div className="mt-4 space-y-3">
        {DIM_LABELS.map(({ key, label }) => {
          const raw =
            presetId === "custom" ? customWeights[key] : userWeights[key];
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor={`weight-${key}`} className="font-medium">
                  {label}
                </label>
                <span className="font-mono-data tabular-nums text-muted-foreground">
                  {Math.round(normalized[key])}%
                </span>
              </div>
              <input
                id={`weight-${key}`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={raw}
                onChange={(e) =>
                  setCustomWeights({
                    ...(presetId === "custom" ? customWeights : userWeights),
                    [key]: Number(e.target.value),
                  })
                }
                className="mt-1 h-1.5 w-full cursor-pointer appearance-none bg-muted accent-[var(--gravy,#b8860b)]"
                aria-label={`${label} weight`}
              />
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Weights are normalized to 100% and saved in your browser. They change
        the Gravy Train composite only — the underlying sourced metrics never
        move.
      </p>
    </div>
  );
}

export function RoleLensTabs({ className }: { className?: string }) {
  const { lens, setLens } = useScoreSettings();
  const lenses: RoleLens[] = ["all", "ae", "se_fde", "sdr"];

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label="Role lens"
    >
      <span className="mr-1 text-xs text-muted-foreground">Role lens:</span>
      {lenses.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => setLens(id)}
          aria-pressed={lens === id}
          title={ROLE_LENS_META[id].description}
          className={cn(
            "focus-ring border px-2.5 py-1 text-xs font-medium transition-colors",
            lens === id
              ? "border-gravy bg-gravy/15 text-brief"
              : "border-rule bg-background text-muted-foreground hover:bg-accent"
          )}
        >
          {ROLE_LENS_META[id].label}
        </button>
      ))}
    </div>
  );
}
