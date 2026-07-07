import { companies } from "./data";
import { computeScorecard } from "./scoring/engine";
import type { CompanyScorecard } from "./scoring/types";
import type { CompanyCategory } from "./types";

/**
 * Slim, serializable company summary + computed scorecard for client
 * components (avoids shipping the full seed objects over the RSC boundary).
 */
export interface CompanySummary {
  slug: string;
  name: string;
  industry: string;
  stage: string;
  hq: string;
  sellsItself: string;
  categories: CompanyCategory[];
  gtmTeamSize: string;
}

export interface ScoredCompany {
  company: CompanySummary;
  scorecard: CompanyScorecard;
}

export function getScoredCompanies(): ScoredCompany[] {
  return companies.map((c) => ({
    company: {
      slug: c.slug,
      name: c.name,
      industry: c.industry,
      stage: c.stage,
      hq: c.hq,
      sellsItself: c.sellsItself,
      categories: c.categories,
      gtmTeamSize: c.gtmTeamSize,
    },
    scorecard: computeScorecard(c.slug),
  }));
}
