import { BoardConfig, JobBoardProvider } from "./types";

/**
 * Verified public ATS board tokens per tracked company.
 * Companies not listed here have no discoverable public job board API and
 * therefore report "insufficient data" for job-posting-derived signals.
 *
 * All three providers expose intentionally public, documented JSON APIs:
 * - Greenhouse: https://developers.greenhouse.io/job-board.html
 * - Lever:      https://github.com/lever/postings-api
 * - Ashby:      https://developers.ashbyhq.com/docs/public-job-posting-api
 */
export const JOB_BOARDS: BoardConfig[] = [
  // Core companies
  { companySlug: "datadog", provider: "greenhouse", token: "datadog" },
  { companySlug: "gong", provider: "greenhouse", token: "gongio" },
  { companySlug: "notion", provider: "ashby", token: "notion" },
  { companySlug: "clay", provider: "ashby", token: "claylabs" },
  { companySlug: "vanta", provider: "ashby", token: "vanta" },
  { companySlug: "figma", provider: "greenhouse", token: "figma" },
  { companySlug: "mercury", provider: "greenhouse", token: "mercury" },
  // Forbes AI 50 seeds
  { companySlug: "openai", provider: "ashby", token: "openai" },
  { companySlug: "anthropic", provider: "greenhouse", token: "anthropic" },
  { companySlug: "cursor", provider: "ashby", token: "cursor" },
  { companySlug: "databricks", provider: "greenhouse", token: "databricks" },
  { companySlug: "harvey", provider: "ashby", token: "harvey" },
  { companySlug: "glean", provider: "greenhouse", token: "gleanwork" },
  { companySlug: "sierra", provider: "ashby", token: "sierra" },
  { companySlug: "mistral-ai", provider: "lever", token: "mistral" },
  { companySlug: "scale-ai", provider: "greenhouse", token: "scaleai" },
  { companySlug: "cohere", provider: "ashby", token: "cohere" },
  { companySlug: "runway", provider: "ashby", token: "runway" },
  { companySlug: "elevenlabs", provider: "ashby", token: "elevenlabs" },
  { companySlug: "writer", provider: "ashby", token: "writer" },
  { companySlug: "abridge", provider: "ashby", token: "abridge" },
  { companySlug: "deepl", provider: "ashby", token: "deepl" },
  { companySlug: "together-ai", provider: "greenhouse", token: "togetherai" },
  { companySlug: "speak", provider: "ashby", token: "speak" },
  { companySlug: "xai", provider: "greenhouse", token: "xai" },
  { companySlug: "vercel", provider: "greenhouse", token: "vercel" },
];

export function getBoardConfig(companySlug: string): BoardConfig | undefined {
  return JOB_BOARDS.find((b) => b.companySlug === companySlug);
}

export function boardUrl(provider: JobBoardProvider, token: string): string {
  switch (provider) {
    case "greenhouse":
      return `https://boards.greenhouse.io/${token}`;
    case "lever":
      return `https://jobs.lever.co/${token}`;
    case "ashby":
      return `https://jobs.ashbyhq.com/${token}`;
  }
}

export function boardApiUrl(provider: JobBoardProvider, token: string): string {
  switch (provider) {
    case "greenhouse":
      return `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`;
    case "lever":
      return `https://api.lever.co/v0/postings/${token}?mode=json`;
    case "ashby":
      return `https://api.ashbyhq.com/posting-api/job-board/${token}`;
  }
}
