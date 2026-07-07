import { getCachedExaSignals } from "@/lib/scrapers/exa/cache";
import { PeopleDataProvider, PeopleDataSignals } from "./types";

/**
 * Exa adapter — the currently active licensed people-data provider.
 * Aggregate metrics only; individual profiles are never exposed to the UI.
 */
export const exaProvider: PeopleDataProvider = {
  id: "exa",
  name: "Exa",
  attributionUrl: "https://exa.ai",

  isConfigured() {
    return Boolean(process.env.EXA_API_KEY);
  },

  getCachedSignals(companySlug: string): PeopleDataSignals | null {
    const signals = getCachedExaSignals(companySlug);
    if (!signals) return null;
    return {
      companySlug,
      retrievedAt: signals.fetchedAt,
      tenure: signals.tenure,
      hiring: signals.hiring,
      promotions: {
        internalPromotions: signals.promotions.internalPromotions,
      },
      pedigrees: {
        topPriorEmployers: signals.pedigrees.topPriorEmployers,
      },
      providerId: "exa",
      attributionUrl: "https://exa.ai",
    };
  },
};
