import { CompanyResearch } from "./types";
import { DEFAULT_CHECKLISTS } from "./research-playbook";

/**
 * Hand-curated research playbooks for exemplar companies.
 * Other companies get auto-generated playbooks via buildResearchFromCompany().
 */
export const enrichedResearch: Record<string, CompanyResearch> = {
  clay: {
    diligenceScore: null,
    lenses: {
      people_intel: {
        score: null,
        headline: "Reps consistently report the product sells itself",
        findings: [
          {
            text: "3/3 coffee chats: reps cite inbound interest from prospects who already know Clay from Twitter/Slack",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing", "talent"],
          },
          {
            text: "Former SDR now AE: ramp to quota in 4 months, manager is hands-on but not micromanaging",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["talent"],
          },
          {
            text: "One alum left for a larger public co — not because of Clay, but for RSU liquidity",
            sentiment: "neutral",
            confidence: "medium",
            feedsThreeT: ["talent"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.people_intel,
      },
      review_sites: {
        score: null,
        headline: "RepVue: 74% quota attainment — top quartile for Series B",
        findings: [
          {
            text: "RepVue: 74% of reps hit quota, OTE accuracy rated 4.2/5",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["talent"],
          },
          {
            text: "Glassdoor: 4.1★ overall, sales reviews praise product but note 'startup pace'",
            sentiment: "positive",
            confidence: "medium",
            feedsThreeT: ["talent"],
          },
          {
            text: "No pattern of misrepresented OTE in reviews — comp claims match recruiter pitch",
            sentiment: "positive",
            confidence: "medium",
            feedsThreeT: ["talent"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.review_sites,
        resources: [
          { label: "Clay on RepVue", url: "https://www.repvue.com/companies/Clay" },
          { label: "Clay on Glassdoor", url: "https://www.glassdoor.com/Reviews/Clay-Reviews-E2265677.htm" },
        ],
      },
      team_linkedin: {
        score: null,
        headline: "Strong pedigrees, low churn, alumni promote internally",
        findings: [
          {
            text: "VP Sales came from Gong (scaled MM team 0→80) — strong builder profile",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["talent", "territory"],
          },
          {
            text: "Avg AE tenure 18 months — healthy for a Series B (not revolving door)",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["talent"],
          },
          {
            text: "Alumni tend to stay in sales tech and get promoted — not fleeing to unrelated industries",
            sentiment: "positive",
            confidence: "medium",
            feedsThreeT: ["talent"],
          },
          {
            text: "First enterprise AEs hired from Salesforce and Outreach — experienced, not all first-time",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["territory"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.team_linkedin,
        resources: [
          {
            label: "Clay GTM team on LinkedIn",
            url: "https://www.linkedin.com/search/results/people/?currentCompany=%5B%2269061404%22%5D&keywords=account%20executive",
          },
        ],
      },
      media_competition: {
        score: null,
        headline: "Series B at 300% growth — category darling, not challenger",
        findings: [
          {
            text: "Series B $46M (2024) — Meritech & Sequoia doubling down",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing"],
          },
          {
            text: "Positioned as platform vs. ZoomInfo point solution — winning head-to-heads",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing", "territory"],
          },
          {
            text: "Press coverage consistently frames Clay as 'the outbound AI company'",
            sentiment: "positive",
            confidence: "medium",
            feedsThreeT: ["timing"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.media_competition,
        resources: [
          {
            label: "Clay funding news",
            url: "https://news.google.com/search?q=Clay.com+Series+B+funding",
          },
        ],
      },
      industry_growth: {
        score: null,
        headline: "Sales intelligence market growing 22% CAGR — outbound AI is the wedge",
        findings: [
          {
            text: "GTM tooling budgets expanding as teams cut headcount but need pipeline",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing"],
          },
          {
            text: "Every VP Sales evaluating 'do more with less' — Clay is the default answer",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing"],
          },
          {
            text: "140%+ NDR suggests existing customers expanding — not just new logo pressure on reps",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing", "territory"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.industry_growth,
      },
    },
  },
  rippling: {
    diligenceScore: null,
    lenses: {
      people_intel: {
        score: null,
        headline: "Mixed signals — high growth but 'startup chaos' reports",
        findings: [
          {
            text: "Current AE: 'Best product I've sold — every demo converts' but notes fast org changes",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing", "talent"],
          },
          {
            text: "Former rep: left after 14 months due to territory reshuffle, not product issues",
            sentiment: "neutral",
            confidence: "medium",
            feedsThreeT: ["territory"],
          },
          {
            text: "Multiple coffee chats confirm: cross-sell motion is real, not just marketing",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.people_intel,
      },
      review_sites: {
        score: null,
        headline: "RepVue: 65% attainment — acceptable given hypergrowth",
        findings: [
          {
            text: "RepVue: 65% quota attainment — below elite but normal for 100% YoY growth co",
            sentiment: "neutral",
            confidence: "high",
            feedsThreeT: ["talent"],
          },
          {
            text: "Glassdoor: polarized — engineers love it, some sales reviews cite territory instability",
            sentiment: "neutral",
            confidence: "medium",
            feedsThreeT: ["talent", "territory"],
          },
          {
            text: "OTE ranges on RepVue match recruiter claims — no bait-and-switch pattern",
            sentiment: "positive",
            confidence: "medium",
            feedsThreeT: ["talent"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.review_sites,
        resources: [
          { label: "Rippling on RepVue", url: "https://www.repvue.com/companies/Rippling" },
        ],
      },
      team_linkedin: {
        score: null,
        headline: "A-player pedigrees, aggressive hiring across segments",
        findings: [
          {
            text: "GTM leaders from Okta, Snowflake, and ADP — enterprise-grade hiring",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["talent"],
          },
          {
            text: "Separate LinkedIn hiring waves for IT, Payroll, and Benefits AEs — real segment investment",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["territory"],
          },
          {
            text: "Some short tenures in SMB segment — likely due to territory resets, not mass exodus",
            sentiment: "neutral",
            confidence: "medium",
            feedsThreeT: ["territory"],
          },
          {
            text: "APAC country managers hired from local HCM competitors — experienced regional builders",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["territory"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.team_linkedin,
      },
      media_competition: {
        score: null,
        headline: "Series F at $11.25B — one of the hottest private companies in SaaS",
        findings: [
          {
            text: "Series F $500M at $11.25B valuation (2024) — Founders Fund leading",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing"],
          },
          {
            text: "Competing with Gusto (SMB), Workday (enterprise) — winning on unified platform story",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing", "territory"],
          },
          {
            text: "Regular TechCrunch/Bloomberg coverage — not flying under the radar",
            sentiment: "positive",
            confidence: "medium",
            feedsThreeT: ["timing"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.media_competition,
      },
      industry_growth: {
        score: null,
        headline: "HCM market growing 12% CAGR — consolidation trend favors Rippling",
        findings: [
          {
            text: "HR/IT/Finance consolidation is a board-level priority at 200–2,000 employee companies",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing"],
          },
          {
            text: "135% NDR — land-and-expand working, reps aren't reliant on new logos alone",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing", "territory"],
          },
          {
            text: "International expansion (APAC, EMEA) opens new timing window for regional reps",
            sentiment: "positive",
            confidence: "high",
            feedsThreeT: ["timing", "territory"],
          },
        ],
        checklist: DEFAULT_CHECKLISTS.industry_growth,
      },
    },
  },
};

export function getEnrichedResearch(slug: string): CompanyResearch | undefined {
  return enrichedResearch[slug];
}
