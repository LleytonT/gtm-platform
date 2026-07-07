import { classifyRegion, classifyRole } from "./classify";
import type { AtsBoardConfig, JobPosting } from "./types";

/**
 * Public ATS job boards for tracked companies. All endpoints below are
 * official, public, unauthenticated APIs published by the ATS vendors for
 * exactly this purpose — no LinkedIn scraping, no ToS-violating access.
 *
 * Companies without a discoverable public board are simply absent; their
 * jobs-derived metrics render as "insufficient data".
 */
export const ATS_BOARDS: AtsBoardConfig[] = [
  // Greenhouse
  { companySlug: "datadog", ats: "greenhouse", boardSlug: "datadog", boardUrl: "https://careers.datadoghq.com" },
  { companySlug: "gong", ats: "greenhouse", boardSlug: "gongio", boardUrl: "https://www.gong.io/careers/" },
  { companySlug: "figma", ats: "greenhouse", boardSlug: "figma", boardUrl: "https://www.figma.com/careers/" },
  { companySlug: "mercury", ats: "greenhouse", boardSlug: "mercury", boardUrl: "https://mercury.com/jobs" },
  { companySlug: "anthropic", ats: "greenhouse", boardSlug: "anthropic", boardUrl: "https://www.anthropic.com/careers" },
  { companySlug: "databricks", ats: "greenhouse", boardSlug: "databricks", boardUrl: "https://www.databricks.com/company/careers" },
  { companySlug: "glean", ats: "greenhouse", boardSlug: "gleanwork", boardUrl: "https://www.glean.com/careers" },
  { companySlug: "scale-ai", ats: "greenhouse", boardSlug: "scaleai", boardUrl: "https://scale.com/careers" },
  { companySlug: "vercel", ats: "greenhouse", boardSlug: "vercel", boardUrl: "https://vercel.com/careers" },
  { companySlug: "together-ai", ats: "greenhouse", boardSlug: "togetherai", boardUrl: "https://www.together.ai/careers" },
  { companySlug: "xai", ats: "greenhouse", boardSlug: "xai", boardUrl: "https://x.ai/careers" },
  // Lever
  { companySlug: "mistral-ai", ats: "lever", boardSlug: "mistral", boardUrl: "https://jobs.lever.co/mistral" },
  // Ashby
  { companySlug: "openai", ats: "ashby", boardSlug: "openai", boardUrl: "https://jobs.ashbyhq.com/openai" },
  { companySlug: "cursor", ats: "ashby", boardSlug: "cursor", boardUrl: "https://jobs.ashbyhq.com/cursor" },
  { companySlug: "notion", ats: "ashby", boardSlug: "notion", boardUrl: "https://jobs.ashbyhq.com/notion" },
  { companySlug: "vanta", ats: "ashby", boardSlug: "vanta", boardUrl: "https://jobs.ashbyhq.com/vanta" },
  { companySlug: "elevenlabs", ats: "ashby", boardSlug: "elevenlabs", boardUrl: "https://jobs.ashbyhq.com/elevenlabs" },
  { companySlug: "runway", ats: "ashby", boardSlug: "runway", boardUrl: "https://jobs.ashbyhq.com/runway" },
  { companySlug: "perplexity", ats: "ashby", boardSlug: "perplexity", boardUrl: "https://jobs.ashbyhq.com/perplexity" },
  { companySlug: "sierra", ats: "ashby", boardSlug: "sierra", boardUrl: "https://jobs.ashbyhq.com/sierra" },
  { companySlug: "writer", ats: "ashby", boardSlug: "writer", boardUrl: "https://jobs.ashbyhq.com/writer" },
  { companySlug: "cohere", ats: "ashby", boardSlug: "cohere", boardUrl: "https://jobs.ashbyhq.com/cohere" },
  { companySlug: "speak", ats: "ashby", boardSlug: "speak", boardUrl: "https://jobs.ashbyhq.com/speak" },
  { companySlug: "abridge", ats: "ashby", boardSlug: "abridge", boardUrl: "https://jobs.ashbyhq.com/abridge" },
  { companySlug: "harvey", ats: "ashby", boardSlug: "harvey", boardUrl: "https://jobs.ashbyhq.com/harvey" },
  { companySlug: "deepl", ats: "ashby", boardSlug: "deepl", boardUrl: "https://jobs.ashbyhq.com/deepl" },
];

function makePosting(
  id: string,
  title: string,
  location: string,
  publishedAt: string | null,
  url: string
): JobPosting {
  const roleClass = classifyRole(title);
  const { region, isAnz } = classifyRegion(location);
  return {
    id,
    title,
    location,
    region,
    isAnz,
    isGtm: roleClass != null,
    roleClass,
    publishedAt,
    url,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function fetchGreenhouse(board: AtsBoardConfig): Promise<JobPosting[]> {
  const data = (await fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${board.boardSlug}/jobs`
  )) as {
    jobs: {
      id: number;
      title: string;
      location?: { name?: string };
      absolute_url: string;
      updated_at?: string;
      first_published?: string;
    }[];
  };
  return data.jobs.map((j) =>
    makePosting(
      String(j.id),
      j.title,
      j.location?.name ?? "",
      j.first_published ?? j.updated_at ?? null,
      j.absolute_url
    )
  );
}

async function fetchLever(board: AtsBoardConfig): Promise<JobPosting[]> {
  const data = (await fetchJson(
    `https://api.lever.co/v0/postings/${board.boardSlug}?mode=json`
  )) as {
    id: string;
    text: string;
    createdAt?: number;
    hostedUrl: string;
    categories?: { location?: string; allLocations?: string[] };
  }[];
  return data.map((j) =>
    makePosting(
      j.id,
      j.text,
      j.categories?.allLocations?.join("; ") ?? j.categories?.location ?? "",
      j.createdAt ? new Date(j.createdAt).toISOString() : null,
      j.hostedUrl
    )
  );
}

async function fetchAshby(board: AtsBoardConfig): Promise<JobPosting[]> {
  const data = (await fetchJson(
    `https://api.ashbyhq.com/posting-api/job-board/${board.boardSlug}`
  )) as {
    jobs: {
      id: string;
      title: string;
      location?: string;
      secondaryLocations?: { location?: string }[];
      publishedAt?: string;
      isListed?: boolean;
      jobUrl: string;
    }[];
  };
  return data.jobs
    .filter((j) => j.isListed !== false)
    .map((j) => {
      const locations = [
        j.location ?? "",
        ...(j.secondaryLocations ?? []).map((s) => s.location ?? ""),
      ]
        .filter(Boolean)
        .join("; ");
      return makePosting(j.id, j.title, locations, j.publishedAt ?? null, j.jobUrl);
    });
}

export async function fetchBoardPostings(
  board: AtsBoardConfig
): Promise<JobPosting[]> {
  switch (board.ats) {
    case "greenhouse":
      return fetchGreenhouse(board);
    case "lever":
      return fetchLever(board);
    case "ashby":
      return fetchAshby(board);
  }
}
