import { NextResponse } from "next/server";
import { refreshJobBoards } from "@/lib/jobs/refresh";

/**
 * Daily job-board refresh (P2.13). Scheduled in vercel.json.
 *
 * Re-polls every tracked Greenhouse/Lever/Ashby board, rewrites the jobs
 * cache, and appends momentum / regional-decline / ANZ-detector entries to
 * the signal-change log. On Vercel the filesystem write is ephemeral — the
 * durable path is the same run executed in CI (npm run scrape:jobs) which
 * commits the refreshed cache; this route exists so the schedule works on
 * self-hosted deployments too.
 */
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshJobBoards();
  return NextResponse.json({
    ok: true,
    cadence: "daily",
    refreshedAt: new Date().toISOString(),
    ...result,
  });
}
