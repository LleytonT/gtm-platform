import type { ScoredCompany } from "./scored";
import type { SignalLogEntry } from "./signal-log-types";
import {
  computeComposite,
  type RoleLens,
  type WeightSet,
} from "./scoring/weights";

/**
 * Notification agent (P3.14–15).
 *
 * The agent watches the signal-change log and ANZ expansion detectors and
 * matches entries against a user profile. Everything here is pure and runs
 * identically client-side (digest preview) and in a scheduled worker (email
 * delivery). Free for everyone — no pay-to-reveal.
 */

export type TargetRole = "ae" | "se_fde" | "sdr";
export type TargetRegion = "ANZ" | "APAC" | "AMER" | "EMEA";

export type MinStage =
  | "any"
  | "series_b"
  | "series_c"
  | "series_d"
  | "late_or_public";

export const MIN_STAGE_LABELS: Record<MinStage, string> = {
  any: "Any stage",
  series_b: "Series B+",
  series_c: "Series C+",
  series_d: "Series D+",
  late_or_public: "Late stage / public",
};

export type CompPriority = "equity_upside" | "cash_ote" | "fast_ramp";

export const COMP_PRIORITY_LABELS: Record<CompPriority, string> = {
  equity_upside: "Equity upside",
  cash_ote: "Cash OTE",
  fast_ramp: "Fast ramp",
};

export interface AlertProfile {
  targetRoles: TargetRole[];
  regions: TargetRegion[];
  minStage: MinStage;
  compPriorities: CompPriority[];
  /** Only notify for companies whose composite (user weights) is >= threshold. */
  threshold: number;
  email: string;
}

export const DEFAULT_PROFILE: AlertProfile = {
  targetRoles: ["ae"],
  regions: ["ANZ", "APAC"],
  minStage: "any",
  compPriorities: ["equity_upside"],
  threshold: 60,
  email: "",
};

const STAGE_RANK: Record<MinStage, number> = {
  any: 0,
  series_b: 2,
  series_c: 3,
  series_d: 4,
  late_or_public: 6,
};

/** Rank a free-text stage string ("Series C", "Public (NASDAQ: DDOG)"…). */
export function stageRank(stage: string): number {
  const s = stage.toLowerCase();
  if (/public|ipo|nasdaq|nyse/.test(s)) return 7;
  if (/late/.test(s)) return 6;
  const series = /series\s+([a-i])/.exec(s);
  if (series) return series[1].charCodeAt(0) - 96; // a=1, b=2…
  if (/seed/.test(s)) return 0;
  return 3; // unknown → mid
}

export interface AlertMatch {
  entry: SignalLogEntry;
  company: ScoredCompany;
  composite: number;
  reasons: string[];
}

const MAX_ENTRY_AGE_DAYS = 240;

export function matchAlerts(
  profile: AlertProfile,
  entries: SignalLogEntry[],
  companies: ScoredCompany[],
  weights: WeightSet,
  lens: RoleLens
): AlertMatch[] {
  const bySlug = new Map(companies.map((c) => [c.company.slug, c]));
  const cutoff = Date.now() - MAX_ENTRY_AGE_DAYS * 24 * 60 * 60 * 1000;
  const wantsAnz =
    profile.regions.includes("ANZ") || profile.regions.includes("APAC");
  const matches: AlertMatch[] = [];

  for (const entry of entries) {
    if (Date.parse(entry.date) < cutoff) continue;
    const company = bySlug.get(entry.companySlug);
    if (!company) continue;

    // Composite must be source-backed and above the user's threshold.
    const composite = computeComposite(company.scorecard, weights, lens).value;
    if (composite == null || composite < profile.threshold) continue;

    // Stage gate.
    if (stageRank(company.company.stage) < STAGE_RANK[profile.minStage]) {
      continue;
    }

    const reasons: string[] = [];

    if (entry.type === "anz_detector" || entry.type === "new_region") {
      if (!wantsAnz) continue;
      reasons.push("ANZ expansion detector fired");
    } else if (entry.type === "jobs_change") {
      if (entry.impact === "positive") {
        reasons.push("GTM hiring momentum is accelerating");
      } else {
        reasons.push("Watch signal: hiring pulled back at a tracked company");
      }
    } else if (entry.type === "tracking_started") {
      continue; // administrative, not notification-worthy
    } else {
      reasons.push("New sourced event on a company above your threshold");
    }

    // Role relevance: the company must be hiring in at least one target role.
    const roleMix = company.scorecard.roleMix;
    if (roleMix && profile.targetRoles.length > 0) {
      const hiringTargets = profile.targetRoles.filter(
        (role) => (roleMix[role] ?? 0) > 0
      );
      if (hiringTargets.length === 0) continue;
      reasons.push(
        hiringTargets
          .map(
            (role) =>
              `${roleMix[role]} open ${role === "se_fde" ? "SE/FDE" : role.toUpperCase()} roles`
          )
          .join(", ")
      );
    }

    reasons.push(`Composite ${composite} ≥ your threshold ${profile.threshold}`);

    if (
      profile.compPriorities.includes("equity_upside") &&
      stageRank(company.company.stage) < 7
    ) {
      reasons.push("Pre-public — equity upside matches your comp priority");
    }
    if (profile.compPriorities.includes("fast_ramp")) {
      const territory = company.scorecard.dimensions.territory.value;
      if (territory != null && territory >= 60) {
        reasons.push("Strong territory score suggests faster ramp");
      }
    }

    matches.push({ entry, company, composite, reasons });
  }

  return matches.sort(
    (a, b) => b.composite - a.composite || b.entry.date.localeCompare(a.entry.date)
  );
}
