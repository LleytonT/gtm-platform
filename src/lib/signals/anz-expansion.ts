import "server-only";

/**
 * ANZ expansion signal detectors.
 *
 * Detector types:
 *  - au_job_posting:     first/active AU-NZ GTM postings (automated, from the
 *                        public job-board pipeline)
 *  - au_entity:          new AU entity registration (curated from ASIC public
 *                        search — https://connectonline.asic.gov.au)
 *  - au_gtm_hire:        first AU-based GTM hire announcement (curated)
 *  - au_event_presence:  AU event/sponsorship presence (curated)
 */
import { SourceRecord } from "../provenance";
import { getJobBoardCache } from "../pipelines/job-boards/cache";

export type AnzSignalType =
  | "au_job_posting"
  | "au_entity"
  | "au_gtm_hire"
  | "au_event_presence";

export const ANZ_SIGNAL_LABELS: Record<AnzSignalType, string> = {
  au_job_posting: "AU/NZ job postings",
  au_entity: "AU entity registration",
  au_gtm_hire: "AU GTM hire",
  au_event_presence: "AU event presence",
};

export interface AnzExpansionSignal {
  companySlug: string;
  type: AnzSignalType;
  headline: string;
  detail: string;
  detectedAt: string;
  source: SourceRecord;
}

const ASIC_SEARCH_URL =
  "https://connectonline.asic.gov.au/RegistrySearch/faces/landing/SearchRegisters.jspx";

/**
 * Curated (non-automatable) ANZ signals. ASIC has no public API, so entity
 * registrations are manually checked against the public register and linked
 * for independent verification.
 */
const curatedAnzSignals: AnzExpansionSignal[] = [
  {
    companySlug: "openai",
    type: "au_entity",
    headline: "OpenAI operating an Australian entity ahead of Sydney office",
    detail:
      "Publicly announced Sydney office plans; AU entity verifiable via ASIC public register search.",
    detectedAt: "2026-06-15",
    source: {
      source_name: "ASIC public register (manual check)",
      url: ASIC_SEARCH_URL,
      retrieved_at: "2026-06-15T00:00:00.000Z",
      confidence: "medium",
      method: "manual",
    },
  },
  {
    companySlug: "anthropic",
    type: "au_gtm_hire",
    headline: "First AU-based enterprise sales postings for APAC coverage",
    detail:
      "Sydney-based AE postings covering ASEAN, public sector, and higher education signal a local GTM build-out.",
    detectedAt: "2026-06-20",
    source: {
      source_name: "Anthropic careers (public board)",
      url: "https://boards.greenhouse.io/anthropic",
      retrieved_at: "2026-06-20T00:00:00.000Z",
      confidence: "high",
      method: "manual",
    },
  },
];

/** Automated detector: AU/NZ GTM postings from the job-board pipeline. */
function detectAnzJobPostings(): AnzExpansionSignal[] {
  const cache = getJobBoardCache();
  const signals: AnzExpansionSignal[] = [];

  for (const [slug, snapshot] of Object.entries(cache.latest.companies)) {
    const anzPostings = snapshot.gtmPostings.filter((p) => p.region === "anz");
    if (anzPostings.length === 0) continue;

    const titles = anzPostings
      .slice(0, 3)
      .map((p) => p.title)
      .join("; ");

    signals.push({
      companySlug: slug,
      type: "au_job_posting",
      headline: `${anzPostings.length} open AU/NZ GTM role${anzPostings.length === 1 ? "" : "s"}`,
      detail: titles,
      detectedAt: cache.latest.capturedAt,
      source: {
        source_name: `Public job board (${snapshot.provider})`,
        url: snapshot.boardUrl,
        retrieved_at: cache.latest.capturedAt,
        confidence: "high",
        method: "scraped",
      },
    });
  }

  return signals;
}

export function getAnzExpansionSignals(): AnzExpansionSignal[] {
  return [...detectAnzJobPostings(), ...curatedAnzSignals].sort((a, b) =>
    b.detectedAt.localeCompare(a.detectedAt)
  );
}

export function getAnzSignalsForCompany(slug: string): AnzExpansionSignal[] {
  return getAnzExpansionSignals().filter((s) => s.companySlug === slug);
}

/** Slugs currently showing any ANZ expansion signal (for badges). */
export function getAnzExpandingSlugs(): Set<string> {
  return new Set(getAnzExpansionSignals().map((s) => s.companySlug));
}
