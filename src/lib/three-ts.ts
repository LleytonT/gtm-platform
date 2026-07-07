import { SignalSource } from "./types";

export const THREE_T_ORDER = ["timing", "territory", "talent"] as const;

export const THREE_T_META = {
  timing: {
    label: "Timing",
    order: 1,
    tagline: "Is the market pulling the product right now?",
    description:
      "Funding recency and size (curated records with press sources) blended with GTM hiring momentum from public job boards. Timing is the biggest lever — a great rep on bad timing still loses.",
    icon: "clock",
  },
  territory: {
    label: "Territory",
    order: 2,
    tagline: "Is there greenfield for you to run?",
    description:
      "Regional balance of open GTM postings across AMER/EMEA/APAC/ANZ from public job boards, plus new-market signals like a first AU posting. The best territories feel like you're the first AE in the room.",
    icon: "map",
  },
  talent: {
    label: "Talent",
    order: 3,
    tagline: "Is the company investing in you winning?",
    description:
      "Verified rep ratings (RepVue), team tenure and promotion data from licensed people-data providers, and community-submitted quota reality. Talent matters — but only after timing and territory are right.",
    icon: "users",
  },
} as const;

export const SIGNAL_SOURCE_LABELS: Record<SignalSource, string> = {
  people_data: "Licensed people data",
  hiring: "Hiring signals",
  funding: "Funding & news",
  market: "Market data",
  community: "Community submissions",
};
