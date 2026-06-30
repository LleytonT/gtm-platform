"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CompanyCard } from "@/components/company-card";
import { SignalSourceLegend } from "@/components/qualitative-signals";
import { SectionHeader } from "@/components/section-header";
import { THREE_T_META } from "@/lib/three-ts";
import { Company, CompanyResearch } from "@/lib/types";
import { Search, SlidersHorizontal, Train } from "lucide-react";

type SortOption =
  | "gravyTrain"
  | "timing"
  | "territory"
  | "talent"
  | "growth";

export type CompanyListItem = {
  company: Company;
  research: CompanyResearch;
};

export default function CompaniesClient({
  items,
  industries,
  regions,
}: {
  items: CompanyListItem[];
  industries: string[];
  regions: string[];
}) {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [gravyTrainOnly, setGravyTrainOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("gravyTrain");

  const filtered = useMemo(() => {
    let result = [...items];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        ({ company: c }) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.sellsItself.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q)
      );
    }

    if (industryFilter !== "all") {
      result = result.filter(({ company: c }) => c.industry === industryFilter);
    }

    if (regionFilter !== "all") {
      result = result.filter(({ company: c }) =>
        c.expandingRegions?.includes(regionFilter)
      );
    }

    if (gravyTrainOnly) {
      result = result.filter(
        ({ company: c }) => c.gravyTrainScore >= 90
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "timing":
          return b.company.threeTs.timing.score - a.company.threeTs.timing.score;
        case "territory":
          return (
            b.company.threeTs.territory.score - a.company.threeTs.territory.score
          );
        case "talent":
          return b.company.threeTs.talent.score - a.company.threeTs.talent.score;
        case "growth":
          return (
            parseFloat(b.company.financials.growthRate) -
            parseFloat(a.company.financials.growthRate)
          );
        default:
          return b.company.gravyTrainScore - a.company.gravyTrainScore;
      }
    });

    return result;
  }, [items, search, industryFilter, regionFilter, gravyTrainOnly, sortBy]);

  const hasFilters =
    search || industryFilter !== "all" || regionFilter !== "all" || gravyTrainOnly;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        align="left"
        eyebrow="Timing → Territory → Talent"
        title="Find the gravy train"
        description="Companies where the product sells itself — scored on the Three T's with qualitative signals from LinkedIn, hiring data, and coffee chats."
        className="mb-8"
      />

      <div className="mb-8 flex flex-col gap-4 border border-rule bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-rule bg-background pl-9"
            aria-label="Search companies"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={industryFilter}
            onValueChange={(v) => setIndustryFilter(v ?? "all")}
          >
            <SelectTrigger className="w-[180px] border-rule bg-background">
              <SlidersHorizontal className="mr-2 h-3 w-3" aria-hidden />
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={regionFilter}
            onValueChange={(v) => setRegionFilter(v ?? "all")}
          >
            <SelectTrigger className="w-[160px] border-rule bg-background">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => v && setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[180px] border-rule bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gravyTrain">Gravy train score</SelectItem>
              <SelectItem value="timing">
                {THREE_T_META.timing.label} (highest weight)
              </SelectItem>
              <SelectItem value="territory">
                {THREE_T_META.territory.label}
              </SelectItem>
              <SelectItem value="talent">{THREE_T_META.talent.label}</SelectItem>
              <SelectItem value="growth">Growth rate</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setGravyTrainOnly(!gravyTrainOnly)}
            aria-pressed={gravyTrainOnly}
            className={`inline-flex h-9 items-center gap-2 border px-3 text-sm font-medium transition-colors ${
              gravyTrainOnly
                ? "border-gravy bg-gravy/15 text-brief"
                : "border-rule bg-background text-muted-foreground hover:bg-accent"
            }`}
          >
            <Train className="h-3.5 w-3.5" aria-hidden />
            Gravy train only
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filtered.length} companies</Badge>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setIndustryFilter("all");
                setRegionFilter("all");
                setGravyTrainOnly(false);
              }}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
        <SignalSourceLegend />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ company, research }) => (
            <CompanyCard
              key={company.slug}
              company={company}
              research={research}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-rule bg-card py-16 text-center">
          <p className="text-lg font-medium">No companies match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try different filters or clear your search.
          </p>
        </div>
      )}
    </div>
  );
}
