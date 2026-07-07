import "server-only";

/**
 * Notification agent (Eve-style event watcher).
 *
 * The agent watches two event streams — the signal-change log and the ANZ
 * expansion detectors — and matches events against a user profile. Matches
 * above the user's threshold are compiled into a free email digest
 * (push delivery is the planned follow-up channel).
 */
import { getSignalLog } from "../signal-log";
import { getAnzExpansionSignals } from "../signals/anz-expansion";
import { AgentDigest, AgentMatch, UserProfile } from "./types";
import { ROLE_LENS_META } from "../scoring";
import { getCompanyBySlug } from "../data";

const DIGEST_WINDOW_DAYS = 30;

export function buildDigest(
  profile: UserProfile,
  now = new Date()
): AgentDigest {
  const cutoff = new Date(
    now.getTime() - DIGEST_WINDOW_DAYS * 86_400_000
  ).toISOString();
  const matches: AgentMatch[] = [];

  // Stream 1: score changes above the user's threshold.
  for (const entry of getSignalLog()) {
    if (entry.date < cutoff) continue;
    if (entry.metric === "gravy_train" || entry.metric === "territory") {
      if (entry.before !== null && entry.after !== null) {
        const delta = Math.abs(entry.after - entry.before);
        if (delta >= profile.alertThreshold) {
          matches.push({
            companySlug: entry.companySlug,
            companyName: entry.companyName,
            matchedAt: entry.date,
            kind: "score_change",
            headline: `${entry.companyName}: score moved ${entry.before}→${entry.after}`,
            detail: entry.reason,
          });
        }
      }
    }
  }

  // Stream 2: ANZ expansion detectors (when the user targets ANZ/APAC).
  const wantsAnz = profile.regions.some((r) =>
    ["ANZ", "APAC"].includes(r.toUpperCase())
  );
  if (wantsAnz) {
    for (const signal of getAnzExpansionSignals()) {
      if (signal.detectedAt < cutoff.slice(0, 10)) continue;
      matches.push({
        companySlug: signal.companySlug,
        companyName:
          getCompanyBySlug(signal.companySlug)?.name ?? signal.companySlug,
        matchedAt: signal.detectedAt,
        kind: "anz_expansion",
        headline: signal.headline,
        detail: signal.detail,
      });
    }
  }

  matches.sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));

  const roles = profile.targetRoles
    .map((r) => ROLE_LENS_META[r]?.label ?? r)
    .join(", ");

  return {
    generatedAt: now.toISOString(),
    profileSummary: `Roles: ${roles || "any"} · Regions: ${profile.regions.join(", ") || "any"} · Alert threshold: ±${profile.alertThreshold} pts · Delivery: ${profile.delivery === "email_digest" ? "email digest" : "push"}`,
    matches: matches.slice(0, 20),
  };
}
