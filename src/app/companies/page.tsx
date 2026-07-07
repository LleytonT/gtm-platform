import { Suspense } from "react";
import { companies, getResearchForCompany } from "@/lib/data";
import { buildScorecard } from "@/lib/scorecards";
import { getAnzExpandingSlugs } from "@/lib/signals/anz-expansion";
import CompaniesClient from "./companies-client";

function CompaniesLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-muted-foreground">Loading companies…</p>
    </div>
  );
}

export default function CompaniesPage() {
  const anzSlugs = getAnzExpandingSlugs();
  const items = companies.map((company) => ({
    company,
    scorecard: buildScorecard(company.slug),
    research: getResearchForCompany(company),
    anzExpanding: anzSlugs.has(company.slug),
  }));

  const industries = [...new Set(companies.map((c) => c.industry))];
  const regions = [
    ...new Set(companies.flatMap((c) => c.expandingRegions ?? [])),
  ];

  return (
    <Suspense fallback={<CompaniesLoading />}>
      <CompaniesClient
        items={items}
        industries={industries}
        regions={regions}
      />
    </Suspense>
  );
}
