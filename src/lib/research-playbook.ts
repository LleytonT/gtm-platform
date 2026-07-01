import {
  Company,
  CompanyResearch,
  ResearchFinding,
  ResearchLensData,
  ResearchLensId,
  ThreeTKey,
} from "./types";

export const RESEARCH_LENS_ORDER: ResearchLensId[] = [
  "people_intel",
  "review_sites",
  "team_linkedin",
  "media_competition",
  "industry_growth",
];

export const RESEARCH_LENS_META: Record<
  ResearchLensId,
  {
    order: number;
    label: string;
    shortLabel: string;
    description: string;
    howTo: string;
    primaryFeeds: ThreeTKey;
    icon: "messages" | "star" | "users" | "newspaper" | "trending";
  }
> = {
  people_intel: {
    order: 1,
    label: "People intel",
    shortLabel: "Coffee chats",
    description:
      "Talk to current and former employees. This is the highest-signal, lowest-scale step — nothing beats a 20-minute call.",
    howTo:
      "Find 2–3 current reps and 1–2 alumni on LinkedIn. Ask about quota attainment, ramp time, manager quality, and why people leave.",
    primaryFeeds: "talent",
    icon: "messages",
  },
  review_sites: {
    order: 2,
    label: "Review sites",
    shortLabel: "RepVue & Glassdoor",
    description:
      "Aggregate sentiment from places reps actually post — quota attainment data, comp transparency, and leadership ratings.",
    howTo:
      "Check RepVue for quota attainment and OTE. Cross-reference Glassdoor GTM/sales reviews for patterns, not outliers.",
    primaryFeeds: "talent",
    icon: "star",
  },
  team_linkedin: {
    order: 3,
    label: "Team LinkedIn",
    shortLabel: "Team profiles",
    description:
      "Study the team you'd join — pedigrees, tenure, promotion paths, and where people go when they leave.",
    howTo:
      "Look at your would-be manager and 5–10 peer AEs. Flag short tenures, mass departures, or a team of all first-time sellers.",
    primaryFeeds: "territory",
    icon: "users",
  },
  media_competition: {
    order: 4,
    label: "Media & competition",
    shortLabel: "News & rivals",
    description:
      "Funding announcements, press coverage, and competitive positioning tell you if the company is winning or playing defense.",
    howTo:
      "Read the last 2 funding rounds, scan TechCrunch/industry press, and map who they're losing to in deal cycles.",
    primaryFeeds: "timing",
    icon: "newspaper",
  },
  industry_growth: {
    order: 5,
    label: "Industry growth",
    shortLabel: "Market tailwinds",
    description:
      "A great sales team in a shrinking market still struggles. Is the category growing? Are budgets expanding?",
    howTo:
      "Check market CAGR, analyst reports, and whether buyers have budget line items for this category this year.",
    primaryFeeds: "timing",
    icon: "trending",
  },
};

export const DEFAULT_CHECKLISTS: Record<ResearchLensId, string[]> = {
  people_intel: [
    "Coffee chat with a current AE on the team you'd join",
    "Coffee chat with someone who left in the last 12 months",
    "Ask: what % of reps hit quota last year?",
    "Ask: average ramp time to first closed deal",
    "Ask: is the territory greenfield or inherited accounts?",
  ],
  review_sites: [
    "RepVue — quota attainment % and OTE accuracy",
    "Glassdoor — filter reviews by 'sales' or 'GTM'",
    "Look for patterns across 10+ reviews, not one rant",
    "Compare comp claims to what recruiters told you",
  ],
  team_linkedin: [
    "Check your would-be manager's track record",
    "Average AE tenure on the team (under 12 months = red flag)",
    "Where do alumni go? (Promotion vs. escape to competitors)",
    "Is the team mostly promoted SDRs or experienced hires?",
    "Any mass exodus in the last 6 months?",
  ],
  media_competition: [
    "Last funding round — amount, valuation, investor quality",
    "Press in last 90 days — expansion, product launches, layoffs",
    "Who do they compete with in deals? Win rate anecdotes",
    "Are they category leader or challenger?",
  ],
  industry_growth: [
    "Category market size and CAGR",
    "Is this a budget line item or discretionary spend?",
    "Regulatory or tech shifts creating new demand?",
    "Compare growth to adjacent categories",
  ],
};

