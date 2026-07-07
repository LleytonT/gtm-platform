import type { Metadata } from "next";
import { Suspense } from "react";
import { companies } from "@/lib/data";
import { MIN_AGGREGATE_N } from "@/lib/submissions/types";
import SubmitClient from "./submit-client";

export const metadata: Metadata = {
  title: "Submit comp & quota data — GTM Hire",
  description:
    "Anonymous, verified comp and quota submissions. Aggregates render only when 3+ verified submissions exist per company-region.",
};

export default function SubmitPage() {
  const options = companies
    .map((c) => ({ slug: c.slug, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono-data text-xs font-medium uppercase tracking-[0.25em] text-gravy">
        Community data
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold">
        Share your comp & quota reality
      </h1>
      <p className="mt-3 text-muted-foreground">
        The Levels.fyi model for GTM: structured, anonymous, verified.
        Submissions feed the Quota Reality benchmark directly — and where a
        company-region has {MIN_AGGREGATE_N}+ verified submissions, scraped
        review-site proxies are deprecated in favor of real rep data.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <SubmitClient companies={options} />
        </Suspense>
      </div>
    </div>
  );
}
