import type {
  RepVueCategoryRanking,
  RepVueProfile,
  RepVueRoleCompensation,
} from "./types";

function parseMoney(value: string): number | null {
  const match = value.replace(/,/g, "").match(/\$?([\d.]+)k?/i);
  if (!match) return null;
  const num = Number.parseFloat(match[1]);
  if (Number.isNaN(num)) return null;
  return /k/i.test(value) ? Math.round(num * 1000) : Math.round(num);
}

function parsePercentile(line: string): number | null {
  const match =
    line.match(/(\d+)(?:st|nd|rd|th)\s+percentile/i) ??
    line.match(/(\d+)(?:st|nd|rd|th)\b/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseIndustryRank(line: string): { rank: number; total: number } | null {
  const withTotal = line.match(/#([\d,]+)\s+of\s+([\d,]+)/i);
  if (withTotal) {
    return {
      rank: Number.parseInt(withTotal[1].replace(/,/g, ""), 10),
      total: Number.parseInt(withTotal[2].replace(/,/g, ""), 10),
    };
  }
  const rankOnly = line.match(/#\s*([\d,]+)\s*$/i);
  if (rankOnly) {
    return {
      rank: Number.parseInt(rankOnly[1].replace(/,/g, ""), 10),
      total: 0,
    };
  }
  return null;
}

function parseCategoryRankings(markdown: string): RepVueCategoryRanking[] {
  const section = markdown.match(
    /### Category Rankings[\s\S]*?(?=\n### |\n---|\n## )/
  )?.[0];
  if (!section) return [];

  const rankings: RepVueCategoryRanking[] = [];
  for (const line of section.split("\n")) {
    if (!line.startsWith("- ")) continue;
    const category = line.slice(2).split(":")[0]?.trim();
    if (!category) continue;
    const percentile = parsePercentile(line);
    const rankInfo = parseIndustryRank(line);
    if (percentile == null || !rankInfo) continue;
    rankings.push({
      category,
      percentile,
      industryRank: rankInfo.rank,
      industryTotal: rankInfo.total,
    });
  }
  return rankings;
}

function parseCompensation(markdown: string): RepVueRoleCompensation[] {
  const section = markdown.match(
    /## Sales Role Compensation[\s\S]*?(?=\n## Quota Attainment|\n---|\n## For Employers)/
  )?.[0];
  if (!section) return [];

  const roles: RepVueRoleCompensation[] = [];
  const blocks = section.split(/\n### /).slice(1);

  for (const block of blocks) {
    const [titleLine, ...rest] = block.split("\n");
    const role = titleLine.replace(/\s*\(estimated\)\s*$/i, "").trim();
    const estimated = /\(estimated\)/i.test(titleLine);
    const body = rest.join("\n");

    const baseMatch = body.match(/base salaries[\s\S]*?up to \$([\d,]+k?)/i);
    const oteMatch = body.match(/on-target earnings up to \$([\d,]+k?)/i);
    const topMatch = body.match(/top performers[\s\S]*?up to \$([\d,]+k?)/i);
    const sampleMatch = body.match(/sample size:\s*(\d+)\s+ratings/i);

    roles.push({
      role,
      baseUpTo: baseMatch ? parseMoney(baseMatch[1]) : null,
      oteUpTo: oteMatch ? parseMoney(oteMatch[1]) : null,
      topPerformerEarnings: topMatch ? parseMoney(topMatch[1]) : null,
      sampleSize: sampleMatch ? Number.parseInt(sampleMatch[1], 10) : null,
      estimated,
    });
  }

  return roles;
}

function findAccountExecutiveRole(
  roles: RepVueRoleCompensation[]
): RepVueRoleCompensation | undefined {
  return (
    roles.find((r) => /^account executive$/i.test(r.role)) ??
    roles.find((r) => /enterprise account executive/i.test(r.role)) ??
    roles.find((r) => /mid market account executive/i.test(r.role)) ??
    roles.find((r) => /account executive/i.test(r.role))
  );
}

export function parseRepvueMarkdown(
  markdown: string,
  companySlug: string,
  repvueSlug: string,
  fetchedAt: string
): RepVueProfile {
  const titleMatch = markdown.match(/^# (.+?) — RepVue Sales Role Profile/m);
  const name = titleMatch?.[1]?.trim() ?? repvueSlug;

  const canonicalUrl =
    markdown.match(/^Canonical URL:\s*(.+)$/m)?.[1]?.trim() ??
    `https://www.repvue.com/companies/${repvueSlug}`;
  const website = markdown.match(/^Company Website:\s*(.+)$/m)?.[1]?.trim() ?? null;
  const generatedAt = markdown.match(/^Generated:\s*(.+)$/m)?.[1]?.trim() ?? null;

  const industryLine = markdown.match(/^Industry:\s*(.+)$/m)?.[1];
  let industry: string | null = null;
  let companySize: string | null = null;
  if (industryLine) {
    const parts = industryLine.split("|").map((part) => part.trim());
    industry = parts[0]?.replace(/^Industry:\s*/i, "") ?? null;
    companySize = parts[1]?.replace(/^Company Size:\s*/i, "") ?? null;
  }

  const headcountRaw = markdown.match(/^Employee Headcount:\s*([\d,]+)$/m)?.[1];
  const headcount = headcountRaw
    ? Number.parseInt(headcountRaw.replace(/,/g, ""), 10)
    : null;

  const fundingStatus =
    markdown.match(/^Funding \/ Status:\s*(.+)$/m)?.[1]?.trim() ?? null;
  const hq = markdown.match(/^HQ:\s*(.+)$/m)?.[1]?.trim() ?? null;

  const descriptionBlock = markdown
    .split("---")[0]
    ?.split("\n")
    .slice(10)
    .join("\n")
    .trim();
  const description = descriptionBlock?.replace(/\n+/g, " ").trim() ?? null;

  const totalRatingsMatch = markdown.match(
    /- Total Ratings:\s*([\d,]+)\s*\(([\d.]+)% verified\)/
  );
  const writtenReviews = markdown.match(/- Written Reviews:\s*(\d+)/)?.[1];
  const ratingsLast6Months = markdown.match(
    /- Ratings in Last 6 Months:\s*(\d+)/
  )?.[1];
  const lastRatingRecorded = markdown.match(
    /- Last Rating Recorded:\s*(.+)$/m
  )?.[1];

  const scoreSection = markdown.match(/## RepVue Score\n\n([\d.]+)/);
  const repvueScore = scoreSection ? Number.parseFloat(scoreSection[1]) : null;

  const overallPercentile = parsePercentile(
    markdown.match(/- Overall Percentile:\s*(.+)$/m)?.[1] ?? ""
  );
  const industryPercentile = parsePercentile(
    markdown.match(/- Industry Percentile:\s*(.+)$/m)?.[1] ?? ""
  );
  const trend = markdown.match(/- 6-Month Trend:\s*(.+)$/m)?.[1]?.trim() ?? null;

  const categoryRankings = parseCategoryRankings(markdown);
  const compensation = parseCompensation(markdown);

  const quotaSection = markdown.match(/## Quota Attainment([\s\S]*?)(?=\n---)/)?.[1] ?? "";
  const quotaAttainmentPublic =
    /\d+%/.test(quotaSection) &&
    !quotaSection.includes("available to RepVue members");

  return {
    companySlug,
    repvueSlug,
    name,
    canonicalUrl,
    website,
    description,
    industry: industry ?? null,
    companySize: companySize ?? null,
    headcount,
    fundingStatus,
    hq,
    generatedAt,
    fetchedAt,
    repvueScore,
    overallPercentile,
    industryPercentile,
    trend,
    totalRatings: totalRatingsMatch
      ? Number.parseInt(totalRatingsMatch[1].replace(/,/g, ""), 10)
      : null,
    verifiedPercent: totalRatingsMatch
      ? Number.parseFloat(totalRatingsMatch[2])
      : null,
    writtenReviews: writtenReviews ? Number.parseInt(writtenReviews, 10) : null,
    ratingsLast6Months: ratingsLast6Months
      ? Number.parseInt(ratingsLast6Months, 10)
      : null,
    lastRatingRecorded: lastRatingRecorded?.trim() ?? null,
    categoryRankings,
    compensation,
    quotaAttainmentPublic,
    attribution: "RepVue (https://www.repvue.com)",
  };
}

export function formatCompSummary(profile: RepVueProfile): string | null {
  const ae = findAccountExecutiveRole(profile.compensation);
  if (!ae?.oteUpTo) return null;
  const base = ae.baseUpTo ? `$${Math.round(ae.baseUpTo / 1000)}K base` : null;
  const ote = `$${Math.round(ae.oteUpTo / 1000)}K OTE`;
  return [base, ote].filter(Boolean).join(", ");
}

export function getIncentiveCompPercentile(profile: RepVueProfile): number | null {
  return (
    profile.categoryRankings.find((c) =>
      /incentive compensation/i.test(c.category)
    )?.percentile ?? null
  );
}

export function getProductMarketFitPercentile(profile: RepVueProfile): number | null {
  return (
    profile.categoryRankings.find((c) =>
      /product - market fit/i.test(c.category)
    )?.percentile ?? null
  );
}