function avg(nums: number[]): number {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function signalToFinding(
  text: string,
  confidence: ResearchFinding["confidence"],
  feedsThreeT: ThreeTKey[],
  sentiment: ResearchFinding["sentiment"] = "positive"
): ResearchFinding {
  return { text, sentiment, confidence, feedsThreeT };
}

function buildLens(
  id: ResearchLensId,
  score: number,
  headline: string,
  findings: ResearchFinding[],
  resources?: ResearchLensData["resources"]
): ResearchLensData {
  return {
    score,
    headline,
    findings,
    checklist: DEFAULT_CHECKLISTS[id],
    resources,
  };
}

/** Build a research playbook from existing company data when no manual override exists. */
export function buildResearchFromCompany(company: Company): CompanyResearch {
  const { threeTs, pmf, financials, packages } = company;

  const peopleFindings: ResearchFinding[] = threeTs.talent.signals
    .filter((s) => s.source === "community")
    .map((s) =>
      signalToFinding(
        s.text,
        s.confidence,
        ["talent"],
        s.text.toLowerCase().includes("churn") ||
          s.text.toLowerCase().includes("long ramp")
          ? "neutral"
          : "positive"
      )
    );

  const reviewFindings: ResearchFinding[] = [
    signalToFinding(
      `Reported quota attainment: ${packages.quotaAttainment}`,
      "medium",
      ["talent"],
      parseInt(packages.quotaAttainment) >= 70 ? "positive" : "neutral"
    ),
    signalToFinding(
      `OTE range: ${packages.ote} (base ${packages.baseSalary})`,
      "medium",
      ["talent"],
      "neutral"
    ),
  ];

  const linkedinFindings: ResearchFinding[] = [
    ...threeTs.territory.signals.filter((s) => s.source === "linkedin"),
    ...threeTs.talent.signals.filter((s) => s.source === "linkedin"),
    ...threeTs.timing.signals.filter((s) => s.source === "linkedin"),
  ].map((s) =>
    signalToFinding(s.text, s.confidence, ["territory", "talent"])
  );

  const mediaFindings: ResearchFinding[] = [
    signalToFinding(
      `${financials.lastRound} — ${financials.funding}`,
      "high",
      ["timing"],
      "positive"
    ),
    signalToFinding(
      `Growth: ${financials.growthRate} | Revenue: ${financials.revenue}`,
      "high",
      ["timing"],
      "positive"
    ),
    signalToFinding(
      `Competitive position: ${pmf.competitivePosition}`,
      "medium",
      ["timing", "territory"],
      "neutral"
    ),
  ];

  const industryFindings: ResearchFinding[] = [
    signalToFinding(pmf.marketGrowth, "high", ["timing"], "positive"),
    ...pmf.signals.map((s) =>
      signalToFinding(s, "medium", ["timing"], "positive")
    ),
  ];

  const lenses = {
    people_intel: buildLens(
      "people_intel",
      threeTs.talent.score,
      peopleFindings.length > 0
        ? "Community intel available — verify with your own calls"
        : "No people intel yet — start here",
      peopleFindings
    ),
    review_sites: buildLens(
      "review_sites",
      packages.score,
      `Comp data sourced — validate on RepVue & Glassdoor`,
      reviewFindings,
      [
        {
          label: "Search RepVue",
          url: `https://www.repvue.com/companies/search?q=${encodeURIComponent(company.name)}`,
        },
        {
          label: "Search Glassdoor",
          url: `https://www.glassdoor.com/Reviews/company-reviews.htm?keyword=${encodeURIComponent(company.name)}`,
        },
      ]
    ),
    team_linkedin: buildLens(
      "team_linkedin",
      avg([threeTs.territory.score, threeTs.talent.score]),
      linkedinFindings.length > 0
        ? "LinkedIn signals detected on hiring & team movement"
        : "Run a manual LinkedIn sweep on your target team",
      linkedinFindings,
      [
        {
          label: "Search GTM team on LinkedIn",
          url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company.name + " account executive")}`,
        },
      ]
    ),
    media_competition: buildLens(
      "media_competition",
      avg([threeTs.timing.score, financials.score]),
      `${financials.growthRate} growth — check recent press for confirmation`,
      mediaFindings,
      [
        {
          label: "Google News",
          url: `https://news.google.com/search?q=${encodeURIComponent(company.name + " funding OR sales OR expansion")}`,
        },
      ]
    ),
    industry_growth: buildLens(
      "industry_growth",
      pmf.score,
      pmf.marketGrowth,
      industryFindings
    ),
  };

  const diligenceScore = avg(
    Object.values(lenses).map((l) => l.score)
  );

  return { lenses, diligenceScore };
}

export function getLensScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-red-600";
}

export function getSentimentStyles(
  sentiment: ResearchFinding["sentiment"]
): string {
  switch (sentiment) {
    case "positive":
      return "border-emerald-200 bg-emerald-50/50";
    case "neutral":
      return "border-slate-200 bg-slate-50/50";
    case "red_flag":
      return "border-red-200 bg-red-50/50";
  }
}
