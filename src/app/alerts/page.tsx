import type { Metadata } from "next";
import { getScoredCompanies } from "@/lib/scored";
import { getSignalLogEntries } from "@/lib/signal-log";
import AlertsClient from "./alerts-client";

export const metadata: Metadata = {
  title: "Alerts — GTM Hire",
  description:
    "A notification agent that watches the signal-change log and ANZ expansion detectors, matched to your roles, regions, stage, and weights. Free — no pay-to-reveal.",
};

export default function AlertsPage() {
  const items = getScoredCompanies();
  const entries = getSignalLogEntries(200);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono-data text-xs font-medium uppercase tracking-[0.25em] text-gravy">
        Notification agent
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold">
        Get told when the data moves
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The agent watches the signal-change log and ANZ expansion detectors
        after every refresh. Set your target roles, regions, minimum stage,
        comp priorities, and threshold — matches above it land in your email
        digest.
      </p>
      <div className="mt-8">
        <AlertsClient items={items} entries={entries} />
      </div>
    </div>
  );
}
