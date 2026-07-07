import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { companies } from "@/lib/data";
import { MIN_SAMPLE_SIZE } from "@/lib/community/types";
import { SubmitForm } from "./submit-form";
import { Lock, ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Submit comp data — GTM Hire",
  description:
    "Anonymous, structured comp submissions (Levels.fyi model). Lightweight verification, aggregates only shown at n ≥ 3 per company-region.",
};

const GUARANTEES = [
  {
    icon: Lock,
    title: "Anonymous by design",
    detail:
      "Your work email is hashed (SHA-256) before storage — we never keep the raw address, and free-mail domains are rejected. No account, no name, no title.",
  },
  {
    icon: Users,
    title: `Aggregates only at n ≥ ${MIN_SAMPLE_SIZE}`,
    detail: `Nothing is shown publicly until ${MIN_SAMPLE_SIZE}+ verified submissions exist for a company-region, so a single submission can never be traced back to you.`,
  },
  {
    icon: ShieldCheck,
    title: "Feeds Quota Reality",
    detail:
      "Verified aggregates replace scraped RepVue/Glassdoor proxies for regions where community data exists — your submission directly improves score accuracy.",
  },
];

export default function SubmitPage() {
  const options = [...companies]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Community data"
        title="Submit comp data, anonymously"
        description="Structured submissions on OTE, base/variable split, attainment, ramp, and comp model — the same model Levels.fyi proved for engineering comp."
        align="left"
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <SubmitForm companies={options} />

        <aside className="space-y-4">
          {GUARANTEES.map((g) => (
            <div key={g.title} className="border border-rule bg-card p-4">
              <div className="flex items-center gap-2">
                <g.icon className="h-4 w-4 text-gravy" aria-hidden />
                <h2 className="text-sm font-semibold">{g.title}</h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {g.detail}
              </p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            How submissions are verified, aggregated, and used is documented on
            the{" "}
            <Link
              href="/methodology"
              className="focus-ring underline underline-offset-2 hover:text-gravy"
            >
              methodology page
            </Link>
            .
          </p>
        </aside>
      </div>
    </main>
  );
}
