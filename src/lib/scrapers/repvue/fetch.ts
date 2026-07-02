import { parseRepvueMarkdown } from "./parser";
import {
  getRepvueMarkdownUrl,
  getRepvueSlugCandidates,
} from "./slugs";
import type { RepVueFetchResponse, RepVueProfile } from "./types";

const FETCH_HEADERS = {
  Accept: "text/markdown, text/plain;q=0.9, */*;q=0.8",
  "User-Agent":
    "GTMHire/1.0 (RepVue data integration; +https://github.com/LleytonT/gtm-platform)",
};

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMarkdown(repvueSlug: string): Promise<string | null> {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(getRepvueMarkdownUrl(repvueSlug), {
      headers: FETCH_HEADERS,
      cache: "no-store",
    });

    if (response.status === 404) return null;

    if (response.status === 429) {
      const retryAfter = Number.parseInt(
        response.headers.get("retry-after") ?? "0",
        10
      );
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : attempt * 5000;
      if (attempt < maxAttempts) {
        await sleep(waitMs);
        continue;
      }
      throw new Error(`RepVue rate limited (429) for ${repvueSlug}`);
    }

    if (!response.ok) {
      throw new Error(
        `RepVue fetch failed (${response.status}) for ${repvueSlug}`
      );
    }

    const text = await response.text();
    if (!text.includes("RepVue Sales Role Profile")) {
      return null;
    }
    return text;
  }

  return null;
}

export async function fetchRepvueProfile(
  companySlug: string
): Promise<RepVueFetchResponse> {
  const candidates = getRepvueSlugCandidates(companySlug);
  const fetchedAt = new Date().toISOString();
  const triedSlugs: string[] = [];

  for (const repvueSlug of candidates) {
    triedSlugs.push(repvueSlug);
    try {
      const markdown = await fetchMarkdown(repvueSlug);
      if (!markdown) continue;

      const profile = parseRepvueMarkdown(
        markdown,
        companySlug,
        repvueSlug,
        fetchedAt
      );
      return { ok: true, profile };
    } catch (error) {
      if (repvueSlug === candidates[candidates.length - 1]) {
        return {
          ok: false,
          companySlug,
          triedSlugs,
          message:
            error instanceof Error ? error.message : "Unknown fetch error",
        };
      }
    }
  }

  return {
    ok: false,
    companySlug,
    triedSlugs,
    message: `No RepVue profile found for ${companySlug}`,
  };
}

export async function fetchAllRepvueProfiles(
  companySlugs: string[],
  delayMs = 3000
): Promise<{ profiles: RepVueProfile[]; errors: RepVueFetchResponse[] }> {
  const profiles: RepVueProfile[] = [];
  const errors: RepVueFetchResponse[] = [];

  for (const slug of companySlugs) {
    const result = await fetchRepvueProfile(slug);
    if (result.ok) {
      profiles.push(result.profile);
    } else {
      errors.push(result);
    }
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { profiles, errors };
}
