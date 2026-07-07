/**
 * Manually curated AU/APAC leadership intel.
 *
 * Rendered as FACTS ("ex-Datadog, joined at Series B") — never converted into
 * a numeric "team strength" score. Scoring identifiable individuals in small
 * regions is out of bounds by policy (see /methodology).
 *
 * Records are role-based, not name-based, and each carries curation metadata.
 */
export interface TeamIntelRecord {
  company: string; // company slug
  region: string;
  leader_role: string;
  prior_companies: string[];
  joined_stage: string;
  tenure: string;
  notable_signals: string[];
  curated_by: string;
  curated_at: string;
}

export const teamIntel: TeamIntelRecord[] = [
  {
    company: "clay",
    region: "AMER",
    leader_role: "VP Sales",
    prior_companies: ["Gong"],
    joined_stage: "Series A",
    tenure: "2+ years",
    notable_signals: [
      "Scaled a mid-market team 0→80 at prior company",
      "First enterprise AEs hired from Salesforce and Outreach",
    ],
    curated_by: "GTM Hire research",
    curated_at: "2026-07-01",
  },
  {
    company: "rippling",
    region: "ANZ",
    leader_role: "Country Manager, Australia",
    prior_companies: ["Local HCM competitors"],
    joined_stage: "Series F",
    tenure: "Under 1 year",
    notable_signals: [
      "Part of APAC launch hiring wave (Australia and Singapore)",
      "Regional GTM pods being built from scratch — greenfield patch",
    ],
    curated_by: "GTM Hire research",
    curated_at: "2026-07-01",
  },
  {
    company: "rippling",
    region: "AMER",
    leader_role: "GTM leadership (multiple)",
    prior_companies: ["Okta", "Snowflake", "ADP"],
    joined_stage: "Series E–F",
    tenure: "1–3 years",
    notable_signals: [
      "Separate hiring waves for IT, Payroll, and Benefits AE teams",
      "Enterprise-grade leadership pedigree across segments",
    ],
    curated_by: "GTM Hire research",
    curated_at: "2026-07-01",
  },
  {
    company: "datadog",
    region: "ANZ",
    leader_role: "Regional sales leadership, Sydney hub",
    prior_companies: ["Enterprise infrastructure vendors"],
    joined_stage: "Public",
    tenure: "2+ years",
    notable_signals: [
      "Sydney hub actively hiring commercial AEs, CS, and SEs (7 open GTM roles as of Jul 2026)",
      "Brisbane enterprise SE posting — second AU city expansion",
    ],
    curated_by: "GTM Hire research",
    curated_at: "2026-07-01",
  },
];

export function getTeamIntelForCompany(slug: string): TeamIntelRecord[] {
  return teamIntel.filter((r) => r.company === slug);
}
