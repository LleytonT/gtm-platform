import type { MetricSource } from "./provenance";

/**
 * P1.9 — two fields that used to be conflated:
 *
 * - productPricingModel: how the product is priced (public pricing pages).
 * - repCompModel: how reps are actually compensated. This can ONLY come
 *   from human submissions; it defaults to "unknown" and is never inferred
 *   from the pricing model.
 */

export type ProductPricingModel = "seat" | "usage" | "outcome" | "hybrid";
export type RepCompModel = "booking" | "consumption" | "hybrid" | "unknown";

export const PRODUCT_PRICING_LABELS: Record<ProductPricingModel, string> = {
  seat: "Seat-based pricing",
  usage: "Usage-based pricing",
  outcome: "Outcome-based pricing",
  hybrid: "Hybrid pricing",
};

export const REP_COMP_LABELS: Record<RepCompModel, string> = {
  booking: "Booking-based comp",
  consumption: "Consumption-based comp",
  hybrid: "Hybrid comp",
  unknown: "Comp model unknown",
};

export interface PricingRecord {
  model: ProductPricingModel;
  sources: MetricSource[];
}

const CURATED_AT = "2026-07-07";

function pricingSource(url: string): MetricSource[] {
  return [
    {
      source_name: "Public pricing page",
      url,
      retrieved_at: CURATED_AT,
      confidence: "medium",
      method: "manual",
      note: "Read from the company's public pricing page by an analyst",
    },
  ];
}

/**
 * Product pricing models read from public pricing pages.
 * Companies without a verified entry render as "insufficient data".
 */
const PRODUCT_PRICING: Record<string, PricingRecord> = {
  datadog: { model: "usage", sources: pricingSource("https://www.datadoghq.com/pricing/") },
  gong: { model: "seat", sources: pricingSource("https://www.gong.io/pricing/") },
  rippling: { model: "seat", sources: pricingSource("https://www.rippling.com/pricing") },
  notion: { model: "seat", sources: pricingSource("https://www.notion.com/pricing") },
  clay: { model: "usage", sources: pricingSource("https://www.clay.com/pricing") },
  vanta: { model: "hybrid", sources: pricingSource("https://www.vanta.com/pricing") },
  figma: { model: "seat", sources: pricingSource("https://www.figma.com/pricing/") },
  mercury: { model: "hybrid", sources: pricingSource("https://mercury.com/pricing") },
  openai: { model: "usage", sources: pricingSource("https://openai.com/api/pricing/") },
  anthropic: { model: "usage", sources: pricingSource("https://www.anthropic.com/pricing") },
  cursor: { model: "hybrid", sources: pricingSource("https://cursor.com/pricing") },
  databricks: { model: "usage", sources: pricingSource("https://www.databricks.com/product/pricing") },
  glean: { model: "seat", sources: pricingSource("https://www.glean.com/pricing") },
  "mistral-ai": { model: "usage", sources: pricingSource("https://mistral.ai/pricing") },
  perplexity: { model: "hybrid", sources: pricingSource("https://www.perplexity.ai/pro") },
  cohere: { model: "usage", sources: pricingSource("https://cohere.com/pricing") },
  runway: { model: "usage", sources: pricingSource("https://runwayml.com/pricing") },
  elevenlabs: { model: "usage", sources: pricingSource("https://elevenlabs.io/pricing") },
  "hugging-face": { model: "usage", sources: pricingSource("https://huggingface.co/pricing") },
  "together-ai": { model: "usage", sources: pricingSource("https://www.together.ai/pricing") },
  deepl: { model: "hybrid", sources: pricingSource("https://www.deepl.com/pro") },
  vercel: { model: "usage", sources: pricingSource("https://vercel.com/pricing") },
  aws: { model: "usage", sources: pricingSource("https://aws.amazon.com/pricing/") },
  "microsoft-azure": { model: "usage", sources: pricingSource("https://azure.microsoft.com/pricing/") },
  "google-cloud": { model: "usage", sources: pricingSource("https://cloud.google.com/pricing") },
  "oracle-cloud": { model: "usage", sources: pricingSource("https://www.oracle.com/cloud/costestimator.html") },
  "ibm-cloud": { model: "hybrid", sources: pricingSource("https://www.ibm.com/cloud/pricing") },
};

export function getProductPricing(slug: string): PricingRecord | null {
  return PRODUCT_PRICING[slug] ?? null;
}
