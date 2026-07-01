import type { Company, CompanyResearch, ResearchFinding } from "@/lib/types";
import { getRepvueProfileUrl } from "./slugs";
import {
  formatCompSummary,
  getIncentiveCompPercentile,
  getProductMarketFitPercentile,
} from "./parser";
import type { RepVueProfile } from "./types";

function money(value: number): string {
  return `$${Math.round(value / 1000)}K`;
}

function scoreFromRepvue(profile: RepVueProfile): number {
  const base = profile.repvueScore ?? 70;
  const incentive = getIncentiveCompPercentile(profile);
  const pmf = getProductMarketFitPercentile(profile);
  const bonus =
    (incentive != null ? (incentive - 50) * 0.1 : 0) +
    (pmf != null ? (pmf - 50) * 0.05 : 0);
  return Math.min(99, Math.max(45, Math.round(base * 0.85 + bonus)));
}

function buildFindings(profile: RepVueProfile): ResearchFinding[] {
  const findings: ResearchFinding[] = [];

  if (profile.repvueScore != null) {
    const percentile =
      profile.overallPercentile != null
        ? ` — ${profile.overallPercentile}th percentile overall`
        : "";
    findings.push({
      text: `RepVue Score: ${profile.repvueScore}${percentile} (${profile.totalRatings ?? 0} ratings, ${profile.verifiedPercent ?? 0}% verified)`,
      sentiment:
        profile.repvueScore >= 85
          ? "positive"
          : profile.repvueScore >= 70
            ? "neutral"
            : "red_flag",
      confidence: (profile.totalRatings ?? 0) >= 100 ? "high" : "medium",
      feedsThreeT: ["talent"],
    });
  }

  const pmf = getProductMarketFitPercentile(profile);
  if (pmf != null) {
    findings.push({
      text: `Product–Market Fit: ${pmf}th percentile among software orgs on RepVue`,
      sentiment: pmf >= 80 ? "positive" : pmf >= 60 ? "neutral" : "red_flag",
      confidence: "high",
      feedsThreeT: ["timing", "talent"],
    });
  }

  const incentive = getIncentiveCompPercentile(profile);
  if (incentive != null) {
    findings.push({
      text: `Incentive comp structure: ${incentive}th percentile — ${incentive >= 70 ? "plans appear achievable" : incentive >= 50 ? "mixed signals on plan design" : "below median vs peers"}`,
      sentiment:
        incentive >= 70 ? "positive" : incentive >= 50 ? "neutral" : "red_flag",
      confidence: "medium",
      feedsThreeT: ["talent"],
    });
  }

  const compSummary = formatCompSummary(profile);
  if (compSummary) {
    findings.push({
      text: `AE compensation (RepVue verified): ${compSummary}`,
      sentiment: "neutral",
      confidence: "high",
      feedsThreeT: ["talent"],
    });
  }

  const inbound = profile.categoryRankings.find((c) =>
    /inbound lead/i.test(c.category)
  );
  if (inbound) {
    findings.push({
      text: `Inbound lead flow: ${inbound.percentile}th percentile — ${inbound.percentile >= 75 ? "strong top-of-funnel" : inbound.percentile >= 50 ? "average demand gen" : "mostly outbound grind"}`,
      sentiment:
        inbound.percentile >= 75
          ? "positive"
          : inbound.percentile >= 50
            ? "neutral"
            : "red_flag",
      confidence: "medium",
      feedsThreeT: ["timing", "territory"],
    });
  }

  if (!profile.quotaAttainmentPublic) {
    findings.push({
      text: "Quota attainment % is member-only on RepVue — validate on calls or join RepVue for the exact figure",
      sentiment: "neutral",
      confidence: "emerging",
      feedsThreeT: ["talent"],
    });
  }

  if (profile.trend && profile.trend !== "flat") {
    findings.push({
      text: `RepVue 6-month trend: ${profile.trend.replace(/_/g, " ")}`,
      sentiment: profile.trend.includes("down") ? "red_flag" : "positive",
      confidence: "medium",
      feedsThreeT: ["talent"],
    });
  }

  return findings;
}

function buildHeadline(profile: RepVueProfile): string {
  const score = profile.repvueScore;
  const pmf = getProductMarketFitPercentile(profile);
  if (score != null && pmf != null) {
    return `RepVue: ${score} score, PMF ${pmf}th percentile`;
  }
  if (score != null) {
    return `RepVue score ${score} from verified sales ratings`;
  }
  return "Live RepVue data";
}

export function mergeRepvueIntoResearch(
  research: CompanyResearch,
  profile: RepVueProfile
): CompanyResearch {
  const findings = buildFindings(profile);
  const existing = research.lenses.review_sites;
  const score = scoreFromRepvue(profile);

  return {
    ...research,
    diligenceScore: Math.round((research.diligenceScore + score) / 2),
    lenses: {
      ...research.lenses,
      review_sites: {
        ...existing,
        score,
        headline: buildHeadline(profile),
        findings: [...findings, ...existing.findings].slice(0, 8),
        resources: [
          {
            label: `${profile.name} on RepVue`,
            url: getRepvueProfileUrl(profile.repvueSlug),
          },
          ...(existing.resources ?? []),
        ],
      },
    },
  };
}

export function enrichCompanyPackagesFromRepvue(
  company: Company,
  profile: RepVueProfile
): Company["packages"] {
  const ae =
    profile.compensation.find((r) => /^account executive$/i.test(r.role)) ??
    profile.compensation.find((r) => /account executive/i.test(r.role));

  if (!ae?.oteUpTo) return company.packages;

  return {
    ...company.packages,
    baseSalary: ae.baseUpTo ? money(ae.baseUpTo) : company.packages.baseSalary,
    ote: money(ae.oteUpTo),
  };
}
