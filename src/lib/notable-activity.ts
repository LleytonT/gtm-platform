import { NotableActivity } from "./types";

export const notableActivities: NotableActivity[] = [
  {
    id: "vercel-series-g",
    date: "2025-09-15",
    companySlug: "vercel",
    companyName: "Vercel",
    type: "funding",
    headline: "Vercel raises $300M Series G at $9.3B valuation",
    detail:
      "Front-end cloud leader doubles down on AI SDK and v0 — signals aggressive GTM expansion in enterprise developer tools.",
    impact: "positive",
    feedsThreeT: ["timing", "territory"],
  },
  {
    id: "cursor-series-c",
    date: "2025-06-05",
    companySlug: "cursor",
    companyName: "Cursor (Anysphere)",
    type: "funding",
    headline: "Cursor raises $900M at $9.9B valuation",
    detail:
      "AI coding tool hits $500M+ ARR — one of the fastest GTM ramps in enterprise software history.",
    impact: "positive",
    feedsThreeT: ["timing", "talent"],
  },
  {
    id: "openai-series-f",
    date: "2025-03-31",
    companySlug: "openai",
    companyName: "OpenAI",
    type: "funding",
    headline: "OpenAI closes $40B round at $300B valuation",
    detail:
      "Largest private funding round ever — enterprise sales org scaling to capture ChatGPT Enterprise demand globally.",
    impact: "positive",
    feedsThreeT: ["timing", "territory"],
  },
  {
    id: "anthropic-series-e",
    date: "2025-03-03",
    companySlug: "anthropic",
    companyName: "Anthropic",
    type: "funding",
    headline: "Anthropic raises $3.5B Series E at $61.5B valuation",
    detail:
      "Claude enterprise adoption accelerating — new VP Sales hires across AMER and EMEA.",
    impact: "positive",
    feedsThreeT: ["timing", "talent"],
  },
  {
    id: "databricks-series-i",
    date: "2024-12-17",
    companySlug: "databricks",
    companyName: "Databricks",
    type: "funding",
    headline: "Databricks raises $10B Series I at $62B valuation",
    detail:
      "Data + AI platform crossing $3B ARR — consumption model driving massive expansion revenue for AEs.",
    impact: "positive",
    feedsThreeT: ["timing", "territory"],
  },
  {
    id: "harvey-series-c",
    date: "2025-02-12",
    companySlug: "harvey",
    companyName: "Harvey",
    type: "funding",
    headline: "Harvey raises $300M Series C at $3B valuation",
    detail:
      "Legal AI expanding from BigLaw to mid-market — new enterprise AE pods in NYC and London.",
    impact: "positive",
    feedsThreeT: ["timing", "territory"],
  },
  {
    id: "sierra-series-b",
    date: "2025-01-28",
    companySlug: "sierra",
    companyName: "Sierra",
    type: "funding",
    headline: "Sierra raises $175M at $4.5B valuation",
    detail:
      "Bret Taylor's AI customer service startup — enterprise GTM led by ex-Salesforce leaders.",
    impact: "positive",
    feedsThreeT: ["timing", "talent"],
  },
  {
    id: "gong-apac-contraction",
    date: "2025-08-20",
    companySlug: "gong",
    companyName: "Gong",
    type: "contraction",
    headline: "Gong reduces APAC GTM headcount ~15%",
    detail:
      "AMER team still growing while APAC sees layoffs — regional imbalance signal for territory diligence.",
    impact: "negative",
    feedsThreeT: ["territory"],
  },
  {
    id: "scale-ai-meta-deal",
    date: "2025-06-12",
    companySlug: "scale-ai",
    companyName: "Scale AI",
    type: "leadership",
    headline: "Meta invests $14.3B in Scale AI, CEO joins Meta",
    detail:
      "Major strategic shift — Scale's independent GTM trajectory now tied to Meta's AI infrastructure bets.",
    impact: "neutral",
    feedsThreeT: ["timing", "talent"],
  },
  {
    id: "mistral-series-c",
    date: "2025-06-24",
    companySlug: "mistral-ai",
    companyName: "Mistral AI",
    type: "funding",
    headline: "Mistral raises €600M at €5.8B valuation",
    detail:
      "European AI champion building enterprise sales motion — new offices in London and NYC.",
    impact: "positive",
    feedsThreeT: ["timing", "territory"],
  },
  {
    id: "rippling-series-f",
    date: "2025-04-22",
    companySlug: "rippling",
    companyName: "Rippling",
    type: "funding",
    headline: "Rippling raises $450M at $16.8B valuation",
    detail:
      "HR + IT platform adding 200+ GTM hires — platform consolidation play gaining enterprise traction.",
    impact: "positive",
    feedsThreeT: ["timing", "territory", "talent"],
  },
  {
    id: "aws-enterprise-hiring",
    date: "2025-10-01",
    companySlug: "aws",
    companyName: "AWS",
    type: "hiring",
    headline: "AWS adds 500+ enterprise AE roles globally",
    detail:
      "Hyperscaler doubling down on AI workload migrations — greenfield territory for cloud infrastructure sellers.",
    impact: "positive",
    feedsThreeT: ["territory", "talent"],
  },
];

export function getActivitiesForCompany(slug: string): NotableActivity[] {
  return notableActivities.filter((a) => a.companySlug === slug);
}
