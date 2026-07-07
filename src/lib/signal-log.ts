import logData from "@/data/signal-log.json";
import type { SignalLogEntry, SignalLogFile } from "./signal-log-types";
import { getCompanyBySlug } from "./data";

const log = logData as unknown as SignalLogFile;

/** Resolve display names for entries written by the scraper (which only knows slugs). */
function withCompanyName(entry: SignalLogEntry): SignalLogEntry {
  const company = getCompanyBySlug(entry.companySlug);
  return company ? { ...entry, companyName: company.name } : entry;
}

export function getSignalLog(): SignalLogFile {
  return log;
}

export function getSignalLogEntries(limit?: number): SignalLogEntry[] {
  const sorted = [...log.entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(withCompanyName);
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getSignalLogForCompany(slug: string): SignalLogEntry[] {
  return getSignalLogEntries().filter((e) => e.companySlug === slug);
}

/** ANZ expansion detector entries — powers the "Expanding into ANZ" feed. */
export function getAnzFeedEntries(limit = 20): SignalLogEntry[] {
  return getSignalLogEntries()
    .filter((e) => e.type === "anz_detector" || e.type === "new_region")
    .slice(0, limit);
}

export function getSignalLogUpdatedAt(): string {
  return log.updatedAt;
}
