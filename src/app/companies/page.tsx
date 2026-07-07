import { Suspense } from "react";
import { getScoredCompanies } from "@/lib/scored";
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
  const items = getScoredCompanies();
  const industries = [...new Set(items.map((i) => i.company.industry))];

  return (
    <Suspense fallback={<CompaniesLoading />}>
      <CompaniesClient items={items} industries={industries} />
    </Suspense>
  );
}
