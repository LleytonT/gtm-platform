import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { appendSubmission, readSubmissions } from "@/lib/submissions/store";
import {
  MIN_AGGREGATE_N,
  type AttainmentBand,
  type Submission,
  type SubmissionRole,
} from "@/lib/submissions/types";
import { getCompanyBySlug } from "@/lib/data";
import type { RepCompModel } from "@/lib/pricing";

const ATTAINMENT_BANDS: AttainmentBand[] = [
  "under_50",
  "50_75",
  "75_100",
  "over_100",
];
const ROLES: SubmissionRole[] = ["ae", "se_fde", "sdr", "cs", "other"];
const COMP_MODELS: RepCompModel[] = [
  "booking",
  "consumption",
  "hybrid",
  "unknown",
];

/** Free-mail domains don't verify employment — reject them for email verification. */
const FREE_MAIL = new Set([
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]);

const INVITE_CODES = new Set(
  (process.env.SUBMISSION_INVITE_CODES ?? "GTM-EARLY-2026")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean)
);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const company = String(body.company ?? "");
  const region = String(body.region ?? "").toUpperCase();
  const role = String(body.role ?? "") as SubmissionRole;
  const oteBaseSplit = String(body.ote_base_split ?? "").trim();
  const attainmentBand = String(body.attainment_band ?? "") as AttainmentBand;
  const rampMonths = Number(body.ramp_months);
  const compModel = String(body.comp_model ?? "unknown") as RepCompModel;
  const freeText = String(body.free_text ?? "").slice(0, 2000);
  const workEmail = typeof body.work_email === "string" ? body.work_email.trim() : "";
  const inviteCode = typeof body.invite_code === "string" ? body.invite_code.trim() : "";

  if (!getCompanyBySlug(company)) {
    return NextResponse.json({ error: "Unknown company" }, { status: 400 });
  }
  if (!/^[A-Z]{2,3}$/.test(region)) {
    return NextResponse.json(
      { error: "Region must be a 2–3 letter code (AU, NZ, US, UK, SG…)" },
      { status: 400 }
    );
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (!oteBaseSplit) {
    return NextResponse.json(
      { error: "OTE / base split is required" },
      { status: 400 }
    );
  }
  if (!ATTAINMENT_BANDS.includes(attainmentBand)) {
    return NextResponse.json(
      { error: "Invalid attainment band" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(rampMonths) || rampMonths < 0 || rampMonths > 36) {
    return NextResponse.json(
      { error: "Ramp months must be between 0 and 36" },
      { status: 400 }
    );
  }
  if (!COMP_MODELS.includes(compModel)) {
    return NextResponse.json({ error: "Invalid comp model" }, { status: 400 });
  }

  // Lightweight verification: SHA-256 of a work email (we never store the
  // address itself) OR a valid invite code.
  let workEmailHash: string | null = null;
  let inviteCodeUsed = false;
  if (workEmail) {
    const match = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(workEmail.toLowerCase());
    if (!match) {
      return NextResponse.json(
        { error: "Work email is not a valid address" },
        { status: 400 }
      );
    }
    if (FREE_MAIL.has(match[1])) {
      return NextResponse.json(
        { error: "Please use a work email (free-mail domains can't verify employment) or an invite code" },
        { status: 400 }
      );
    }
    workEmailHash = createHash("sha256")
      .update(workEmail.toLowerCase())
      .digest("hex");
  } else if (inviteCode) {
    if (!INVITE_CODES.has(inviteCode)) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
    }
    inviteCodeUsed = true;
  } else {
    return NextResponse.json(
      { error: "Verification required: work email or invite code" },
      { status: 400 }
    );
  }

  // One submission per verified email per company-region.
  const existing = await readSubmissions();
  if (
    workEmailHash &&
    existing.some(
      (s) =>
        s.work_email_hash === workEmailHash &&
        s.company === company &&
        s.region === region
    )
  ) {
    return NextResponse.json(
      { error: "A submission from this email already exists for this company and region" },
      { status: 409 }
    );
  }

  const submission: Submission = {
    id: randomUUID(),
    company,
    region,
    role,
    ote_base_split: oteBaseSplit,
    attainment_band: attainmentBand,
    ramp_months: Math.round(rampMonths),
    comp_model: compModel,
    free_text: freeText,
    work_email_hash: workEmailHash,
    invite_code_used: inviteCodeUsed,
    verified: true,
    submitted_at: new Date().toISOString(),
    sample: false,
  };

  try {
    await appendSubmission(submission);
  } catch {
    return NextResponse.json(
      { error: "Could not persist submission (read-only filesystem?)" },
      { status: 503 }
    );
  }

  const cohortN =
    existing.filter(
      (s) => s.verified && s.company === company && s.region === region
    ).length + 1;

  return NextResponse.json({
    ok: true,
    cohortN,
    willRender: cohortN >= MIN_AGGREGATE_N,
    minAggregateN: MIN_AGGREGATE_N,
    message:
      cohortN >= MIN_AGGREGATE_N
        ? "Thanks — your cohort has enough submissions to render aggregates."
        : `Thanks — aggregates render once ${MIN_AGGREGATE_N}+ verified submissions exist for this company-region (currently ${cohortN}).`,
  });
}
