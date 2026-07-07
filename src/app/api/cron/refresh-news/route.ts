import { NextResponse } from "next/server";
import { refreshFundingAndNews } from "@/lib/refresh";

export const dynamic = "force-dynamic";

/**
 * Weekly cron (see vercel.json): recompute funding/news-driven scores
 * (funding recency decays over time) and log material movements to the
 * signal-change log.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = refreshFundingAndNews();
  return NextResponse.json({ ok: true, cadence: "weekly", ...result });
}
