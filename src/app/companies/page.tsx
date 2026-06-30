import { Suspense } from "react";
import { companies, getResearchForCompany } from "@/lib/data";
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
  const items = companies.map((company) => ({
    company,
    research: getResearchForCompany(company),
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
