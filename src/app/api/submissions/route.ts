import { NextResponse } from "next/server";
import {
  appendSubmission,
  readSubmissions,
  verifySubmitter,
} from "@/lib/community/store";
import {
  aggregateSubmissions,
  getAggregatesForCompany,
} from "@/lib/community/aggregate";
import {
  AttainmentBand,
  MIN_SAMPLE_SIZE,
  SubmissionRegion,
  SubmissionRole,
} from "@/lib/community/types";
import { RepCompModel } from "@/lib/pricing-models";
import { getCompanyBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

const REGIONS = new Set<SubmissionRegion>([
  "ANZ",
  "APAC",
  "AMER",
  "EMEA",
  "LATAM",
]);
const ROLES = new Set<SubmissionRole>([
  "AE",
  "SE",
  "FDE",
  "SDR",
  "CS",
  "Other GTM",
]);
const ATTAINMENT_BANDS = new Set<AttainmentBand>([
  "under_40",
  "40_70",
  "70_100",
  "over_100",
]);
const COMP_MODELS = new Set<Exclude<RepCompModel, "unknown">>([
  "booking",
  "consumption",
  "hybrid",
]);

/**
 * GET /api/submissions?company=slug — aggregates only, never raw rows.
 * Aggregates are withheld until n >= MIN_SAMPLE_SIZE per company-region.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company");
  const aggregates = aggregateSubmissions(readSubmissions());
  return NextResponse.json({
    minSampleSize: MIN_SAMPLE_SIZE,
    aggregates: company
      ? getAggregatesForCompany(aggregates, company)
      : aggregates,
  });
}

/** POST /api/submissions — structured anonymous submission (Levels.fyi model). */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const companySlug = String(body.companySlug ?? "");
  if (!getCompanyBySlug(companySlug)) {
    return NextResponse.json({ error: "Unknown company." }, { status: 400 });
  }

  const region = body.region as SubmissionRegion;
  if (!REGIONS.has(region)) {
    return NextResponse.json({ error: "Invalid region." }, { status: 400 });
  }

  const role = body.role as SubmissionRole;
  if (!ROLES.has(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const oteUsd = Number(body.oteUsd);
  const baseUsd = Number(body.baseUsd);
  if (
    !Number.isFinite(oteUsd) ||
    !Number.isFinite(baseUsd) ||
    oteUsd < 20_000 ||
    oteUsd > 2_000_000 ||
    baseUsd < 10_000 ||
    baseUsd > oteUsd
  ) {
    return NextResponse.json(
      { error: "OTE/base out of range (base must not exceed OTE)." },
      { status: 400 }
    );
  }

  const attainmentBand = body.attainmentBand as AttainmentBand;
  if (!ATTAINMENT_BANDS.has(attainmentBand)) {
    return NextResponse.json(
      { error: "Invalid attainment band." },
      { status: 400 }
    );
  }

  const rampMonths = Number(body.rampMonths);
  if (!Number.isFinite(rampMonths) || rampMonths < 0 || rampMonths > 24) {
    return NextResponse.json(
      { error: "Ramp months must be between 0 and 24." },
      { status: 400 }
    );
  }

  const compModel = body.compModel as Exclude<RepCompModel, "unknown">;
  if (!COMP_MODELS.has(compModel)) {
    return NextResponse.json(
      { error: "Invalid comp model." },
      { status: 400 }
    );
  }

  const verified = verifySubmitter({
    workEmail: typeof body.workEmail === "string" ? body.workEmail : undefined,
    inviteCode:
      typeof body.inviteCode === "string" ? body.inviteCode : undefined,
  });
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }

  const record = appendSubmission({
    companySlug,
    region,
    role,
    oteUsd: Math.round(oteUsd),
    baseUsd: Math.round(baseUsd),
    attainmentBand,
    rampMonths: Math.round(rampMonths * 10) / 10,
    compModel,
    freeText: String(body.freeText ?? "").slice(0, 2000),
    verification: verified.verification,
  });

  return NextResponse.json({
    ok: true,
    id: record.id,
    message: `Thanks — your submission is in. Aggregates for this company-region appear once ${MIN_SAMPLE_SIZE}+ verified submissions exist.`,
  });
}
