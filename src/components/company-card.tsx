import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/score-ring";
import {
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Star,
} from "lucide-react";
import { Company } from "@/lib/types";

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/companies/${company.slug}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
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
              <Star className="h-3 w-3 fill-current" />
              {company.overallScore}
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {company.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-4">
              <ScoreRing score={company.financials.score} label="Financials" size="sm" />
              <ScoreRing score={company.pmf.score} label="PMF" size="sm" />
              <ScoreRing score={company.packages.score} label="Packages" size="sm" />
            </div>
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {company.hq}
            </div>
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
