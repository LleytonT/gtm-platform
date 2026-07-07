"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { WeightsPanel } from "@/components/weights-panel";
import { useWeights } from "@/components/weights-provider";
import {
  COMP_PRIORITY_LABELS,
  DEFAULT_PROFILE,
  MIN_STAGE_LABELS,
  matchAlerts,
  type AlertProfile,
  type CompPriority,
  type MinStage,
  type TargetRegion,
  type TargetRole,
} from "@/lib/alerts";
import type { ScoredCompany } from "@/lib/scored";
import type { SignalLogEntry } from "@/lib/signal-log-types";
import { cn } from "@/lib/utils";
import { BellRing, Mail } from "lucide-react";

const STORAGE_KEY = "gtmhire:alert-profile:v1";

const ROLE_OPTIONS: [TargetRole, string][] = [
  ["ae", "AE"],
  ["se_fde", "SE / FDE"],
  ["sdr", "SDR"],
];

const REGION_OPTIONS: TargetRegion[] = ["ANZ", "APAC", "AMER", "EMEA"];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function AlertsClient({
  items,
  entries,
}: {
  items: ScoredCompany[];
  entries: SignalLogEntry[];
}) {
  const { weights, lens } = useWeights();
  const [profile, setProfile] = useState<AlertProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
    } catch {
      // Ignore corrupt/unavailable storage.
    }
  }, []);

  function update(next: Partial<AlertProfile>) {
    setProfile((current) => {
      const merged = { ...current, ...next };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    });
    setSaved(true);
  }

  const matches = useMemo(
    () => matchAlerts(profile, entries, items, weights, lens),
    [profile, entries, items, weights, lens]
  );

  const digestDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      {/* Profile */}
      <div className="space-y-6">
        <div className="border border-rule bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <BellRing className="h-4 w-4 text-gravy" aria-hidden />
            Your alert profile
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Saved on this device{saved ? " · saved ✓" : ""}. The agent watches
            the signal-change log and ANZ detectors, and notifies on matches
            above your threshold.
          </p>

          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Target roles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_OPTIONS.map(([role, label]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() =>
                    update({ targetRoles: toggle(profile.targetRoles, role) })
                  }
                  aria-pressed={profile.targetRoles.includes(role)}
                  className={cn(
                    "focus-ring border px-2.5 py-1 text-xs font-medium transition-colors",
                    profile.targetRoles.includes(role)
                      ? "border-brief bg-brief text-primary-foreground"
                      : "border-rule bg-background text-muted-foreground hover:bg-accent"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Regions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REGION_OPTIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() =>
                    update({ regions: toggle(profile.regions, region) })
                  }
                  aria-pressed={profile.regions.includes(region)}
                  className={cn(
                    "focus-ring border px-2.5 py-1 text-xs font-medium transition-colors",
                    profile.regions.includes(region)
                      ? "border-gravy bg-gravy/15 text-brief"
                      : "border-rule bg-background text-muted-foreground hover:bg-accent"
                  )}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="alert-stage" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Minimum stage
            </Label>
            <Select
              value={profile.minStage}
              onValueChange={(v) => update({ minStage: (v ?? "any") as MinStage })}
            >
              <SelectTrigger id="alert-stage" className="mt-1.5 w-full border-rule">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MIN_STAGE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Comp priorities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                Object.entries(COMP_PRIORITY_LABELS) as [CompPriority, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    update({
                      compPriorities: toggle(profile.compPriorities, value),
                    })
                  }
                  aria-pressed={profile.compPriorities.includes(value)}
                  className={cn(
                    "focus-ring border px-2.5 py-1 text-xs font-medium transition-colors",
                    profile.compPriorities.includes(value)
                      ? "border-brief bg-brief text-primary-foreground"
                      : "border-rule bg-background text-muted-foreground hover:bg-accent"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium uppercase tracking-wider text-muted-foreground">
                Notify threshold (composite)
              </span>
              <span className="font-mono-data">{profile.threshold}</span>
            </div>
            <Slider
              value={profile.threshold}
              min={0}
              max={95}
              step={5}
              aria-label="Notification threshold"
              onValueChange={(value) => {
                const v = Array.isArray(value) ? value[0] : value;
                update({ threshold: v as number });
              }}
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="alert-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email for digests
            </Label>
            <Input
              id="alert-email"
              type="email"
              className="mt-1.5 border-rule"
              placeholder="you@anywhere.com"
              value={profile.email}
              onChange={(e) => update({ email: e.target.value })}
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Free — no pay-to-reveal, ever. Email digest first; push
              notifications next.
            </p>
          </div>
        </div>

        <WeightsPanel />
      </div>

      {/* Digest preview */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Email digest preview
            </h2>
            <p className="text-xs text-muted-foreground">
              Rendered live from the current signal-change log with your
              profile, weights, and role lens applied.
            </p>
          </div>
          <span className="font-mono-data text-xs text-muted-foreground">
            {matches.length} match{matches.length === 1 ? "" : "es"}
          </span>
        </div>

        <div className="border border-rule bg-card">
          <div className="hairline-b flex items-center gap-3 bg-muted/30 px-5 py-4">
            <Mail className="h-4 w-4 text-gravy" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Your GTM signals digest — {digestDate}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                To: {profile.email || "you@anywhere.com"} · From: GTM Hire
                Agent &lt;signals@gtmhire.example&gt;
              </p>
            </div>
          </div>

          {matches.length > 0 ? (
            <ul className="divide-y divide-rule">
              {matches.slice(0, 8).map(({ entry, company, composite, reasons }) => (
                <li key={entry.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Link
                      href={`/companies/${company.company.slug}`}
                      className="focus-ring font-display font-semibold hover:text-brief hover:underline"
                    >
                      {company.company.name}
                    </Link>
                    <span className="font-mono-data text-xs text-muted-foreground">
                      composite {composite} · {entry.date.slice(0, 10)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{entry.headline}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {entry.detail}
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {reasons.map((reason) => (
                      <li key={reason} className="text-xs text-muted-foreground">
                        <span className="text-gravy" aria-hidden>
                          →{" "}
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium">No matches right now</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Lower your threshold, widen your regions, or add roles. The
                agent re-evaluates after every daily job-board refresh and
                weekly news audit.
              </p>
            </div>
          )}

          <div className="hairline-b border-t px-5 py-3 text-[11px] text-muted-foreground">
            You receive this digest because your profile matched entries in
            the public signal-change log. Every signal carries source records
            — see{" "}
            <Link href="/methodology" className="underline">
              methodology
            </Link>
            . Unsubscribe anytime. Free forever — no pay-to-reveal.
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button disabled title="Email delivery ships with the hosted agent">
            Enable email delivery (coming soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
