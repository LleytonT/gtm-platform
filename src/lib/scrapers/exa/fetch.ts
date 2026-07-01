import { buildPeopleQueries } from "./queries";
import { dedupePeople, parsePersonFromResult } from "./parse";
import { buildCompanySignals } from "./signals";
import type { ExaCompanySignals, ExaSearchResponse } from "./types";

const EXA_SEARCH_URL = "https://api.exa.ai/search";

function getApiKey(): string {
  const key = process.env.EXA_API_KEY;
  if (!key) {
    throw new Error(
      "EXA_API_KEY is not set. Add it to your environment or .env.local"
    );
  }
  return key;
}

async function searchPeople(
  query: string,
  numResults: number
): Promise<ExaSearchResponse> {
  const response = await fetch(EXA_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
    },
    body: JSON.stringify({
      query,
      category: "people",
      type: "auto",
      numResults,
      contents: { highlights: true },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Exa search failed (${response.status}): ${body.slice(0, 200)}`);
  }

  return (await response.json()) as ExaSearchResponse;
}

export async function fetchExaCompanySignals(
  companySlug: string,
  companyName: string
): Promise<ExaCompanySignals> {
  const queries = buildPeopleQueries(companyName);
  const people = [];

  for (const q of queries) {
    const result = await searchPeople(q.query, q.numResults);
    for (const row of result.results ?? []) {
      const person = parsePersonFromResult(row);
      if (person) people.push(person);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return buildCompanySignals(
    companySlug,
    companyName,
    dedupePeople(people),
    new Date().toISOString()
  );
}

export async function fetchAllExaSignals(
  companies: Array<{ slug: string; name: string }>,
  delayMs = 500
): Promise<ExaCompanySignals[]> {
  const results: ExaCompanySignals[] = [];

  for (const company of companies) {
    results.push(await fetchExaCompanySignals(company.slug, company.name));
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
