import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GravyTrainBadgeCompact } from "@/components/gravy-train-badge";
import { ThreeTsOverview } from "@/components/three-ts-overview";
import {
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Train,
} from "lucide-react";
import { Company } from "@/lib/types";

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/companies/${company.slug}`}>
      <Card className="group h-full transition-all hover:border-primary/20 hover:shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-white text-lg font-bold text-primary">
                {company.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary">
                  {company.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {company.industry}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              <Train className="h-3 w-3" />
              {company.gravyTrainScore}
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {company.sellsItself}
          </p>

          <div className="mt-3">
            <GravyTrainBadgeCompact verdict={company.gravyTrainVerdict} />
          </div>

          <div className="mt-4 border-t pt-4">
            <ThreeTsOverview threeTs={company.threeTs} size="sm" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              OTE: {company.packages.ote}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {company.financials.growthRate}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {company.gtmTeamSize} GTM
            </div>
            {company.expandingRegions && company.expandingRegions.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {company.expandingRegions.slice(0, 2).join(", ")}
              </div>
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
