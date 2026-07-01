import { writeFile } from "node:fs/promises";
import path from "node:path";
import { companies } from "../src/lib/data";
import { fetchAllExaSignals } from "../src/lib/scrapers/exa/fetch";
import type { ExaCacheFile } from "../src/lib/scrapers/exa/types";

const OUTPUT = path.join(process.cwd(), "src/data/exa/cache.json");

async function main() {
  if (!process.env.EXA_API_KEY) {
    console.error("EXA_API_KEY is required. Set it in your environment.");
    process.exit(1);
  }

  const targets = companies.map((c) => ({ slug: c.slug, name: c.name }));
  console.log(`Fetching Exa LinkedIn signals for ${targets.length} companies…`);

  const signals = await fetchAllExaSignals(targets, 800);

  const cache: ExaCacheFile = {
    version: 1,
    scrapedAt: new Date().toISOString(),
    companies: Object.fromEntries(signals.map((s) => [s.companySlug, s])),
  };

  await writeFile(OUTPUT, `${JSON.stringify(cache, null, 2)}\n`, "utf8");

  console.log(`\nSaved ${signals.length} company signal sets to ${OUTPUT}`);
  for (const s of signals) {
    const tenure =
      s.tenure.avgMonths != null ? `${s.tenure.avgMonths}mo avg` : "n/a";
    console.log(
      `  ✓ ${s.companySlug}: ${s.people.length} profiles, ${s.hiring.totalCurrentGtm} current GTM, ${tenure}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
