import { NextResponse } from "next/server";
import { getCachedExaSignals } from "@/lib/scrapers/exa/cache";
import { fetchExaCompanySignals } from "@/lib/scrapers/exa/fetch";
import { getCompanyBySlug } from "@/lib/data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const cached = getCachedExaSignals(slug);

  if (cached) {
    return NextResponse.json({ source: "cache", signals: cached });
  }

  const company = getCompanyBySlug(slug);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  if (!process.env.EXA_API_KEY) {
    return NextResponse.json(
      { error: "EXA_API_KEY is not configured" },
      { status: 503 }
    );
  }

  try {
    const signals = await fetchExaCompanySignals(slug, company.name);
    return NextResponse.json({ source: "live", signals });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Exa fetch failed",
      },
      { status: 502 }
    );
  }
}
