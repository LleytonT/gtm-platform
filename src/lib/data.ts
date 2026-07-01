import { Company, CompanyResearch, Scenario } from "./types";
import { computeGravyTrainScore, getGravyTrainVerdict } from "./three-ts";
import { buildResearchFromCompany } from "./research-playbook";
import { getEnrichedResearch } from "./research-data";
import { getCachedRepvueProfile } from "./scrapers/repvue/cache";
import { mergeRepvueIntoResearch } from "./scrapers/repvue/merge-research";
import { getCachedExaSignals } from "./scrapers/exa/cache";
import { mergeExaIntoResearch } from "./scrapers/exa/merge-research";

function withGravyTrain(
  company: Omit<Company, "gravyTrainScore" | "gravyTrainVerdict">
): Company {
  const gravyTrainScore = computeGravyTrainScore(company.threeTs);
  return {
    ...company,
    gravyTrainScore,
    gravyTrainVerdict: getGravyTrainVerdict(gravyTrainScore),
  };
}

export const companies: Company[] = (
  [
  {
    slug: "datadog",
    name: "Datadog",
    logo: "https://logo.clearbit.com/datadoghq.com",
    description:
      "Cloud-scale monitoring and analytics platform for infrastructure, applications, and logs.",
    industry: "DevOps / Observability",
    stage: "Public (NASDAQ: DDOG)",
    headcount: "5,000+",
    hq: "New York, NY",
    founded: 2010,
    website: "https://datadoghq.com",
    sellsItself:
      "Market leader with 26K+ customers — reps mostly expand existing accounts and ride inbound from the DevOps community.",
    expandingRegions: ["APAC", "EMEA", "LATAM"],
    threeTs: {
      timing: {
        score: 88,
        verdict: "Security & observability tailwinds still strong",
        signals: [
          {
            text: "CISO budgets expanding — security monitoring now a top-3 IT spend category",
            source: "market",
            confidence: "high",
          },
          {
            text: "Multiple VPs of Sales posting about 'platform consolidation' plays in enterprise",
            source: "linkedin",
            confidence: "high",
          },
          {
            text: "AI ops and LLM observability creating a new buying trigger in 2025–2026",
            source: "market",
            confidence: "emerging",
          },
        ],
      },
      territory: {
        score: 85,
        verdict: "APAC build-out with greenfield enterprise logos",
        signals: [
          {
            text: "15+ APAC sales hires in Sydney, Singapore, and Tokyo in the last 6 months",
            source: "linkedin",
            confidence: "high",
          },
          {
            text: "New 'Commercial' segment team targeting mid-market — less saturated than enterprise core",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "Security product line has its own AE pod — fresh territory vs. crowded infra AEs",
            source: "community",
            confidence: "medium",
          },
        ],
      },
      talent: {
        score: 82,
        verdict: "Massive GTM org, but competitive internally",
        signals: [
          {
            text: "1,200+ GTM headcount with dedicated enablement and SE pods per segment",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "OTE $170K–$240K with RSUs — comp is strong but quota attainment is 68%",
            source: "community",
            confidence: "high",
          },
          {
            text: "Reps report long ramp on enterprise accounts — talent advantage goes to experienced sellers",
            source: "community",
            confidence: "medium",
          },
        ],
      },
    },
    financials: {
      score: 92,
      revenue: "$2.1B ARR",
      funding: "Public — $648M raised pre-IPO",
      runway: "N/A (profitable)",
      growthRate: "26% YoY",
      lastRound: "IPO (2019)",
      investors: ["Index Ventures", "Iconiq Capital", "RTP Global"],
    },
    pmf: {
      score: 95,
      nps: 62,
      retention: "130%+ net dollar retention",
      marketGrowth: "Observability market growing 15% CAGR",
      competitivePosition: "Market leader",
      signals: [
        "Expanding from monitoring into security & CI/CD",
        "26,800+ customers",
        "Strong land-and-expand motion",
        "Multi-product adoption increasing",
      ],
    },
    packages: {
      score: 88,
      baseSalary: "$85K–$120K",
      ote: "$170K–$240K",
      equity: "RSUs vesting over 4 years",
      benefits: [
        "Unlimited PTO",
        "401k match",
        "Health/dental/vision",
        "Home office stipend",
      ],
      quota: "$600K–$900K ARR",
      quotaAttainment: "68% of reps hit quota",
    },
    hiringRoles: [
      "Commercial AE",
      "Enterprise AE",
      "SDR",
      "Solutions Engineer",
    ],
    gtmTeamSize: "1,200+",
  },
  {
    slug: "gong",
    name: "Gong",
    logo: "https://logo.clearbit.com/gong.io",
    description:
      "Revenue intelligence platform that captures and analyzes customer interactions to drive revenue growth.",
    industry: "Revenue Intelligence",
    stage: "Series E",
    headcount: "1,500+",
    hq: "San Francisco, CA",
    founded: 2015,
    website: "https://gong.io",
    sellsItself:
      "Category-defining revenue intelligence — when the CRO has a pipeline problem, Gong is the default answer in sales Twitter and Slack.",
    expandingRegions: ["EMEA", "APAC"],
    threeTs: {
      timing: {
        score: 86,
        verdict: "AI forecasting wave keeps Gong in every RFP",
        signals: [
          {
            text: "Every Series B+ SaaS is evaluating conversation intelligence post-2024 funding resets",
            source: "market",
            confidence: "high",
          },
          {
            text: "Gong Engage launch creating upsell motion — existing customers expanding seats",
            source: "funding",
            confidence: "high",
          },
          {
            text: "CROs in coffee chats say 'we need Gong' before reps even pitch it",
            source: "community",
            confidence: "medium",
          },
        ],
      },
      territory: {
        score: 80,
        verdict: "EMEA expansion, but US enterprise is crowded",
        signals: [
          {
            text: "Dublin and London GTM hubs hiring AEs and CS leaders aggressively",
            source: "linkedin",
            confidence: "high",
          },
          {
            text: "Mid-market pod launched separately from enterprise — fresher patch for new reps",
            source: "hiring",
            confidence: "medium",
          },
          {
            text: "APAC still early — first-mover advantage for reps who join now",
            source: "community",
            confidence: "emerging",
          },
        ],
      },
      talent: {
        score: 90,
        verdict: "72% quota attainment — they invest in reps who win",
        signals: [
          {
            text: "OTE $180K–$260K with strong pre-IPO equity — top quartile for sales comp",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "Dedicated deal strategists and value engineers on enterprise deals",
            source: "community",
            confidence: "high",
          },
          {
            text: "Remote-first with learning stipend — low attrition in GTM org",
            source: "linkedin",
            confidence: "medium",
          },
        ],
      },
    },
    financials: {
      score: 82,
      revenue: "$300M+ ARR",
      funding: "$584M total raised",
      runway: "18+ months",
      growthRate: "40% YoY",
      lastRound: "Series E ($250M, 2021)",
      investors: ["Sequoia Capital", "Battery Ventures", "Norwest Venture Partners"],
    },
    pmf: {
      score: 90,
      nps: 71,
      retention: "125% net dollar retention",
      marketGrowth: "Conversation intelligence market growing 20% CAGR",
      competitivePosition: "Category leader",
      signals: [
        "4,000+ customers including LinkedIn, Shopify, Hubspot",
        "Expanding into forecasting and engagement",
        "High NPS and customer satisfaction",
        "Strong word-of-mouth in sales community",
      ],
    },
    packages: {
      score: 91,
      baseSalary: "$90K–$130K",
      ote: "$180K–$260K",
      equity: "Options with strong upside pre-IPO",
      benefits: [
        "Unlimited PTO",
        "Remote-first culture",
        "Learning stipend",
        "Wellness benefits",
      ],
      quota: "$500K–$800K ARR",
      quotaAttainment: "72% of reps hit quota",
    },
    hiringRoles: ["Mid-Market AE", "Enterprise AE", "SDR", "Customer Success"],
    gtmTeamSize: "600+",
  },
  {
    slug: "rippling",
    name: "Rippling",
    logo: "https://logo.clearbit.com/rippling.com",
    description:
      "Unified workforce platform that combines HR, IT, and Finance in one system.",
    industry: "HR Tech / Workforce Management",
    stage: "Series F",
    headcount: "3,000+",
    hq: "San Francisco, CA",
    founded: 2016,
    website: "https://rippling.com",
    sellsItself:
      "Compound startup in HR/IT/Finance — every new product line is a cross-sell into the same customer base. Reps sell expansion, not cold logos.",
    expandingRegions: ["APAC", "EMEA", "US Enterprise"],
    threeTs: {
      timing: {
        score: 94,
        verdict: "100% growth + Series F — maximum buying urgency",
        signals: [
          {
            text: "Series F at $11.25B (2024) with explicit GTM investment mandate",
            source: "funding",
            confidence: "high",
          },
          {
            text: "HR/IT consolidation is the #1 ops priority for 200–2,000 employee companies",
            source: "market",
            confidence: "high",
          },
          {
            text: "Founders Fund and Sequoia pushing international expansion in board updates",
            source: "community",
            confidence: "medium",
          },
        ],
      },
      territory: {
        score: 92,
        verdict: "New product GTM teams = fresh patches everywhere",
        signals: [
          {
            text: "Separate AE teams for IT, Payroll, and Benefits — each is greenfield",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "APAC launch hiring country managers in Australia and Singapore",
            source: "linkedin",
            confidence: "high",
          },
          {
            text: "Enterprise segment only 18 months old — territory still being carved",
            source: "community",
            confidence: "high",
          },
        ],
      },
      talent: {
        score: 88,
        verdict: "800+ GTM and hiring across every segment",
        signals: [
          {
            text: "40+ open GTM roles on careers page across SMB, MM, and Enterprise",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "Reps get SE support and demo engineers on every deal — not a solo sport",
            source: "community",
            confidence: "medium",
          },
          {
            text: "High-growth equity at $11B valuation — upside if IPO path holds",
            source: "funding",
            confidence: "medium",
          },
        ],
      },
    },
    financials: {
      score: 90,
      revenue: "$350M+ ARR",
      funding: "$1.2B total raised",
      runway: "24+ months",
      growthRate: "100%+ YoY",
      lastRound: "Series F ($500M at $11.25B, 2024)",
      investors: [
        "Founders Fund",
        "Sequoia Capital",
        "Greenoaks Capital",
        "Bedrock Capital",
      ],
    },
    pmf: {
      score: 93,
      nps: 68,
      retention: "135% net dollar retention",
      marketGrowth: "HCM market growing 12% CAGR",
      competitivePosition: "Fast-growing disruptor",
      signals: [
        "Compound startup model — multiple products, one platform",
        "Strong SMB-to-enterprise motion",
        "Product velocity outpacing competitors",
        "High customer love and viral growth",
      ],
    },
    packages: {
      score: 86,
      baseSalary: "$80K–$115K",
      ote: "$160K–$230K",
      equity: "Options with high-growth upside",
      benefits: [
        "Competitive health benefits",
        "401k",
        "Commuter benefits",
        "Team events",
      ],
      quota: "$500K–$750K ARR",
      quotaAttainment: "65% of reps hit quota",
    },
    hiringRoles: ["SMB AE", "Mid-Market AE", "SDR", "Sales Engineer"],
    gtmTeamSize: "800+",
  },
  {
    slug: "notion",
    name: "Notion",
    logo: "https://logo.clearbit.com/notion.so",
    description:
      "All-in-one workspace for notes, docs, wikis, projects, and collaboration.",
    industry: "Productivity / Collaboration",
    stage: "Series C",
    headcount: "800+",
    hq: "San Francisco, CA",
    founded: 2013,
    website: "https://notion.so",
    sellsItself:
      "30M users and bottoms-up adoption — enterprise reps convert teams already using Notion for free. The product walked in before you did.",
    expandingRegions: ["EMEA", "APAC"],
    threeTs: {
      timing: {
        score: 82,
        verdict: "AI features driving enterprise upgrade cycle",
        signals: [
          {
            text: "Notion AI pushing enterprise tier adoption — new budget line item for IT",
            source: "market",
            confidence: "high",
          },
          {
            text: "Enterprise sales leaders hired from Figma and Slack in last 12 months",
            source: "linkedin",
            confidence: "high",
          },
          {
            text: "Collaboration market consolidating — Notion winning vs. Confluence in head-to-heads",
            source: "community",
            confidence: "medium",
          },
        ],
      },
      territory: {
        score: 78,
        verdict: "Enterprise motion maturing, but still under-penetrated",
        signals: [
          {
            text: "Enterprise AE team doubled in 2024 — territories still being assigned",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "EMEA hub in Dublin hiring first local AEs — greenfield region",
            source: "linkedin",
            confidence: "medium",
          },
          {
            text: "Solutions Consultant roles opening — signal of complex deal motion",
            source: "hiring",
            confidence: "medium",
          },
        ],
      },
      talent: {
        score: 80,
        verdict: "Smaller GTM org but 70% attainment",
        signals: [
          {
            text: "200+ GTM headcount — lean but high-performing team",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "70% quota attainment with PLG-sourced pipeline — reps aren't cold calling",
            source: "community",
            confidence: "high",
          },
          {
            text: "Equity at $10B valuation limits upside — talent play is about lifestyle + brand",
            source: "community",
            confidence: "medium",
          },
        ],
      },
    },
    financials: {
      score: 78,
      revenue: "$250M+ ARR",
      funding: "$343M total raised",
      runway: "30+ months",
      growthRate: "35% YoY",
      lastRound: "Series C ($275M at $10B, 2021)",
      investors: ["Sequoia Capital", "Index Ventures", "Coatue Management"],
    },
    pmf: {
      score: 88,
      nps: 65,
      retention: "120% net dollar retention",
      marketGrowth: "Collaboration software growing 13% CAGR",
      competitivePosition: "Strong brand in productivity space",
      signals: [
        "30M+ users globally",
        "Strong bottoms-up adoption in startups",
        "AI features driving enterprise adoption",
        "Expanding from docs to full workspace",
      ],
    },
    packages: {
      score: 84,
      baseSalary: "$85K–$120K",
      ote: "$170K–$240K",
      equity: "Options at high valuation",
      benefits: [
        "Flexible PTO",
        "Health coverage",
        "Remote-friendly",
        "Learning budget",
      ],
      quota: "$450K–$700K ARR",
      quotaAttainment: "70% of reps hit quota",
    },
    hiringRoles: ["Enterprise AE", "SDR", "Solutions Consultant"],
    gtmTeamSize: "200+",
  },
  {
    slug: "clay",
    name: "Clay",
    logo: "https://logo.clearbit.com/clay.com",
    description:
      "Data enrichment and outbound automation platform for GTM teams to build targeted prospecting workflows.",
    industry: "Sales Tech / Data Enrichment",
    stage: "Series B",
    headcount: "200+",
    hq: "New York, NY",
    founded: 2017,
    website: "https://clay.com",
    sellsItself:
      "The product sales people sell to sales people. 100K+ users, viral in the SDR community — demos feel like showing someone their own superpower.",
    expandingRegions: ["US Enterprise", "EMEA"],
    threeTs: {
      timing: {
        score: 96,
        verdict: "Outbound AI is the hottest GTM category right now",
        signals: [
          {
            text: "Series B ($46M, 2024) at 300% YoY growth — board wants GTM scale yesterday",
            source: "funding",
            confidence: "high",
          },
          {
            text: "Every VP Sales is asking 'what's our Clay strategy?' in 2025 planning",
            source: "community",
            confidence: "high",
          },
          {
            text: "SDR teams replacing ZoomInfo + manual research stacks with Clay workflows",
            source: "market",
            confidence: "high",
          },
        ],
      },
      territory: {
        score: 90,
        verdict: "Moving upmarket — enterprise is wide open",
        signals: [
          {
            text: "First enterprise AEs hired Q4 2024 — territories not yet carved",
            source: "linkedin",
            confidence: "high",
          },
          {
            text: "Partnerships team building agency and consultant channel — new motion",
            source: "hiring",
            confidence: "medium",
          },
          {
            text: "Only 60-person GTM team — every rep owns a massive patch",
            source: "community",
            confidence: "high",
          },
        ],
      },
      talent: {
        score: 85,
        verdict: "74% attainment on a product reps actually want to sell",
        signals: [
          {
            text: "Early-stage equity with significant upside at Series B",
            source: "funding",
            confidence: "high",
          },
          {
            text: "Reps come from the Clay community — they already know the product",
            source: "community",
            confidence: "high",
          },
          {
            text: "Remote-first with team retreats — tight-knit GTM culture",
            source: "linkedin",
            confidence: "medium",
          },
        ],
      },
    },
    financials: {
      score: 75,
      revenue: "$50M+ ARR",
      funding: "$70M total raised",
      runway: "24+ months",
      growthRate: "300%+ YoY",
      lastRound: "Series B ($46M, 2024)",
      investors: ["Meritech Capital", "Sequoia Capital", "FIKA Ventures"],
    },
    pmf: {
      score: 91,
      nps: 78,
      retention: "140%+ net dollar retention",
      marketGrowth: "Sales intelligence market growing 22% CAGR",
      competitivePosition: "Breakout leader in outbound tooling",
      signals: [
        "Viral growth among SDR/AE community",
        "100K+ users",
        "AI-native product with strong moat",
        "Community-led growth flywheel",
      ],
    },
    packages: {
      score: 82,
      baseSalary: "$75K–$105K",
      ote: "$150K–$210K",
      equity: "Early-stage options with significant upside",
      benefits: [
        "Health/dental/vision",
        "Unlimited PTO",
        "Remote-first",
        "Team retreats",
      ],
      quota: "$400K–$600K ARR",
      quotaAttainment: "74% of reps hit quota",
    },
    hiringRoles: ["AE", "SDR", "Partnerships"],
    gtmTeamSize: "60+",
  },
  {
    slug: "vanta",
    name: "Vanta",
    logo: "https://logo.clearbit.com/vanta.com",
    description:
      "Automated security and compliance platform that helps companies get SOC 2, ISO 27001, and HIPAA certified.",
    industry: "Security / Compliance",
    stage: "Series C",
    headcount: "500+",
    hq: "San Francisco, CA",
    founded: 2018,
    website: "https://vanta.com",
    sellsItself:
      "Compliance is a sales blocker — Vanta unblocks enterprise deals. When the CTO needs SOC 2 to close revenue, the product sells itself.",
    expandingRegions: ["EMEA", "APAC"],
    threeTs: {
      timing: {
        score: 91,
        verdict: "Compliance is now a revenue prerequisite, not a nice-to-have",
        signals: [
          {
            text: "Enterprise buyers requiring SOC 2/ISO on every vendor review — tailwind won't stop",
            source: "market",
            confidence: "high",
          },
          {
            text: "Series C ($150M at $2.45B) funding explicit GTM expansion",
            source: "funding",
            confidence: "high",
          },
          {
            text: "Health-tech and fintech startups losing deals without HIPAA — urgent trigger",
            source: "community",
            confidence: "high",
          },
        ],
      },
      territory: {
        score: 86,
        verdict: "New frameworks and segments = fresh patches",
        signals: [
          {
            text: "Separate pods for HIPAA, GDPR, and FedRAMP — each is a new territory",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "Enterprise AE team growing 2x in 2024 — mid-market still under-covered",
            source: "linkedin",
            confidence: "high",
          },
          {
            text: "EMEA compliance requirements creating region-specific GTM teams",
            source: "market",
            confidence: "medium",
          },
        ],
      },
      talent: {
        score: 84,
        verdict: "69% attainment with strong enablement",
        signals: [
          {
            text: "150+ GTM with dedicated SEs on enterprise deals",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "Pre-IPO equity with strong upside at $2.45B valuation",
            source: "funding",
            confidence: "medium",
          },
          {
            text: "Short sales cycles (30–60 days) — reps ramp fast on a product buyers need",
            source: "community",
            confidence: "high",
          },
        ],
      },
    },
    financials: {
      score: 84,
      revenue: "$150M+ ARR",
      funding: "$203M total raised",
      runway: "24+ months",
      growthRate: "80% YoY",
      lastRound: "Series C ($150M at $2.45B, 2023)",
      investors: ["Sequoia Capital", "Craft Ventures", "Y Combinator"],
    },
    pmf: {
      score: 87,
      nps: 60,
      retention: "125% net dollar retention",
      marketGrowth: "GRC market growing 14% CAGR",
      competitivePosition: "Leader in automated compliance",
      signals: [
        "7,000+ customers",
        "Strong product-led growth",
        "Expanding compliance framework coverage",
        "Trust as a competitive differentiator",
      ],
    },
    packages: {
      score: 85,
      baseSalary: "$80K–$115K",
      ote: "$160K–$230K",
      equity: "Options with strong pre-IPO upside",
      benefits: [
        "Competitive health benefits",
        "Flexible PTO",
        "Remote-friendly",
        "Professional development",
      ],
      quota: "$450K–$700K ARR",
      quotaAttainment: "69% of reps hit quota",
    },
    hiringRoles: ["Mid-Market AE", "Enterprise AE", "SDR", "SE"],
    gtmTeamSize: "150+",
  },
  {
    slug: "figma",
    name: "Figma",
    logo: "https://logo.clearbit.com/figma.com",
    description:
      "Collaborative design platform for building digital products, from wireframes to production-ready designs.",
    industry: "Design / Collaboration",
    stage: "Late Stage Private",
    headcount: "1,500+",
    hq: "San Francisco, CA",
    founded: 2012,
    website: "https://figma.com",
    sellsItself:
      "Designers already chose Figma — enterprise reps convert bottom-up love into six-figure contracts. The hardest part is done before you pick up the phone.",
    expandingRegions: ["EMEA", "APAC", "Enterprise US"],
    threeTs: {
      timing: {
        score: 90,
        verdict: "Post-Adobe deal, Figma is the default design standard",
        signals: [
          {
            text: "Adobe acquisition blocked — Figma independence renewed enterprise confidence",
            source: "funding",
            confidence: "high",
          },
          {
            text: "Dev Mode and FigJam expanding TAM beyond pure design teams",
            source: "market",
            confidence: "high",
          },
          {
            text: "Series E at $12.5B — profitable and investing in enterprise GTM",
            source: "funding",
            confidence: "high",
          },
        ],
      },
      territory: {
        score: 88,
        verdict: "Enterprise Fortune 500 still largely Adobe — massive greenfield",
        signals: [
          {
            text: "Enterprise AE team tripling — Fortune 500 logos unpenetrated",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "APAC design hub hiring in Tokyo and Sydney",
            source: "linkedin",
            confidence: "medium",
          },
          {
            text: "FigJam and developer seats creating multi-stakeholder expansion plays",
            source: "community",
            confidence: "high",
          },
        ],
      },
      talent: {
        score: 92,
        verdict: "71% attainment with premium comp",
        signals: [
          {
            text: "OTE $190K–$270K with RSUs at premium valuation",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "400+ GTM with world-class enablement — reps cite best sales culture they've seen",
            source: "community",
            confidence: "high",
          },
          {
            text: "Dedicated SE and design ops teams on every enterprise deal",
            source: "linkedin",
            confidence: "medium",
          },
        ],
      },
    },
    financials: {
      score: 88,
      revenue: "$600M+ ARR",
      funding: "$330M total raised",
      runway: "N/A (profitable)",
      growthRate: "40% YoY",
      lastRound: "Series E ($200M at $12.5B, 2024)",
      investors: ["Andreessen Horowitz", "Kleiner Perkins", "Index Ventures"],
    },
    pmf: {
      score: 96,
      nps: 72,
      retention: "140%+ net dollar retention",
      marketGrowth: "Design tools market growing 11% CAGR",
      competitivePosition: "Dominant market leader",
      signals: [
        "4M+ users and growing",
        "Replaced Adobe tools for most startups",
        "Strong network effects",
        "Expanding from design into full product development",
      ],
    },
    packages: {
      score: 90,
      baseSalary: "$95K–$135K",
      ote: "$190K–$270K",
      equity: "RSUs at premium valuation",
      benefits: [
        "Generous PTO",
        "Health/dental/vision",
        "401k match",
        "Home office stipend",
      ],
      quota: "$550K–$850K ARR",
      quotaAttainment: "71% of reps hit quota",
    },
    hiringRoles: ["Enterprise AE", "Mid-Market AE", "SDR", "SE"],
    gtmTeamSize: "400+",
  },
  {
    slug: "mercury",
    name: "Mercury",
    logo: "https://logo.clearbit.com/mercury.com",
    description:
      "Business banking platform built for startups, offering checking, savings, and financial workflows.",
    industry: "Fintech / Banking",
    stage: "Series C",
    headcount: "850+",
    hq: "San Francisco, CA",
    founded: 2017,
    website: "https://mercury.com",
    sellsItself:
      "200K+ startups already bank with Mercury — reps cross-sell treasury, credit, and spend into a warm book. YC network means referrals flow in.",
    expandingRegions: ["US Mid-Market"],
    threeTs: {
      timing: {
        score: 84,
        verdict: "Startup banking + treasury expansion at Series C",
        signals: [
          {
            text: "Series C ($120M at $3.5B, 2024) with credit and treasury product launches",
            source: "funding",
            confidence: "high",
          },
          {
            text: "Startup banking market growing 25% CAGR — every new company needs a bank",
            source: "market",
            confidence: "high",
          },
          {
            text: "SVB aftermath still driving startup bank-switching — one-time tailwind",
            source: "community",
            confidence: "medium",
          },
        ],
      },
      territory: {
        score: 76,
        verdict: "Moving upmarket but US-centric",
        signals: [
          {
            text: "Mid-market AE roles opening for 500+ employee companies — new segment",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "Treasury and credit products have dedicated AE pods — cross-sell territory",
            source: "hiring",
            confidence: "medium",
          },
          {
            text: "No APAC GTM yet — international expansion still ahead",
            source: "linkedin",
            confidence: "high",
          },
        ],
      },
      talent: {
        score: 83,
        verdict: "67% attainment, lean but well-supported team",
        signals: [
          {
            text: "120+ GTM with partnerships motion feeding warm leads",
            source: "hiring",
            confidence: "high",
          },
          {
            text: "High-growth equity at $3.5B — meaningful upside for early GTM hires",
            source: "funding",
            confidence: "medium",
          },
          {
            text: "YC network referrals mean reps spend time closing, not prospecting",
            source: "community",
            confidence: "high",
          },
        ],
      },
    },
    financials: {
      score: 80,
      revenue: "$200M+ ARR",
      funding: "$163M total raised",
      runway: "24+ months",
      growthRate: "60% YoY",
      lastRound: "Series C ($120M at $3.5B, 2024)",
      investors: ["Sequoia Capital", "Andreessen Horowitz", "CRV"],
    },
    pmf: {
      score: 85,
      nps: 70,
      retention: "115% net dollar retention",
      marketGrowth: "Neobank market growing 25% CAGR",
      competitivePosition: "Leading startup banking platform",
      signals: [
        "Over 200K startup accounts",
        "Expanding into credit and treasury products",
        "Strong product-led growth via YC network",
        "Building full financial stack for startups",
      ],
    },
    packages: {
      score: 83,
      baseSalary: "$80K–$110K",
      ote: "$160K–$220K",
      equity: "Options with high-growth potential",
      benefits: [
        "Health/dental/vision",
        "Flexible PTO",
        "Remote-friendly",
        "Team offsites",
      ],
      quota: "$400K–$650K ARR",
      quotaAttainment: "67% of reps hit quota",
    },
    hiringRoles: ["Mid-Market AE", "SDR", "Partnerships Manager"],
    gtmTeamSize: "120+",
  },
  ] as Omit<Company, "gravyTrainScore" | "gravyTrainVerdict">[]
).map(withGravyTrain);

