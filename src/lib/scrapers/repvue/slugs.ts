/**
 * Maps GTM Hire company slugs to RepVue URL slugs.
 * RepVue slugs are case-sensitive; try candidates in order.
 */
export const REPVUE_SLUG_CANDIDATES: Record<string, string[]> = {
  datadog: ["Datadog"],
  gong: ["Gongio", "Gong"],
  rippling: ["Rippling", "rippling"],
  notion: ["Notion"],
  clay: ["clay", "Clay"],
  vanta: ["Vanta"],
  figma: ["Figma"],
  mercury: ["Mercury"],
};

export function getRepvueSlugCandidates(companySlug: string): string[] {
  return REPVUE_SLUG_CANDIDATES[companySlug] ?? [capitalize(companySlug), companySlug];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getRepvueMarkdownUrl(repvueSlug: string): string {
  return `https://www.repvue.com/companies/${encodeURIComponent(repvueSlug)}.md`;
}

export function getRepvueProfileUrl(repvueSlug: string): string {
  return `https://www.repvue.com/companies/${encodeURIComponent(repvueSlug)}`;
}
