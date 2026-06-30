import { GravyTrainVerdict, SignalSource, ThreeTs } from "./types";

export const THREE_T_WEIGHTS = {
  timing: 0.5,
  territory: 0.3,
  talent: 0.2,
} as const;

export const THREE_T_ORDER = ["timing", "territory", "talent"] as const;

export const THREE_T_META = {
  timing: {
    label: "Timing",
    order: 1,
    tagline: "Is the market pulling the product right now?",
    description:
      "Funding rounds, category tailwinds, regulatory shifts, and buying urgency. Timing is the biggest lever — a great rep on bad timing still loses.",
    icon: "clock",
  },
  territory: {
    label: "Territory",
    order: 2,
    tagline: "Is there greenfield for you to run?",
    description:
      "APAC expansion, new segments, fresh product lines, and under-penetrated accounts. The best territories feel like you're the first AE in the room.",
    icon: "map",
  },
  talent: {
    label: "Talent",
    order: 3,
    tagline: "Is the company investing in you winning?",
    description:
      "GTM headcount growth, enablement, comp plans, and manager quality. Talent matters — but only after timing and territory are right.",
    icon: "users",
  },
} as const;

export const SIGNAL_SOURCE_LABELS: Record<SignalSource, string> = {
  linkedin: "LinkedIn activity",
  hiring: "Hiring signals",
  funding: "Funding & news",
  market: "Market data",
  community: "Coffee chats",
};

export function computeGravyTrainScore(threeTs: ThreeTs): number {
  const { timing, territory, talent } = threeTs;
  return Math.round(
    timing.score * THREE_T_WEIGHTS.timing +
      territory.score * THREE_T_WEIGHTS.territory +
      talent.score * THREE_T_WEIGHTS.talent
  );
}

export function getGravyTrainVerdict(score: number): GravyTrainVerdict {
  if (score >= 90) return "On the gravy train";
  if (score >= 80) return "Building momentum";
  if (score >= 70) return "Watch closely";
  return "Too early";
}

export function getGravyTrainColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}

export function getGravyTrainBg(score: number): string {
  if (score >= 90) return "bg-emerald-50 border-emerald-200";
  if (score >= 80) return "bg-blue-50 border-blue-200";
  if (score >= 70) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function getGravyTrainBadgeVariant(
  verdict: GravyTrainVerdict
): "default" | "secondary" | "outline" | "destructive" {
  switch (verdict) {
    case "On the gravy train":
      return "default";
    case "Building momentum":
      return "secondary";
    case "Watch closely":
      return "outline";
    case "Too early":
      return "destructive";
  }
}
