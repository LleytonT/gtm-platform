import type { CompanyResearch, ResearchFinding } from "@/lib/types";
import { scoreFromExaSignals } from "./signals";
import type { ExaCompanySignals } from "./types";

function monthsLabel(months: number): string {
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years} year${years > 1 ? "s" : ""}`;
}

function buildFindings(signals: ExaCompanySignals): ResearchFinding[] {
  const findings: ResearchFinding[] = [];
  const { tenure, hiring, promotions, pedigrees } = signals;

  if (tenure.sampleSize > 0 && tenure.avgMonths != null) {
    const shortRate = Math.round(
      (tenure.under12Months / tenure.sampleSize) * 100
    );
    findings.push({
      text: `Avg GTM tenure: ${monthsLabel(tenure.avgMonths)} across ${tenure.sampleSize} public profiles (${shortRate}% under 12 months)`,
      sentiment:
        tenure.avgMonths >= 18
          ? "positive"
          : tenure.avgMonths >= 12
            ? "neutral"
            : "red_flag",
      confidence: tenure.sampleSize >= 8 ? "high" : "medium",
      feedsThreeT: ["talent"],
    });
  }

  if (hiring.totalCurrentGtm > 0) {
    findings.push({
      text: `${hiring.newHiresLast6Months} GTM hires in last 6 months (${hiring.newHiresLast12Months} in 12mo) — ${hiring.totalCurrentGtm} profiles indexed`,
      sentiment:
        hiring.newHiresLast6Months >= 3
          ? "positive"
          : hiring.newHiresLast6Months >= 1
            ? "neutral"
            : "neutral",
      confidence: "medium",
      feedsThreeT: ["territory", "timing"],
    });
  }

  if (promotions.internalPromotions > 0) {
    const example = promotions.promotionExamples[0];
    findings.push({
      text: example
        ? `Internal progression detected: ${example}${promotions.internalPromotions > 1 ? ` (+${promotions.internalPromotions - 1} more)` : ""}`
        : `${promotions.internalPromotions} internal promotions visible in work history`,
      sentiment: "positive",
      confidence: "medium",
      feedsThreeT: ["talent"],
    });
  }

  if (pedigrees.topPriorEmployers.length > 0) {
    const top = pedigrees.topPriorEmployers
      .slice(0, 3)
      .map((p) => `${p.company} (${p.count})`)
      .join(", ");
    findings.push({
      text: `Top prior employers: ${top}`,
      sentiment: "neutral",
      confidence: "medium",
      feedsThreeT: ["talent", "territory"],
    });
  }

  for (const pedigree of pedigrees.notablePedigrees.slice(0, 2)) {
    findings.push({
      text: `Notable pedigree: ${pedigree}`,
      sentiment: "positive",
      confidence: "medium",
      feedsThreeT: ["talent"],
    });
  }

  if (findings.length === 0) {
    findings.push({
      text: `Limited public LinkedIn profiles found for ${signals.companyName} GTM team — run a manual sweep`,
      sentiment: "neutral",
      confidence: "emerging",
      feedsThreeT: ["talent"],
    });
  }

  return findings;
}

function buildHeadline(signals: ExaCompanySignals): string {
  const parts: string[] = [];
  if (signals.tenure.avgMonths != null) {
    parts.push(`avg tenure ${monthsLabel(signals.tenure.avgMonths)}`);
  }
  if (signals.hiring.newHiresLast6Months > 0) {
    parts.push(`${signals.hiring.newHiresLast6Months} new GTM hires (6mo)`);
  }
  if (signals.promotions.internalPromotions > 0) {
    parts.push(`${signals.promotions.internalPromotions} internal promotions`);
  }
  if (parts.length === 0) {
    return "LinkedIn team signals from Exa";
  }
  return parts.join(" · ");
}

export function mergeExaIntoResearch(
  research: CompanyResearch,
  signals: ExaCompanySignals
): CompanyResearch {
  const findings = buildFindings(signals);
  const existing = research.lenses.team_linkedin;
  const score = scoreFromExaSignals(signals);

  const linkedInSearch = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(signals.companyName + " account executive")}`;

  return {
    ...research,
    diligenceScore: Math.round((research.diligenceScore + score) / 2),
    lenses: {
      ...research.lenses,
      team_linkedin: {
        ...existing,
        score,
        headline: buildHeadline(signals),
        findings: [...findings, ...existing.findings].slice(0, 8),
        resources: [
          {
            label: `${signals.companyName} GTM team on LinkedIn`,
            url: linkedInSearch,
          },
          {
            label: "Data via Exa",
            url: "https://exa.ai",
          },
          ...(existing.resources ?? []),
        ],
      },
    },
  };
}
