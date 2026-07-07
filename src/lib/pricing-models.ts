import { SourceRecord } from "./provenance";

/**
 * Product pricing model — how the COMPANY charges customers.
 * Sourced exclusively from public pricing pages. Not to be confused with
 * rep_comp_model (how REPS are paid), which comes from human submissions only.
 */
export type ProductPricingModel =
  | "seat"
  | "usage"
  | "outcome"
  | "hybrid"
  | "unknown";

export type RepCompModel = "booking" | "consumption" | "hybrid" | "unknown";

export const PRODUCT_PRICING_LABELS: Record<ProductPricingModel, string> = {
  seat: "Seat-based pricing",
  usage: "Usage-based pricing",
  outcome: "Outcome-based pricing",
  hybrid: "Hybrid pricing",
  unknown: "Pricing model unknown",
};

export const REP_COMP_LABELS: Record<RepCompModel, string> = {
  booking: "Booking-based comp",
  consumption: "Consumption-based comp",
  hybrid: "Hybrid comp",
  unknown: "Comp model unknown",
};

interface PricingEntry {
  model: Exclude<ProductPricingModel, "unknown">;
  pricingUrl: string;
}

const CURATED_AT = "2026-07-01T00:00:00.000Z";

/**
 * Curated from public pricing pages. Companies not listed report "unknown".
 */
const PRICING_MODELS: Record<string, PricingEntry> = {
  datadog: { model: "usage", pricingUrl: "https://www.datadoghq.com/pricing/" },
  gong: { model: "seat", pricingUrl: "https://www.gong.io/pricing/" },
  rippling: { model: "seat", pricingUrl: "https://www.rippling.com/pricing" },
  notion: { model: "seat", pricingUrl: "https://www.notion.com/pricing" },
  clay: { model: "usage", pricingUrl: "https://www.clay.com/pricing" },
  vanta: { model: "seat", pricingUrl: "https://www.vanta.com/pricing" },
  figma: { model: "seat", pricingUrl: "https://www.figma.com/pricing/" },
  openai: { model: "hybrid", pricingUrl: "https://openai.com/api/pricing/" },
  anthropic: { model: "usage", pricingUrl: "https://www.anthropic.com/pricing" },
  cursor: { model: "hybrid", pricingUrl: "https://cursor.com/pricing" },
  databricks: { model: "usage", pricingUrl: "https://www.databricks.com/product/pricing" },
  cohere: { model: "usage", pricingUrl: "https://cohere.com/pricing" },
  elevenlabs: { model: "usage", pricingUrl: "https://elevenlabs.io/pricing" },
  deepl: { model: "seat", pricingUrl: "https://www.deepl.com/pro" },
  vercel: { model: "hybrid", pricingUrl: "https://vercel.com/pricing" },
  "together-ai": { model: "usage", pricingUrl: "https://www.together.ai/pricing" },
  "mistral-ai": { model: "usage", pricingUrl: "https://mistral.ai/pricing" },
  aws: { model: "usage", pricingUrl: "https://aws.amazon.com/pricing/" },
  "microsoft-azure": { model: "usage", pricingUrl: "https://azure.microsoft.com/pricing/" },
  "google-cloud": { model: "usage", pricingUrl: "https://cloud.google.com/pricing" },
  "oracle-cloud": { model: "usage", pricingUrl: "https://www.oracle.com/cloud/pricing/" },
  "ibm-cloud": { model: "usage", pricingUrl: "https://www.ibm.com/cloud/pricing" },
};

export function getProductPricingModel(slug: string): {
  model: ProductPricingModel;
  source: SourceRecord | null;
} {
  const entry = PRICING_MODELS[slug];
  if (!entry) return { model: "unknown", source: null };
  return {
    model: entry.model,
    source: {
      source_name: "Public pricing page",
      url: entry.pricingUrl,
      retrieved_at: CURATED_AT,
      confidence: "high",
      method: "manual",
    },
  };
}
