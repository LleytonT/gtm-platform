"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PROFILE, type UserProfile } from "@/lib/agent/types";
import type { AgentDigest } from "@/lib/agent/types";
import { ROLE_LENS_META, type RoleLens } from "@/lib/scoring";
import { useScoreSettings } from "@/components/score-settings";
import { cn } from "@/lib/utils";
import { BellRing, MapPin, TrendingUp } from "lucide-react";

const STORAGE_KEY = "gtmhire:agent-profile:v1";

const ROLE_OPTIONS: RoleLens[] = ["ae", "se_fde", "sdr"];
const REGION_OPTIONS = ["ANZ", "APAC", "AMER", "EMEA", "LATAM"];
const STAGE_LABELS: Record<UserProfile["minStage"], string> = {
  any: "Any stage",
  series_b_plus: "Series B+",
  series_d_plus: "Series D+",
  public: "Public only",
};
const COMP_PRIORITY_LABELS: Record<
  UserProfile["compPriorities"][number],
  string
> = {
  equity: "Equity upside",
  base: "High base",
  ote: "Total OTE",
  ramp: "Fast ramp",
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function AgentClient() {
  const { userWeights } = useScoreSettings();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [digest, setDigest] = useState<AgentDigest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
    } catch {
      // Incognito or corrupted storage — keep defaults.
    }
  }, []);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  async function previewDigest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Score weights come from the shared score-settings context so the
        // digest matches what the user sees everywhere else on the site.
        body: JSON.stringify({ ...profile, weights: userWeights }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not build the digest.");
        return;
      }
      setDigest(data.digest);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      {/* Profile editor */}
      <div className="space-y-5 border border-rule bg-card p-5">
        <p className="font-mono-data text-[10px] uppercase tracking-widest text-gravy">
          Your profile (saved in this browser)
        </p>

        <div className="space-y-1.5">
          <Label>Target roles</Label>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((lens) => {
              const active = profile.targetRoles.includes(lens);
              return (
                <button
                  key={lens}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    update({ targetRoles: toggle(profile.targetRoles, lens) })
                  }
                  className={cn(
                    "focus-ring px-3 py-1.5 text-xs font-medium",
                    active
                      ? "bg-brief text-primary-foreground"
                      : "border border-rule text-muted-foreground hover:bg-accent"
                  )}
                >
                  {ROLE_LENS_META[lens].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Regions</Label>
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map((region) => {
              const active = profile.regions.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    update({ regions: toggle(profile.regions, region) })
                  }
                  className={cn(
                    "focus-ring px-3 py-1.5 text-xs font-medium",
                    active
                      ? "bg-brief text-primary-foreground"
                      : "border border-rule text-muted-foreground hover:bg-accent"
                  )}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="min-stage">Minimum stage</Label>
          <Select
            value={profile.minStage}
            onValueChange={(v) =>
              v && update({ minStage: v as UserProfile["minStage"] })
            }
          >
            <SelectTrigger id="min-stage" className="w-full border-rule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(STAGE_LABELS) as [
                  UserProfile["minStage"],
                  string,
                ][]
              ).map(([stage, label]) => (
                <SelectItem key={stage} value={stage}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Comp priorities</Label>
          <div className="flex flex-wrap gap-2">
            {(
              Object.entries(COMP_PRIORITY_LABELS) as [
                UserProfile["compPriorities"][number],
                string,
              ][]
            ).map(([priority, label]) => {
              const active = profile.compPriorities.includes(priority);
              return (
                <button
                  key={priority}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    update({
                      compPriorities: toggle(profile.compPriorities, priority),
                    })
                  }
                  className={cn(
                    "focus-ring px-3 py-1.5 text-xs font-medium",
                    active
                      ? "bg-brief text-primary-foreground"
                      : "border border-rule text-muted-foreground hover:bg-accent"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="threshold">
            Alert threshold: ±{profile.alertThreshold} points
          </Label>
          <input
            id="threshold"
            type="range"
            min={1}
            max={25}
            step={1}
            value={profile.alertThreshold}
            onChange={(e) =>
              update({ alertThreshold: Number(e.target.value) })
            }
            className="w-full accent-[var(--gravy,#b45309)]"
          />
          <p className="text-[11px] text-muted-foreground">
            Only score movements of at least this many points trigger an alert.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="agent-email">Email for the digest</Label>
          <Input
            id="agent-email"
            type="email"
            placeholder="you@anywhere.com"
            value={profile.email ?? ""}
            onChange={(e) => update({ email: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">
            Email digest first; push delivery is the planned follow-up channel.
            Alerts are free — no pay-to-reveal.
          </p>
        </div>

        <Button onClick={previewDigest} disabled={loading} className="w-full">
          <BellRing className="mr-2 h-4 w-4" aria-hidden />
          {loading ? "Building digest…" : "Preview my digest"}
        </Button>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* Digest preview */}
      <div>
        {digest === null ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center border border-dashed border-rule bg-card p-8 text-center">
            <BellRing
              className="h-8 w-8 text-muted-foreground/40"
              aria-hidden
            />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Set your profile and preview the digest — you&apos;ll see exactly
              what the agent would email you for the last 30 days of signals.
            </p>
          </div>
        ) : (
          <div className="border border-rule bg-card">
            <div className="hairline-b p-4">
              <p className="font-mono-data text-[10px] uppercase tracking-widest text-gravy">
                Digest preview — last 30 days
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {digest.profileSummary}
              </p>
            </div>
            {digest.matches.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No matches above your threshold in the last 30 days. Lower the
                threshold or widen your regions to see more.
              </p>
            ) : (
              <ol className="divide-y divide-rule">
                {digest.matches.map((match) => {
                  const Icon =
                    match.kind === "anz_expansion" ? MapPin : TrendingUp;
                  return (
                    <li
                      key={`${match.companySlug}-${match.matchedAt}-${match.kind}`}
                      className="flex items-start gap-3 p-4"
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          match.kind === "anz_expansion"
                            ? "text-signal"
                            : "text-gravy"
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/companies/${match.companySlug}`}
                            className="focus-ring text-sm font-semibold hover:underline"
                          >
                            {match.headline}
                          </Link>
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase"
                          >
                            {match.kind === "anz_expansion"
                              ? "ANZ expansion"
                              : "score change"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {match.detail}
                        </p>
                        <p className="mt-1 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                          {match.matchedAt.slice(0, 10)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
