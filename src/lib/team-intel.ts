/**
 * team_intel — manually curated AU/APAC leadership records.
 *
 * Rendered as facts ("ex-Datadog, joined at Series B"), never as a numeric
 * "team strength" score. In small regions like AU, scoring identifiable
 * individuals is both ethically fraught and statistically meaningless, so
 * records are role-level only (no names) and each carries curation metadata.
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
    company: "datadog",
    region: "ANZ",
    leader_role: "Regional VP, ANZ",
    prior_companies: ["AWS", "VMware"],
    joined_stage: "Post-IPO",
    tenure: "3+ years",
    notable_signals: [
      "Built the Sydney enterprise pod from 4 to 20+ sellers",
      "Hired dedicated ANZ solutions engineering leadership in 2025",
    ],
    curated_by: "GTM Hire analyst team",
    curated_at: "2026-07-07",
  },
  {
    company: "rippling",
    region: "ANZ",
    leader_role: "Country Manager, Australia",
    prior_companies: ["Employment Hero", "Deputy"],
    joined_stage: "Series F",
    tenure: "~1 year",
    notable_signals: [
      "First AU-based GTM leadership hire — greenfield territory build",
      "Local HCM competitor pedigree suggests a payroll-led land motion",
    ],
    curated_by: "GTM Hire analyst team",
    curated_at: "2026-07-07",
  },
  {
    company: "cursor",
    region: "APAC",
    leader_role: "Solutions Architect Lead, APAC",
    prior_companies: ["Vercel"],
    joined_stage: "Series C",
    tenure: "<1 year",
    notable_signals: [
      "First APAC technical GTM hire — Sydney-based per public job posting",
    ],
    curated_by: "GTM Hire analyst team",
    curated_at: "2026-07-07",
  },
  {
    company: "glean",
    region: "ANZ",
    leader_role: "VP of Sales, ANZ",
    prior_companies: ["Slack", "Salesforce"],
    joined_stage: "Series D",
    tenure: "<1 year",
    notable_signals: [
      "Role advertised publicly in 2026 — ANZ region being stood up now",
      "ex-Slack leadership hire pattern matches enterprise-collab playbook",
    ],
    curated_by: "GTM Hire analyst team",
    curated_at: "2026-07-07",
  },
];

export function getTeamIntelForCompany(slug: string): TeamIntelRecord[] {
  return teamIntel.filter((r) => r.company === slug);
}
