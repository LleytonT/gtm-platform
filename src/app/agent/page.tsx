import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { AgentClient } from "./agent-client";
import { BellRing, Gift, Radar } from "lucide-react";

export const metadata: Metadata = {
  title: "Alerts — GTM Hire",
  description:
    "A free notification agent that watches the signal-change log and ANZ expansion detectors, and emails you a digest when companies matching your profile move.",
};

const HOW_IT_WORKS = [
  {
    icon: Radar,
    title: "Watches two streams",
    detail:
      "The signal-change log (every diffable score movement from the daily/weekly refreshes) and the ANZ expansion detectors (first AU posting, ASIC entity, AU GTM hire, AU event presence).",
  },
  {
    icon: BellRing,
    title: "Matches your profile",
    detail:
      "Target roles, regions, minimum stage, and your own alert threshold — only movements at or above your threshold make it into the digest.",
  },
  {
    icon: Gift,
    title: "Free — no pay-to-reveal",
    detail:
      "Email digest first, push delivery later. Every match shows the full reason and source; nothing is held back behind a paywall.",
  },
];

export default function AgentPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Notification agent"
        title="Get told when a company starts moving"
        description="Set your profile once. The agent watches the signal-change log and expansion detectors, and compiles matches above your threshold into a free email digest."
        align="left"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {HOW_IT_WORKS.map((item) => (
          <div key={item.title} className="border border-rule bg-card p-4">
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-gravy" aria-hidden />
              <h2 className="text-sm font-semibold">{item.title}</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <AgentClient />
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        The event streams the agent watches are public — browse them on the{" "}
        <Link
          href="/signals"
          className="focus-ring underline underline-offset-2 hover:text-gravy"
        >
          signals page
        </Link>
        .
      </p>
    </main>
  );
}
