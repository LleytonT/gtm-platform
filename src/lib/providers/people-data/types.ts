/**
 * Provider-agnostic people-data adapter interface.
 *
 * We do NOT scrape LinkedIn. GTM team signals come from licensed people-data
 * providers behind this adapter so the vendor is swappable (Exa today;
 * Coresignal, People Data Labs, Live Data Technologies, and Harmonic are
 * evaluated candidates with stub adapters).
 */

export interface PeopleTenureMetrics {
  sampleSize: number;
  avgMonths: number | null;
  under12Months: number;
  over18Months: number;
}

export interface PeopleHiringMetrics {
  newHiresLast6Months: number;
  newHiresLast12Months: number;
  totalCurrentGtm: number;
}

export interface PeoplePromotionMetrics {
  internalPromotions: number;
}

export interface PeoplePedigreeMetrics {
  /** Aggregated prior-employer counts — never individual identities. */
  topPriorEmployers: Array<{ company: string; count: number }>;
}

export interface PeopleDataSignals {
  companySlug: string;
  retrievedAt: string;
  tenure: PeopleTenureMetrics;
  hiring: PeopleHiringMetrics;
  promotions: PeoplePromotionMetrics;
  pedigrees: PeoplePedigreeMetrics;
  providerId: string;
  attributionUrl: string;
}

export interface PeopleDataProvider {
  id: string;
  name: string;
  attributionUrl: string;
  /** True when API credentials are configured for live refreshes. */
  isConfigured(): boolean;
  /** Cached signals from the last sync, or null when none exist. */
  getCachedSignals(companySlug: string): PeopleDataSignals | null;
}
