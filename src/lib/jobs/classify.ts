import type { GtmRoleClass, JobRegion } from "./types";

/**
 * Title-based GTM role classification. Deliberately conservative: only
 * counts roles that are clearly go-to-market so momentum signals aren't
 * inflated by engineering or G&A postings.
 */

const AE_RE =
  /\baccount executive\b|\bAE\b|account director|sales director|enterprise sales(?!.*engineer)|commercial sales|strategic sales|inside sales rep/i;
const SE_FDE_RE =
  /sales engineer|solutions? engineer|solutions? architect|solutions? consultant|forward.deployed|pre.?sales|customer engineer|value engineer|demo engineer/i;
const SDR_RE =
  /\bSDR\b|\bBDR\b|sales development|business development representative|outbound development/i;
const CS_RE =
  /customer success|account manager|renewal|customer growth/i;
const LEADERSHIP_RE =
  /(head|director|vp|vice president|manager|lead)[^,]*\b(sales|revenue|go.to.market|gtm|partnerships|alliances)\b|\b(sales|revenue|gtm)\b[^,]*(head|director|vp|vice president|manager)/i;
const GTM_OTHER_RE =
  /\bgo.to.market\b|\bGTM\b|revenue operations|rev ?ops|sales operations|sales enablement|partnerships|alliances|field marketing|demand generation|growth marketing|sales strategy|deal desk|channel (sales|manager)/i;

const NON_GTM_GUARD_RE =
  /software engineer|data engineer|machine learning|security engineer|site reliability|product designer|recruiter|accountant|counsel|research scientist/i;

export function classifyRole(title: string): GtmRoleClass | null {
  if (NON_GTM_GUARD_RE.test(title) && !SE_FDE_RE.test(title)) return null;
  if (SE_FDE_RE.test(title)) return "se_fde";
  if (SDR_RE.test(title)) return "sdr";
  if (AE_RE.test(title)) return "ae";
  if (CS_RE.test(title)) return "cs";
  if (LEADERSHIP_RE.test(title)) return "gtm_leadership";
  if (GTM_OTHER_RE.test(title)) return "gtm_other";
  return null;
}

const ANZ_RE =
  /\b(australia|sydney|melbourne|brisbane|perth|canberra|new zealand|auckland|wellington|\bAU\b|\bNZ\b|ANZ)\b/i;
const APAC_RE =
  /singapore|tokyo|japan|seoul|korea|india|bangalore|bengaluru|mumbai|delhi|hong kong|taipei|taiwan|shanghai|beijing|china|jakarta|indonesia|manila|philippines|bangkok|thailand|vietnam|malaysia|kuala lumpur|\bAPAC\b|asia.pacific/i;
const EMEA_RE =
  /london|dublin|paris|berlin|munich|amsterdam|madrid|barcelona|lisbon|milan|rome|zurich|geneva|stockholm|copenhagen|oslo|helsinki|warsaw|prague|vienna|brussels|tel aviv|israel|dubai|\bUAE\b|riyadh|saudi|cairo|johannesburg|cape town|nairobi|lagos|uk\b|united kingdom|ireland|france|germany|spain|portugal|italy|netherlands|switzerland|sweden|denmark|norway|finland|poland|belgium|austria|\bEMEA\b|europe/i;
const LATAM_RE =
  /mexico|brazil|s[aã]o paulo|argentina|buenos aires|colombia|bogot[aá]|chile|santiago|peru|lima|\bLATAM\b|latin america/i;
const AMER_RE =
  /united states|\bUSA?\b|\bU\.S\.?\b|canada|toronto|vancouver|montreal|new york|san francisco|bay area|boston|seattle|austin|denver|chicago|atlanta|los angeles|washington|dallas|miami|portland|salt lake|phoenix|philadelphia|raleigh|nashville|north america|\bAMER\b|\bNAMER\b|california|colorado|texas|illinois|georgia|oregon|massachusetts|virginia|remote.*(us|united states)|(us|united states).*remote/i;
const REMOTE_RE = /\bremote\b|\banywhere\b|\bdistributed\b|worldwide|global/i;

export function classifyRegion(location: string): {
  region: JobRegion;
  isAnz: boolean;
} {
  const isAnz = ANZ_RE.test(location);
  if (isAnz) return { region: "ANZ", isAnz: true };
  if (APAC_RE.test(location)) return { region: "APAC", isAnz: false };
  if (EMEA_RE.test(location)) return { region: "EMEA", isAnz: false };
  if (LATAM_RE.test(location)) return { region: "LATAM", isAnz: false };
  if (AMER_RE.test(location)) return { region: "AMER", isAnz: false };
  if (REMOTE_RE.test(location)) return { region: "REMOTE", isAnz: false };
  return { region: "UNKNOWN", isAnz: false };
}

export const ROLE_CLASS_LABELS: Record<GtmRoleClass, string> = {
  ae: "Account Executive",
  se_fde: "SE / FDE",
  sdr: "SDR / BDR",
  cs: "Customer Success / AM",
  gtm_leadership: "GTM Leadership",
  gtm_other: "GTM Ops / Other",
};
