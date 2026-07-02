import { writeFile } from "node:fs/promises";
import path from "node:path";
import { companies } from "../src/lib/data";
import { fetchAllRepvueProfiles } from "../src/lib/scrapers/repvue/fetch";
import type { RepVueCacheFile } from "../src/lib/scrapers/repvue/types";

const OUTPUT = path.join(process.cwd(), "src/data/repvue/cache.json");

async function main() {
  const slugs = companies.map((c) => c.slug);
  console.log(`Fetching RepVue profiles for ${slugs.length} companies…`);

  const { profiles, errors } = await fetchAllRepvueProfiles(slugs, 4000);

  const cache: RepVueCacheFile = {
    version: 1,
    scrapedAt: new Date().toISOString(),
    companies: Object.fromEntries(profiles.map((p) => [p.companySlug, p])),
  };

  await writeFile(OUTPUT, `${JSON.stringify(cache, null, 2)}\n`, "utf8");

  console.log(`\nSaved ${profiles.length} profiles to ${OUTPUT}`);
  for (const profile of profiles) {
    console.log(
      `  ✓ ${profile.companySlug} → ${profile.repvueSlug} (score ${profile.repvueScore})`
    );
  }

  if (errors.length > 0) {
    console.log(`\n${errors.length} companies not found on RepVue:`);
    for (const error of errors) {
      if (!error.ok) {
        console.log(`  ✗ ${error.companySlug}: ${error.message}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
