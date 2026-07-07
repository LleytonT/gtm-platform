import { GtmRole, PostingRegion } from "./types";

const ROLE_PATTERNS: { role: GtmRole; pattern: RegExp }[] = [
  { role: "fde", pattern: /forward[\s-]?deployed|deployment strateg/i },
  {
    role: "se",
    pattern:
      /solutions? (engineer|architect|consultant)|sales engineer|pre[\s-]?sales engineer|customer engineer/i,
  },
  {
    role: "sdr",
    pattern:
      /\b(sdr|bdr)\b|sales development|business development representative|outbound representative/i,
  },
  {
    role: "ae",
    pattern:
      /account executive|\bae\b(?![a-z])|account director|enterprise sales(?! engineer)|strategic sales|sales representative|inside sales|field sales|territory manager/i,
  },
  {
    role: "cs",
    pattern:
      /customer success|account manager|renewal|customer experience manager|technical account manager/i,
  },
  {
    role: "partnerships",
    pattern: /partner(ship)?s? (manager|director|lead)|channel (sales|manager)|alliances/i,
  },
  {
    role: "other_gtm",
    pattern:
      /\bsales\b|revenue operations|revops|\bgtm\b|go[\s-]?to[\s-]?market|sales (ops|enablement|strategy)|(vp|head|director|manager|chief).*(sales|revenue)|(sales|revenue).*(vp|head|director|manager|officer)/i,
  },
];

/** Classify a job title into a GTM role bucket, or null when not a GTM role. */
export function classifyRole(title: string): GtmRole | null {
  for (const { role, pattern } of ROLE_PATTERNS) {
    if (pattern.test(title)) return role;
  }
  return null;
}

const ANZ_PATTERN =
  /\b(australia|sydney|melbourne|brisbane|perth|new zealand|auckland|wellington|anz|a\/nz)\b/i;
const APAC_PATTERN =
  /\b(singapore|japan|tokyo|india|bangalore|bengaluru|mumbai|hong kong|korea|seoul|apac|asia)\b/i;
const EMEA_PATTERN =
  /\b(london|dublin|paris|berlin|munich|amsterdam|madrid|stockholm|zurich|tel aviv|uk|united kingdom|ireland|france|germany|netherlands|spain|emea|europe)\b/i;
const LATAM_PATTERN =
  /\b(brazil|s[aã]o paulo|mexico|bogot[aá]|colombia|argentina|buenos aires|latam|latin america)\b/i;
const AMER_PATTERN =
  /\b(new york|san francisco|austin|boston|denver|chicago|seattle|atlanta|toronto|vancouver|usa|u\.s\.|united states|canada|north america|amer)\b|,\s?(ny|ca|tx|ma|co|il|wa|ga)\b/i;

/** Classify a location string into a coarse region bucket. */
export function classifyRegion(location: string): PostingRegion {
  if (!location) return "unknown";
  if (ANZ_PATTERN.test(location)) return "anz";
  if (APAC_PATTERN.test(location)) return "apac";
  if (EMEA_PATTERN.test(location)) return "emea";
  if (LATAM_PATTERN.test(location)) return "latam";
  if (AMER_PATTERN.test(location)) return "amer";
  if (/remote/i.test(location)) return "remote";
  return "unknown";
}
