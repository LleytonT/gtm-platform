import Exa from "exa-js";
import { buildPeopleQueries } from "./queries";
import { dedupePeople, parsePersonFromResult } from "./parse";
import { buildCompanySignals } from "./signals";
import type { ExaCompanySignals, ExaSearchResponse } from "./types";

function getExaClient(): Exa {
  const key = process.env.EXA_API_KEY;
  if (!key) {
    throw new Error(
      "EXA_API_KEY is not set. Add it to .env.local or your environment."
    );
  }
  return new Exa(key);
}

async function searchPeople(
  query: string,
  numResults: number
): Promise<ExaSearchResponse> {
  const exa = getExaClient();
  const result = await exa.search(query, {
    type: "auto",
    category: "people",
    numResults,
    contents: { highlights: true },
  });
  return result as ExaSearchResponse;
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
