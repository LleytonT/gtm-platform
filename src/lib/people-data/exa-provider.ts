import { getCachedExaSignals } from "../scrapers/exa/cache";
import type { PeopleDataProvider, PeopleSignals } from "./provider";
import {
  coresignalProvider,
  harmonicProvider,
  liveDataProvider,
  peopleDataLabsProvider,
} from "./provider";

/** Adapter over the existing Exa people-search cache. */
export const exaProvider: PeopleDataProvider = {
  id: "exa",
  label: "Exa people search",
  method: "scraped",
  getSignals(companySlug: string): PeopleSignals | null {
    const cached = getCachedExaSignals(companySlug);
    if (!cached) return null;
    return {
      companySlug,
      avgTenureMonths: cached.tenure.avgMonths,
      newHiresLast6Months: cached.hiring.newHiresLast6Months,
      promotions: cached.promotions.internalPromotions,
      pedigreeCompanies: cached.pedigrees.topPriorEmployers.map(
        (p) => p.company
      ),
      retrievedAt: cached.fetchedAt,
      sources: [
        {
          source_name: "Exa people search (exa.ai)",
          url: "https://exa.ai",
          retrieved_at: cached.fetchedAt,
          confidence: "medium",
          method: "scraped",
          note: "Public web people-search index — not LinkedIn scraping",
        },
      ],
    };
  },
};

const PROVIDERS: Record<string, PeopleDataProvider> = {
  exa: exaProvider,
  coresignal: coresignalProvider,
  pdl: peopleDataLabsProvider,
  livedata: liveDataProvider,
  harmonic: harmonicProvider,
};

export function getPeopleDataProvider(): PeopleDataProvider {
  const id = process.env.PEOPLE_DATA_PROVIDER ?? "exa";
  return PROVIDERS[id] ?? exaProvider;
}
