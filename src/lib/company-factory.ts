import {
  Company,
  CompanyCategory,
  CompModel,
  GtmBenchmarks,
  SalesMotion,
  ThreeTs,
} from "./types";
import { computeGravyTrainScore, getGravyTrainVerdict } from "./three-ts";

export interface CompanySeed {
  slug: string;
  name: string;
  website: string;
  description: string;
  industry: string;
  stage: string;
  headcount: string;
  hq: string;
  founded: number;
  sellsItself: string;
  categories: CompanyCategory[];
  salesMotion: SalesMotion;
  compModel: CompModel;
  benchmarks: GtmBenchmarks;
  threeTs: ThreeTs;
  financials: Omit<Company["financials"], never>;
  pmf: Omit<Company["pmf"], never>;
  packages: Omit<Company["packages"], never>;
  hiringRoles: string[];
  gtmTeamSize: string;
  expandingRegions?: string[];
}

function logoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}

export function seedToCompany(seed: CompanySeed): Company {
  const gravyTrainScore = computeGravyTrainScore(seed.threeTs);
  return {
    ...seed,
    logo: logoUrl(new URL(seed.website).hostname.replace(/^www\./, "")),
    gravyTrainScore,
    gravyTrainVerdict: getGravyTrainVerdict(gravyTrainScore),
  };
}

export function makeThreeTs(
  timing: number,
  territory: number,
  talent: number,
  verdicts: { timing: string; territory: string; talent: string }
): ThreeTs {
  return {
    timing: {
      score: timing,
      verdict: verdicts.timing,
      signals: [
        {
          text: verdicts.timing,
          source: "market",
          confidence: "high",
        },
      ],
    },
    territory: {
      score: territory,
      verdict: verdicts.territory,
      signals: [
        {
          text: verdicts.territory,
          source: "linkedin",
          confidence: "high",
        },
      ],
    },
    talent: {
      score: talent,
      verdict: verdicts.talent,
      signals: [
        {
          text: verdicts.talent,
          source: "hiring",
          confidence: "medium",
        },
      ],
    },
  };
}
