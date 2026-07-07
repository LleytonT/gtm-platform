"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompositeBadge } from "@/components/composite-badge";
import { LastUpdated, SourceChip, SourcedScore } from "@/components/provenance";
import { PRODUCT_PRICING_LABELS, REP_COMP_LABELS } from "@/lib/pricing";
import type { ScoredCompany } from "@/lib/scored";
import { Briefcase, MapPin } from "lucide-react";

/**
 * Company card driven entirely by the source-backed scorecard: the
 * composite reflects the user's weights + role lens, each dimension tile
 * opens its provenance popover, and cards without source-backed data say so
 * instead of showing seeded numbers (P0.1, P0.2, P0.4).
 */
export function ScoredCompanyCard({ item }: { item: ScoredCompany }) {
  const { company, scorecard } = item;
  const dims = scorecard.dimensions;
  const roleMix = scorecard.roleMix;
  const expandingAnz = scorecard.anzDetections.length > 0;

  return (
    <Card className="h-full border border-rule bg-card shadow-none transition-colors hover:border-brief/30">
      <CardContent className="pt-6">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-rule bg-background font-display text-lg font-semibold text-brief">
              {company.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold">
                <Link
                  href={`/companies/${company.slug}`}
                  className="focus-ring hover:text-brief hover:underline"
                >
                  {company.name}
                </Link>
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {company.industry}
              </p>
            </div>
          </div>
          <CompositeBadge scorecard={scorecard} />
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          <span className="font-mono-data text-[10px] uppercase tracking-wider text-gravy">
            analyst note ·{" "}
          </span>
          {company.sellsItself}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {expandingAnz && (
            <Badge className="border-gravy/40 bg-gravy/15 text-[10px] text-brief">
              <MapPin className="mr-1 h-2.5 w-2.5" aria-hidden />
              Expanding into ANZ
            </Badge>
          )}
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
          {scorecard.productPricing && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              {PRODUCT_PRICING_LABELS[scorecard.productPricing.model]}
              <SourceChip
                sources={scorecard.productPricing.sources}
                label="src"
              />
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1 text-[10px]">
            {REP_COMP_LABELS[scorecard.repCompModel.model]}
            {scorecard.repCompModel.sources.length > 0 && (
              <SourceChip sources={scorecard.repCompModel.sources} label="src" />
            )}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-rule pt-4">
          <SourcedScore
            label="Timing"
            score={dims.timing}
            valueClassName="text-lg"
          />
          <SourcedScore
            label="Territory"
            score={dims.territory}
            valueClassName="text-lg"
          />
          <SourcedScore
            label="Talent"
            score={dims.talent}
            valueClassName="text-lg"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 text-xs text-muted-foreground">
          {scorecard.gtmPostings != null && roleMix ? (
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3 w-3" aria-hidden />
              {scorecard.gtmPostings} GTM postings · AE {roleMix.ae} · SE/FDE{" "}
              {roleMix.se_fde} · SDR {roleMix.sdr}
            </span>
          ) : (
            <span className="italic">No public job board tracked</span>
          )}
          <LastUpdated iso={scorecard.lastUpdated} />
        </div>
      </CardContent>
    </Card>
  );
}
