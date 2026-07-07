"use client";

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
  WEIGHT_PRESETS,
  type RoleLens,
  type WeightPresetId,
  type WeightSet,
} from "@/lib/scoring/weights";

const STORAGE_KEY = "gtmhire:weights:v1";

interface StoredWeights {
  presetId: WeightPresetId;
  custom: WeightSet;
  lens: RoleLens;
}

interface WeightsContextValue {
  presetId: WeightPresetId;
  weights: WeightSet;
  lens: RoleLens;
  setPreset: (id: WeightPresetId) => void;
  setCustomWeights: (weights: WeightSet) => void;
  setLens: (lens: RoleLens) => void;
}

const WeightsContext = createContext<WeightsContextValue | null>(null);

function loadStored(): StoredWeights | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredWeights) : null;
  } catch {
    return null;
  }
}

export function WeightsProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetId] = useState<WeightPresetId>("default");
  const [custom, setCustom] = useState<WeightSet>(DEFAULT_WEIGHTS);
  const [lens, setLensState] = useState<RoleLens>("all");

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setPresetId(stored.presetId);
      setCustom(stored.custom);
      setLensState(stored.lens);
    }
  }, []);

  const persist = useCallback(
    (next: Partial<StoredWeights>) => {
      try {
        const current: StoredWeights = { presetId, custom, lens, ...next };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } catch {
        // Private browsing / quota — weights just won't persist.
      }
    },
    [presetId, custom, lens]
  );

  const setPreset = useCallback(
    (id: WeightPresetId) => {
      setPresetId(id);
      persist({ presetId: id });
    },
    [persist]
  );

  const setCustomWeights = useCallback(
    (weights: WeightSet) => {
      setPresetId("custom");
      setCustom(weights);
      persist({ presetId: "custom", custom: weights });
    },
    [persist]
  );

  const setLens = useCallback(
    (next: RoleLens) => {
      setLensState(next);
      persist({ lens: next });
    },
    [persist]
  );

  const weights = useMemo<WeightSet>(() => {
    if (presetId === "custom") return custom;
    return (
      WEIGHT_PRESETS.find((p) => p.id === presetId)?.weights ?? DEFAULT_WEIGHTS
    );
  }, [presetId, custom]);

  const value = useMemo(
    () => ({ presetId, weights, lens, setPreset, setCustomWeights, setLens }),
    [presetId, weights, lens, setPreset, setCustomWeights, setLens]
  );

  return (
    <WeightsContext.Provider value={value}>{children}</WeightsContext.Provider>
  );
}

export function useWeights(): WeightsContextValue {
  const ctx = useContext(WeightsContext);
  if (!ctx) {
    throw new Error("useWeights must be used inside WeightsProvider");
  }
  return ctx;
}
