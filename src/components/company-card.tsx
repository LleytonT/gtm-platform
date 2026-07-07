import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GravyTrainBadgeCompact } from "@/components/gravy-train-badge";
import { ThreeTsOverview } from "@/components/three-ts-overview";
import { ResearchPlaybookSummary } from "@/components/research-playbook";
import {
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Train,
} from "lucide-react";
import { Company, CompanyResearch } from "@/lib/types";

export function CompanyCard({
  company,
  research,
}: {
  company: Company;
  research: CompanyResearch;
}) {
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
              {company.gravyTrainScore}
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {company.sellsItself}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <GravyTrainBadgeCompact verdict={company.gravyTrainVerdict} />
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

          <div className="mt-3">
            <ResearchPlaybookSummary research={research} />
          </div>

          <div className="mt-4 border-t border-rule pt-4">
            <ThreeTsOverview threeTs={company.threeTs} size="sm" />
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
            {company.expandingRegions && company.expandingRegions.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {company.expandingRegions.slice(0, 2).join(", ")}
              </span>
            )}
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
        </CardContent>
      </Card>
    </Link>
  );
}
