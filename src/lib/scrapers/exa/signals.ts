import type {
  ExaCompanySignals,
  ExaHiringMetrics,
  ExaPedigreeMetrics,
  ExaPerson,
  ExaPromotionMetrics,
  ExaTenureMetrics,
  ExaWorkRole,
} from "./types";

const GTM_TITLE =
  /account executive|\bae\b|sdr|bdr|sales development|sales manager|vp.{0,20}sales|head of sales|cro\b|chief revenue|customer success manager|sales engineer/i;

const NON_GTM_TITLE =
  /^(?!.*\b(account executive|sales|revenue|sdr|bdr|cro)\b).*marketing|product marketing|brand marketing|communications|public relations|\bpr\b/i;

const LEADERSHIP_TITLE =
  /vp|vice president|head of|director|cro|chief revenue/i;

function normalizeCompany(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function companiesMatch(a: string, b: string): boolean {
  const na = normalizeCompany(a);
  const nb = normalizeCompany(b);
  return na.includes(nb) || nb.includes(na);
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthsBetween(from: string | null, to: Date = new Date()): number | null {
  const start = parseDate(from);
  if (!start) return null;
  const diff = to.getTime() - start.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24 * 30.44)));
}

function isGtmRole(title: string): boolean {
  if (NON_GTM_TITLE.test(title)) return false;
  return GTM_TITLE.test(title);
}

function isLeadershipRole(title: string): boolean {
  return LEADERSHIP_TITLE.test(title);
}

// Remove erroneous multi-decade tenures from bad source dates
function sanitizeTenureMonths(months: number): number | null {
  if (months > 120) return null;
  return months;
}

function getRolesAtCompany(
  person: ExaPerson,
  companyName: string
): ExaWorkRole[] {
  return person.workHistory.filter(
    (role) =>
      companiesMatch(role.companyName, companyName) && isGtmRole(role.title)
  );
}

function getCurrentRoleAtCompany(
  person: ExaPerson,
  companyName: string
): ExaWorkRole | null {
  const roles = getRolesAtCompany(person, companyName);
  const current = roles.find((role) => role.to == null);
  return current ?? roles[0] ?? null;
}

function getPriorEmployers(
  person: ExaPerson,
  companyName: string
): string[] {
  const roles = person.workHistory;
  const currentIdx = roles.findIndex(
    (role) =>
      companiesMatch(role.companyName, companyName) && role.to == null
  );

  const priorRoles =
    currentIdx >= 0
      ? roles.slice(currentIdx + 1)
      : roles.filter((role) => !companiesMatch(role.companyName, companyName));

  return priorRoles
    .map((role) => role.companyName)
    .filter((name) => name && !companiesMatch(name, companyName));
}

function computeTenure(
  people: ExaPerson[],
  companyName: string
): ExaTenureMetrics {
  const tenures = people
    .map((person) => {
      const current = getCurrentRoleAtCompany(person, companyName);
      if (!current) return null;
      const raw = monthsBetween(current.from);
      if (raw == null) return null;
      return sanitizeTenureMonths(raw);
    })
    .filter((months): months is number => months != null);

  if (tenures.length === 0) {
    return {
      sampleSize: 0,
      avgMonths: null,
      under12Months: 0,
      over18Months: 0,
    };
  }

  const avgMonths = Math.round(
    tenures.reduce((sum, n) => sum + n, 0) / tenures.length
  );

  return {
    sampleSize: tenures.length,
    avgMonths,
    under12Months: tenures.filter((m) => m < 12).length,
    over18Months: tenures.filter((m) => m >= 18).length,
  };
}

function computeHiring(
  people: ExaPerson[],
  companyName: string
): ExaHiringMetrics {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  let newHiresLast6Months = 0;
  let newHiresLast12Months = 0;
  let totalCurrentGtm = 0;

  for (const person of people) {
    const current = getCurrentRoleAtCompany(person, companyName);
    if (!current) continue;
    totalCurrentGtm += 1;
    const start = parseDate(current.from);
    if (!start) continue;
    if (start >= sixMonthsAgo) newHiresLast6Months += 1;
    if (start >= twelveMonthsAgo) newHiresLast12Months += 1;
  }

  return {
    newHiresLast6Months,
    newHiresLast12Months,
    totalCurrentGtm,
  };
}

