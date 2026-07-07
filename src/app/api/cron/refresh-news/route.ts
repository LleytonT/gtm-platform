import { NextResponse } from "next/server";
import { companyEvents } from "@/lib/events";
import { companies } from "@/lib/data";

/**
 * Weekly funding/news freshness audit (P2.13). Scheduled in vercel.json.
 *
 * Funding and news events are curated with source records rather than
 * auto-scraped, so the weekly cron audits freshness instead of fabricating
 * entries: it reports companies whose newest curated event is stale (or
 * missing) so the analyst refresh queue is always explicit. The public feed
 * itself is already gated to fresh entries via getFreshEvents().
 */
const STALE_MONTHS = 10;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = Date.now() - STALE_MONTHS * 30.44 * 24 * 60 * 60 * 1000;
  const newestBySlug = new Map<string, string>();
  for (const event of companyEvents) {
    const current = newestBySlug.get(event.companySlug);
    if (!current || event.date > current) {
      newestBySlug.set(event.companySlug, event.date);
    }
  }

  const staleCompanies: { slug: string; newestEvent: string | null }[] = [];
  for (const company of companies) {
    const newest = newestBySlug.get(company.slug) ?? null;
    if (!newest || Date.parse(newest) < cutoff) {
      staleCompanies.push({ slug: company.slug, newestEvent: newest });
    }
  }

  return NextResponse.json({
    ok: true,
    cadence: "weekly",
    auditedAt: new Date().toISOString(),
    curatedEvents: companyEvents.length,
    staleThresholdMonths: STALE_MONTHS,
    companiesNeedingRefresh: staleCompanies,
  });
}
