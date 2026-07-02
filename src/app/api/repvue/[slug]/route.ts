import { NextResponse } from "next/server";
import { getCachedRepvueProfile } from "@/lib/scrapers/repvue/cache";
import { fetchRepvueProfile } from "@/lib/scrapers/repvue/fetch";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const cached = getCachedRepvueProfile(slug);

  if (cached) {
    return NextResponse.json({
      source: "cache",
      profile: cached,
    });
  }

  const result = await fetchRepvueProfile(slug);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.message,
        triedSlugs: result.triedSlugs,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    source: "live",
    profile: result.profile,
  });
}
