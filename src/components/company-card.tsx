"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GravyTrainBadgeCompact,
} from "@/components/gravy-train-badge";
import { ThreeTsOverview } from "@/components/three-ts-overview";
import { LastUpdated } from "@/components/provenance";
import { useScoreSettings } from "@/components/score-settings";
import { computeWeightedScore } from "@/lib/scoring";
import {
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Train,
} from "lucide-react";
import { Company, CompanyResearch } from "@/lib/types";
import { CompanyScorecard } from "@/lib/scoring";

export function AnzExpansionBadge({ compact }: { compact?: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        compact
          ? "border-sky-300 bg-sky-50 text-[10px] text-sky-800"
          : "border-sky-300 bg-sky-50 text-xs text-sky-800"
      }
    >
      <MapPin className="mr-1 h-3 w-3" aria-hidden />
      Expanding into ANZ
    </Badge>
  );
}

export function CompanyCard({
  company,
  scorecard,
  research,
  anzExpanding,
}: {
  company: Company;
  scorecard: CompanyScorecard;
  research: CompanyResearch;
  anzExpanding: boolean;
}) {
  const { effectiveWeights } = useScoreSettings();
  const { value } = computeWeightedScore(scorecard, effectiveWeights);
  const lensCount = Object.values(research.lenses).filter(
    (lens) => lens.score !== null
  ).length;

  return (
    <Link href={`/companies/${company.slug}`} className="group block h-full">
      <Card className="h-full border border-rule bg-card shadow-none transition-colors hover:border-brief/30 hover:bg-card/90">
        <CardContent className="pt-6">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border border-rule bg-background font-display text-lg font-semibold text-brief">
                {company.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold group-hover:text-brief">
                  {company.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {company.industry}
                </p>
              </div>
            </div>
            <div className="font-mono-data flex items-center gap-1 border border-gravy/30 bg-gravy/10 px-2.5 py-1 text-xs font-semibold text-brief">
              <Train className="h-3 w-3 text-gravy" aria-hidden />
              {value ?? "—"}
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {company.sellsItself}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <GravyTrainBadgeCompact scorecard={scorecard} />
            {anzExpanding && <AnzExpansionBadge compact />}
            {company.categories.includes("forbes_ai50") && (
              <Badge variant="outline" className="text-[10px]">
                AI 50
              </Badge>
            )}
            {company.categories.includes("hyperscaler") && (
              <Badge variant="outline" className="text-[10px]">
                Hyperscaler
              </Badge>
            )}
          </div>

          <div className="mt-4 border-t border-rule pt-4">
            <ThreeTsOverview
              threeTs={company.threeTs}
              scorecard={scorecard}
              size="sm"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-rule pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3 w-3" aria-hidden />
              OTE {company.packages.ote}
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" aria-hidden />
              {company.financials.growthRate}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden />
              {company.gtmTeamSize} GTM
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {company.hiringRoles.slice(0, 3).map((role) => (
              <Badge key={role} variant="secondary" className="text-[10px]">
                {role}
              </Badge>
            ))}
            {company.hiringRoles.length > 3 && (
              <Badge variant="secondary" className="text-[10px]">
                +{company.hiringRoles.length - 3}
              </Badge>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-rule pt-3">
            <LastUpdated iso={scorecard.lastUpdated} />
            {lensCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {lensCount}/5 research lenses sourced
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