export const scenarios: Scenario[] = [
  {
    id: "1",
    title: "Sell Datadog Monitoring to a VP of Engineering",
    description:
      "You're an AE at Datadog cold calling a VP of Engineering at a Series C fintech company that's scaling fast and experiencing reliability issues.",
    company: "datadog",
    targetRole: "VP of Engineering",
    targetCompany: "A Series C fintech (500 employees)",
    difficulty: "intermediate",
    objectives: [
      "Book a discovery call",
      "Understand their current observability stack",
      "Position Datadog as the unified platform",
    ],
    talkingPoints: [
      "Unified monitoring across infrastructure, APM, and logs",
      "Real-time alerting reduces MTTR by 60%",
      "800+ integrations with existing tech stack",
      "SOC 2 and HIPAA compliance built-in for fintech needs",
    ],
    objections: [
      "We already use Prometheus and Grafana — it's free",
      "We don't have budget for another tool right now",
      "Our team is too busy to migrate monitoring systems",
      "We've looked at Datadog before, it's too expensive",
    ],
    successCriteria: [
      "Successfully identify 2–3 pain points",
      "Handle at least one objection effectively",
      "Secure agreement for a follow-up meeting",
      "Keep the call under 5 minutes",
    ],
  },
  {
    id: "2",
    title: "Sell Gong to a CRO at a Mid-Market SaaS",
    description:
      "You're an Enterprise AE at Gong reaching out to a CRO whose sales team is missing quota and struggling with pipeline visibility.",
    company: "gong",
    targetRole: "Chief Revenue Officer",
    targetCompany: "A mid-market SaaS company (300 employees)",
    difficulty: "advanced",
    objectives: [
      "Connect pipeline visibility to revenue impact",
      "Demonstrate how Gong surfaces deal risk",
      "Position against Chorus/Clari alternatives",
    ],
    talkingPoints: [
      "AI-powered deal intelligence identifies at-risk deals early",
      "Coaching insights help ramp new reps 40% faster",
      "Forecasting accuracy improves by 20%+ with Gong",
      "Integration with Salesforce for seamless workflow",
    ],
    objections: [
      "We already use Chorus and it's good enough",
      "Our reps don't want to be recorded",
      "We need to focus on hiring, not tools right now",
      "How is this different from what Salesforce already offers?",
    ],
    successCriteria: [
      "Tie revenue impact to specific pain points",
      "Differentiate from competitors with concrete examples",
      "Get commitment for a pilot or POC",
      "Build champion relationship with the CRO",
    ],
  },
  {
    id: "3",
    title: "Sell Rippling to a Head of People at a Startup",
    description:
      "You're an SMB AE at Rippling cold calling a Head of People at a 100-person startup that's using Gusto and struggling to manage IT and HR in separate systems.",
    company: "rippling",
    targetRole: "Head of People",
    targetCompany: "A seed-stage startup (100 employees)",
    difficulty: "beginner",
    objectives: [
      "Identify pain with fragmented HR/IT tooling",
      "Show how Rippling unifies the employee lifecycle",
      "Position the cost savings of consolidation",
    ],
    talkingPoints: [
      "One system for HR, IT, and Finance — no more tool sprawl",
      "Automate onboarding: laptop, apps, payroll in 90 seconds",
      "Save 20+ hours/month on manual admin work",
      "Custom workflows and policies without engineering help",
    ],
    objections: [
      "Gusto works fine for our size",
      "We can't afford to switch systems during a hiring freeze",
      "Our IT person handles device management manually, it's fine",
      "We're too small to need something this complex",
    ],
    successCriteria: [
      "Identify at least 2 pain points with current tooling",
      "Quantify time/cost savings clearly",
      "Handle the 'we're too small' objection",
      "Book a demo with the decision maker",
    ],
  },
  {
    id: "4",
    title: "Sell Clay to a VP of Sales at a Growth-Stage Company",
    description:
      "You're an AE at Clay reaching out to a VP of Sales who's frustrated with the quality of outbound leads and low reply rates from their SDR team.",
    company: "clay",
    targetRole: "VP of Sales",
    targetCompany: "A Series B SaaS company (200 employees)",
    difficulty: "intermediate",
    objectives: [
      "Diagnose the root cause of low outbound conversion",
      "Show how data enrichment improves targeting",
      "Demonstrate Clay's workflow automation capabilities",
    ],
    talkingPoints: [
      "Enrich leads from 75+ data sources in one workflow",
      "AI-powered personalization at scale — not just mail merge",
      "Customers see 3–5x improvement in reply rates",
      "Replaces manual research and multiple point solutions",
    ],
    objections: [
      "We already use ZoomInfo for data",
      "Our SDRs can do manual research — that's their job",
      "We've tried enrichment tools before, data quality was bad",
      "How do I know this will actually improve reply rates?",
    ],
    successCriteria: [
      "Connect data quality to pipeline and revenue metrics",
      "Position Clay as a platform, not just a data vendor",
      "Handle the 'we already use ZoomInfo' objection",
      "Secure a pilot or trial commitment",
    ],
  },
  {
    id: "5",
    title: "Sell Vanta to a CTO at a Health-Tech Startup",
    description:
      "You're a Mid-Market AE at Vanta cold calling a CTO at a health-tech startup that needs HIPAA compliance to close enterprise deals but hasn't started the process.",
    company: "vanta",
    targetRole: "CTO",
    targetCompany: "A Series A health-tech startup (50 employees)",
    difficulty: "beginner",
    objectives: [
      "Create urgency around compliance as a sales enabler",
      "Show how Vanta automates the audit process",
      "Position compliance as a competitive advantage",
    ],
    talkingPoints: [
      "Get HIPAA compliant in weeks, not months",
      "Automated evidence collection saves 90% of audit prep time",
      "Compliance as a trust signal closes enterprise deals faster",
      "Continuous monitoring — not just point-in-time audits",
    ],
    objections: [
      "We'll deal with compliance when we're bigger",
      "Can't our lawyers and a consultant handle this?",
      "HIPAA compliance seems too expensive for our stage",
      "We're not losing deals because of compliance — yet",
    ],
    successCriteria: [
      "Create urgency by tying compliance to revenue opportunity",
      "Quantify the cost of manual compliance vs. Vanta",
      "Handle the 'we'll do it later' objection",
      "Get a follow-up scheduled with the CEO or COO",
    ],
  },
  {
    id: "6",
    title: "Sell Figma to a Design Director at an Enterprise",
    description:
      "You're an Enterprise AE at Figma approaching a Design Director at a Fortune 500 company still using Adobe XD and Sketch across different teams with no unified design system.",
    company: "figma",
    targetRole: "Design Director",
    targetCompany: "A Fortune 500 retail company (10,000+ employees)",
    difficulty: "advanced",
    objectives: [
      "Highlight the cost of fragmented design tools",
      "Show how Figma enables real-time collaboration at scale",
      "Build a business case for standardization",
    ],
    talkingPoints: [
      "Real-time multiplayer editing eliminates version control chaos",
      "Design systems in Figma ensure brand consistency across teams",
      "Browser-based — no downloads, instant access for stakeholders",
      "FigJam for workshops and brainstorming with cross-functional teams",
    ],
    objections: [
      "We have Adobe Creative Cloud enterprise licenses already",
      "Switching 200 designers is a massive change management project",
      "Security team needs to review browser-based tools",
      "We just invested in a design system in Sketch — can't switch now",
    ],
    successCriteria: [
      "Quantify productivity gains from real-time collaboration",
      "Address security and enterprise compliance concerns",
      "Propose a phased rollout plan starting with one team",
      "Identify an internal champion to drive adoption",
    ],
  },
];

export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

export function getScenariosByCompany(companySlug: string): Scenario[] {
  return scenarios.filter((s) => s.company === companySlug);
}

export function getResearchForCompany(company: Company): CompanyResearch {
  let research =
    getEnrichedResearch(company.slug) ?? buildResearchFromCompany(company);

  const repvue = getCachedRepvueProfile(company.slug);
  if (repvue) {
    research = mergeRepvueIntoResearch(research, repvue);
  }

  const exa = getCachedExaSignals(company.slug);
  if (exa) {
    research = mergeExaIntoResearch(research, exa);
  }

  return research;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-50 border-emerald-200";
  if (score >= 80) return "bg-blue-50 border-blue-200";
  if (score >= 70) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  return "Fair";
}
