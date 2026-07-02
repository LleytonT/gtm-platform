import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseRepvueMarkdown } from "../src/lib/scrapers/repvue/parser";
import { getRepvueSlugCandidates } from "../src/lib/scrapers/repvue/slugs";
import type { RepVueCacheFile } from "../src/lib/scrapers/repvue/types";

const RAW_DIR = path.join(process.cwd(), "src/data/repvue/raw");
const OUTPUT = path.join(process.cwd(), "src/data/repvue/cache.json");

async function main() {
  const files = (await readdir(RAW_DIR)).filter((file) => file.endsWith(".md"));
  const fetchedAt = new Date().toISOString();
  const companies: RepVueCacheFile["companies"] = {};

  for (const file of files) {
    const companySlug = file.replace(/\.md$/, "");
    const markdown = await readFile(path.join(RAW_DIR, file), "utf8");
    const canonical =
      markdown.match(/^Canonical URL:\s*(.+)$/m)?.[1]?.trim() ?? "";
    const repvueSlug =
      canonical.split("/companies/")[1] ??
      getRepvueSlugCandidates(companySlug)[0];
    companies[companySlug] = parseRepvueMarkdown(
      markdown,
      companySlug,
      repvueSlug,
      fetchedAt
    );
  }

  const cache: RepVueCacheFile = {
    version: 1,
    scrapedAt: fetchedAt,
    companies,
  };

  await writeFile(OUTPUT, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
  console.log(`Built cache with ${Object.keys(companies).length} companies → ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
