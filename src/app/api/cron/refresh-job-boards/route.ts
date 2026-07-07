import { NextResponse } from "next/server";
import { refreshJobBoards } from "@/lib/refresh";

export const dynamic = "force-dynamic";

/**
 * Daily cron (see vercel.json): re-poll every public Greenhouse/Lever/Ashby
 * board, diff derived scores against the previous state, and append
 * explainable entries to the signal-change log.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await refreshJobBoards();
  return NextResponse.json({ ok: true, cadence: "daily", ...result });
}
