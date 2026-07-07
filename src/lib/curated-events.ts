import { SourceRecord } from "./provenance";
import { ThreeTKey } from "./types";

export type CuratedEventType =
  | "funding"
  | "hiring"
  | "expansion"
  | "leadership"
  | "product"
  | "contraction";

/**
 * Manually curated company events. Each event carries a source record and is
 * clearly dated. Negative events within the last 12 months apply a scoring
 * penalty to the dimensions they feed (see /methodology for the exact rule).
 */
export interface CuratedEvent {
  id: string;
  date: string;
  companySlug: string;
  companyName: string;
  type: CuratedEventType;
  headline: string;
  detail: string;
  impact: "positive" | "neutral" | "negative";
  feedsThreeT: ThreeTKey[];
  source: SourceRecord;
}

function pressSource(query: string, retrievedAt: string): SourceRecord {
  return {
    source_name: "Press coverage (curated)",
    url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
    retrieved_at: retrievedAt,
    confidence: "medium",
    method: "manual",
  };
}

const curatedEvents: CuratedEvent[] = [
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
    source: pressSource("Vercel Series G funding", "2025-09-16T00:00:00.000Z"),
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
    source: pressSource("Cursor Anysphere $900M funding", "2025-06-06T00:00:00.000Z"),
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
    source: pressSource("OpenAI $40B funding round", "2025-04-01T00:00:00.000Z"),
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
    source: pressSource("Anthropic Series E $3.5B", "2025-03-04T00:00:00.000Z"),
  },
  {
    id: "databricks-series-i",
    date: "2024-12-17",
    companySlug: "databricks",
    companyName: "Databricks",
    type: "funding",
    headline: "Databricks raises $10B Series J at $62B valuation",
    detail:
      "Data + AI platform crossing $3B ARR — consumption model driving massive expansion revenue for AEs.",
    impact: "positive",
    feedsThreeT: ["timing", "territory"],
    source: pressSource("Databricks $10B funding", "2024-12-18T00:00:00.000Z"),
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
    source: pressSource("Harvey AI Series C $300M", "2025-02-13T00:00:00.000Z"),
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
    source: pressSource("Sierra AI $175M funding", "2025-01-29T00:00:00.000Z"),
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
    source: pressSource("Gong APAC layoffs 2025", "2025-08-21T00:00:00.000Z"),
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
    source: pressSource("Meta Scale AI investment", "2025-06-13T00:00:00.000Z"),
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
    source: pressSource("Mistral AI €600M funding", "2025-06-25T00:00:00.000Z"),
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
    source: pressSource("Rippling Series G $16.8B", "2025-04-23T00:00:00.000Z"),
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
    source: pressSource("AWS enterprise sales hiring 2025", "2025-10-02T00:00:00.000Z"),
  },
];

export function getCuratedEvents(): CuratedEvent[] {
  return curatedEvents;
}

export function getEventsForCompany(slug: string): CuratedEvent[] {
  return curatedEvents.filter((e) => e.companySlug === slug);
}
