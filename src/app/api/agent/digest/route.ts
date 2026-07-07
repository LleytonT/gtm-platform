import { NextResponse } from "next/server";
import { buildDigest } from "@/lib/agent/matcher";
import { DEFAULT_PROFILE } from "@/lib/agent/types";
import type { UserProfile } from "@/lib/agent/types";
import type { RoleLens } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const LENSES = new Set<RoleLens>(["all", "ae", "se_fde", "sdr"]);

function sanitizeProfile(body: Record<string, unknown>): UserProfile {
  const profile: UserProfile = { ...DEFAULT_PROFILE };

  if (Array.isArray(body.targetRoles)) {
    const roles = body.targetRoles.filter((r): r is RoleLens =>
      LENSES.has(r as RoleLens)
    );
    if (roles.length > 0) profile.targetRoles = roles;
  }
  if (Array.isArray(body.regions)) {
    profile.regions = body.regions
      .filter((r): r is string => typeof r === "string")
      .slice(0, 5);
  }
  if (
    body.minStage === "any" ||
    body.minStage === "series_b_plus" ||
    body.minStage === "series_d_plus" ||
    body.minStage === "public"
  ) {
    profile.minStage = body.minStage;
  }
  const threshold = Number(body.alertThreshold);
  if (Number.isFinite(threshold) && threshold >= 1 && threshold <= 50) {
    profile.alertThreshold = Math.round(threshold);
  }
  if (body.delivery === "email_digest" || body.delivery === "push") {
    profile.delivery = body.delivery;
  }
  if (typeof body.email === "string" && body.email.includes("@")) {
    profile.email = body.email.trim();
  }

  const weights = body.weights as
    | { timing?: unknown; territory?: unknown; talent?: unknown }
    | undefined;
  if (weights) {
    const timing = Number(weights.timing);
    const territory = Number(weights.territory);
    const talent = Number(weights.talent);
    if (
      [timing, territory, talent].every(
        (w) => Number.isFinite(w) && w >= 0 && w <= 100
      ) &&
      timing + territory + talent > 0
    ) {
      profile.weights = { timing, territory, talent };
    }
  }

  return profile;
}

/**
 * POST /api/agent/digest — preview the free email digest for a profile.
 * The agent watches the signal-change log + ANZ expansion detectors and
 * returns matches above the user's alert threshold. No pay-to-reveal.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // Empty body ⇒ default profile preview.
  }
  const profile = sanitizeProfile(body);
  const digest = buildDigest(profile);
  return NextResponse.json({ profile, digest });
}