function computePromotions(
  people: ExaPerson[],
  companyName: string
): ExaPromotionMetrics {
  const promotionExamples: string[] = [];
  let internalPromotions = 0;

  for (const person of people) {
    const companyRoles = person.workHistory.filter((role) =>
      companiesMatch(role.companyName, companyName)
    );
    if (companyRoles.length < 2) continue;

    const sorted = [...companyRoles].sort((a, b) => {
      const aDate = parseDate(a.from)?.getTime() ?? 0;
      const bDate = parseDate(b.from)?.getTime() ?? 0;
      return aDate - bDate;
    });

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const next = sorted[i];
      if (prev.title !== next.title) {
        internalPromotions += 1;
        if (promotionExamples.length < 3) {
          promotionExamples.push(
            `${person.name}: ${prev.title} → ${next.title}`
          );
        }
        break;
      }
    }
  }

  return { internalPromotions, promotionExamples };
}

function computePedigrees(
  people: ExaPerson[],
  companyName: string
): ExaPedigreeMetrics {
  const counts = new Map<string, number>();
  const notable = new Set<string>();
  const notableCompanies =
    /salesforce|gong|outreach|hubspot|datadog|stripe|rippling|notion|figma|google|meta|microsoft|amazon|oracle|sap|workday|zoom|slack|okta|snowflake|databricks|mongodb|atlassian/i;

  for (const person of people) {
    const priors = getPriorEmployers(person, companyName);
    for (const employer of priors.slice(0, 2)) {
      counts.set(employer, (counts.get(employer) ?? 0) + 1);
      if (notableCompanies.test(employer)) {
        const role = person.workHistory.find((r) =>
          companiesMatch(r.companyName, companyName)
        );
        if (role) {
          notable.add(`${person.name} from ${employer}`);
        }
      }
    }
  }

  const topPriorEmployers = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }));

  return {
    topPriorEmployers,
    notablePedigrees: [...notable].slice(0, 4),
  };
}

export function buildCompanySignals(
  companySlug: string,
  companyName: string,
  people: ExaPerson[],
  fetchedAt: string
): ExaCompanySignals {
  const currentGtm = people.filter(
    (person) => getCurrentRoleAtCompany(person, companyName) != null
  );

  return {
    companySlug,
    companyName,
    fetchedAt,
    people,
    tenure: computeTenure(currentGtm, companyName),
    hiring: computeHiring(currentGtm, companyName),
    promotions: computePromotions(people, companyName),
    pedigrees: computePedigrees(currentGtm, companyName),
    attribution: "Exa (https://exa.ai)",
  };
}

export function scoreFromExaSignals(signals: ExaCompanySignals): number {
  let score = 70;
  const { tenure, hiring, promotions, pedigrees } = signals;

  if (tenure.avgMonths != null) {
    if (tenure.avgMonths >= 18) score += 10;
    else if (tenure.avgMonths >= 12) score += 5;
    else if (tenure.avgMonths < 9) score -= 8;

    const shortTenureRate =
      tenure.sampleSize > 0 ? tenure.under12Months / tenure.sampleSize : 0;
    if (shortTenureRate > 0.5) score -= 10;
    else if (shortTenureRate < 0.25) score += 5;
  }

  if (hiring.newHiresLast6Months >= 5) score += 6;
  else if (hiring.newHiresLast6Months >= 2) score += 3;

  if (promotions.internalPromotions >= 2) score += 5;

  if (pedigrees.notablePedigrees.length >= 2) score += 5;
  else if (pedigrees.topPriorEmployers.length >= 3) score += 3;

  return Math.min(98, Math.max(40, Math.round(score)));
}

export { isLeadershipRole };
