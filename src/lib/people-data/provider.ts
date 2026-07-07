/**
 * People-data provider adapter (P1.6b).
 *
 * We do NOT scrape LinkedIn. People-derived signals must come from either
 * (a) licensed data providers, or (b) search indexes with their own
 * compliance posture (Exa). This interface makes the provider swappable so
 * we can evaluate Coresignal, People Data Labs, Live Data Technologies, and
 * Harmonic without touching consumer code.
 *
 * Select a provider with the PEOPLE_DATA_PROVIDER env var.
 */
import type { MetricSource } from "../provenance";

export interface PeopleSignals {
  companySlug: string;
  /** Average GTM tenure in months, when computable. */
  avgTenureMonths: number | null;
  /** GTM hires detected in the last 6 months. */
  newHiresLast6Months: number | null;
  /** Internal promotions detected. */
  promotions: number | null;
  /** Notable prior employers among the GTM team. */
  pedigreeCompanies: string[];
  retrievedAt: string;
  sources: MetricSource[];
}

export interface PeopleDataProvider {
  id: string;
  label: string;
  /** How the provider's data is obtained — feeds provenance records. */
  method: "licensed" | "scraped";
  /** Returns null when the provider has no data for the company. */
  getSignals(companySlug: string): Promise<PeopleSignals | null> | PeopleSignals | null;
}

/**
 * Stub adapters for licensed providers under evaluation. Each returns null
 * (no data) until an API key and mapping are configured; they exist so the
 * integration surface is fixed before a contract is signed.
 */
function licensedStub(id: string, label: string): PeopleDataProvider {
  return {
    id,
    label,
    method: "licensed",
    getSignals: () => null,
  };
}

export const coresignalProvider = licensedStub("coresignal", "Coresignal");
export const peopleDataLabsProvider = licensedStub("pdl", "People Data Labs");
export const liveDataProvider = licensedStub(
  "livedata",
  "Live Data Technologies"
);
export const harmonicProvider = licensedStub("harmonic", "Harmonic");
