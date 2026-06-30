import { companies, getResearchForCompany } from "@/lib/data";
import CompaniesClient from "./companies-client";

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
    <CompaniesClient
      items={items}
      industries={industries}
      regions={regions}
    />
  );
}
