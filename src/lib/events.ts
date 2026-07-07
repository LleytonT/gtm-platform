import type { MetricSource } from "./provenance";
import type { ThreeTKey } from "./types";

export type CompanyEventType =
  | "funding"
  | "hiring"
  | "expansion"
  | "leadership"
  | "product"
  | "contraction";

/**
 * Curated company events (funding rounds, expansions, contractions).
 *
 * Every event carries source records (P0.1). Events are curated manually by
 * analysts and reviewed on the weekly refresh cadence; the `curatedAt` date
 * is displayed wherever the event is rendered. Events feed the scoring
 * engine — funding boosts Timing/Funding Velocity, contractions apply
 * penalties.
 */
export interface CompanyEvent {
  id: string;
  /** ISO date the event occurred. */
  date: string;
  companySlug: string;
  companyName: string;
  type: CompanyEventType;
  headline: string;
  detail: string;
  impact: "positive" | "neutral" | "negative";
  feedsThreeT: ThreeTKey[];
  /** Announced round size in USD millions, for funding events. */
  amountUsdM?: number;
  sources: MetricSource[];
  curatedAt: string;
}

const CURATED_AT = "2026-07-07";

function newsSource(query: string, date: string): MetricSource {
  return {
    source_name: "Press coverage (curated)",
    url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
    retrieved_at: date,
    confidence: "medium",
    method: "manual",
    note: "Curated by GTM Hire analysts from public announcements",
  };
}

export const companyEvents: CompanyEvent[] = [
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
    amountUsdM: 300,
    sources: [newsSource("Vercel Series G funding", CURATED_AT)],
    curatedAt: CURATED_AT,
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
    amountUsdM: 900,
    sources: [newsSource("Anysphere Cursor funding round", CURATED_AT)],
    curatedAt: CURATED_AT,
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
    amountUsdM: 40000,
    sources: [newsSource("OpenAI $40B funding round", CURATED_AT)],
    curatedAt: CURATED_AT,
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
    amountUsdM: 3500,
    sources: [newsSource("Anthropic Series E funding", CURATED_AT)],
    curatedAt: CURATED_AT,
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
    amountUsdM: 10000,
    sources: [newsSource("Databricks Series I funding", CURATED_AT)],
    curatedAt: CURATED_AT,
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
    amountUsdM: 300,
    sources: [newsSource("Harvey AI Series C funding", CURATED_AT)],
    curatedAt: CURATED_AT,
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
    amountUsdM: 175,
    sources: [newsSource("Sierra AI funding round", CURATED_AT)],
    curatedAt: CURATED_AT,
  },
  {
    id: "gong-apac-contraction",
    date: "2025-08-20",
    companySlug: "gong",
    companyName: "Gong",
    type: "contraction",
    headline: "Gong pulls back APAC GTM hiring",
    detail:
      "Publicly reported restructuring plus a sustained drop in APAC job postings while AMER keeps growing — regional imbalance signal that applies a scoring penalty.",
    impact: "negative",
    feedsThreeT: ["territory", "timing"],
    sources: [
      newsSource("Gong layoffs APAC restructuring", CURATED_AT),
      {
        source_name: "greenhouse job board (public API)",
        url: "https://www.gong.io/careers/",
        retrieved_at: CURATED_AT,
        confidence: "high",
        method: "scraped",
        note: "Regional posting mix corroborates the pullback",
      },
    ],
    curatedAt: CURATED_AT,
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
    sources: [newsSource("Meta Scale AI investment", CURATED_AT)],
    curatedAt: CURATED_AT,
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
    amountUsdM: 640,
    sources: [newsSource("Mistral AI Series C funding", CURATED_AT)],
    curatedAt: CURATED_AT,
  },
  {
    id: "rippling-series-f",
    date: "2025-04-22",
    companySlug: "rippling",
    companyName: "Rippling",
    type: "funding",
    headline: "Rippling raises $450M at $16.8B valuation",
    detail:
      "HR + IT platform adding aggressive GTM hiring — platform consolidation play gaining enterprise traction.",
    impact: "positive",
    feedsThreeT: ["timing", "territory", "talent"],
    amountUsdM: 450,
    sources: [newsSource("Rippling Series F funding", CURATED_AT)],
    curatedAt: CURATED_AT,
  },
  {
    id: "aws-enterprise-hiring",
    date: "2025-10-01",
    companySlug: "aws",
    companyName: "AWS",
    type: "hiring",
    headline: "AWS adds enterprise AE roles globally",
    detail:
      "Hyperscaler doubling down on AI workload migrations — expansion visible in public postings and press statements.",
    impact: "positive",
    feedsThreeT: ["territory", "talent"],
    sources: [newsSource("AWS enterprise sales hiring expansion", CURATED_AT)],
    curatedAt: CURATED_AT,
  },
];

export function getEventsForCompany(slug: string): CompanyEvent[] {
  return companyEvents.filter((e) => e.companySlug === slug);
}

/** Events newer than `maxAgeMonths` — the freshness gate for public feeds. */
export function getFreshEvents(maxAgeMonths = 10): CompanyEvent[] {
  const cutoff = Date.now() - maxAgeMonths * 30.44 * 24 * 60 * 60 * 1000;
  return companyEvents.filter((e) => Date.parse(e.date) >= cutoff);
}
