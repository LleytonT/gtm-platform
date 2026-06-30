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
import { companies } from "@/lib/data";
import { THREE_T_META } from "@/lib/three-ts";
import { Search, SlidersHorizontal, Train } from "lucide-react";

type SortOption =
  | "gravyTrain"
  | "timing"
  | "territory"
  | "talent"
  | "growth";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [gravyTrainOnly, setGravyTrainOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("gravyTrain");

  const industries = useMemo(
    () => [...new Set(companies.map((c) => c.industry))],
    []
  );

  const regions = useMemo(
    () => [
      ...new Set(
        companies.flatMap((c) => c.expandingRegions ?? [])
      ),
    ],
    []
  );

  const filtered = useMemo(() => {
    let result = [...companies];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.sellsItself.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q)
      );
    }

    if (industryFilter !== "all") {
      result = result.filter((c) => c.industry === industryFilter);
    }

    if (regionFilter !== "all") {
      result = result.filter((c) =>
        c.expandingRegions?.includes(regionFilter)
      );
    }

    if (gravyTrainOnly) {
      result = result.filter((c) => c.gravyTrainScore >= 90);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "timing":
          return b.threeTs.timing.score - a.threeTs.timing.score;
        case "territory":
          return b.threeTs.territory.score - a.threeTs.territory.score;
        case "talent":
          return b.threeTs.talent.score - a.threeTs.talent.score;
        case "growth":
          return (
            parseFloat(b.financials.growthRate) -
            parseFloat(a.financials.growthRate)
          );
        default:
          return b.gravyTrainScore - a.gravyTrainScore;
      }
    });

    return result;
  }, [search, industryFilter, regionFilter, gravyTrainOnly, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-3">
          <Train className="mr-1 h-3 w-3" />
          Timing → Territory → Talent
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          Find the gravy train
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Companies where the product sells itself — scored on the Three
          T&apos;s. We surface the qualitative signals a trained eye catches on
          LinkedIn, in hiring patterns, and over coffee chats.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={industryFilter}
            onValueChange={(v) => setIndustryFilter(v ?? "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="mr-2 h-3 w-3" />
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gravyTrain">Gravy Train Score</SelectItem>
              <SelectItem value="timing">
                {THREE_T_META.timing.label} (highest weight)
              </SelectItem>
              <SelectItem value="territory">
                {THREE_T_META.territory.label}
              </SelectItem>
              <SelectItem value="talent">{THREE_T_META.talent.label}</SelectItem>
              <SelectItem value="growth">Growth Rate</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => setGravyTrainOnly(!gravyTrainOnly)}
            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
              gravyTrainOnly
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "bg-background text-muted-foreground hover:bg-accent"
            }`}
          >
            <Train className="h-3.5 w-3.5" />
            Gravy train only
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filtered.length} companies</Badge>
          {(search ||
            industryFilter !== "all" ||
            regionFilter !== "all" ||
            gravyTrainOnly) && (
            <button
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
          {filtered.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/30 py-16 text-center">
          <p className="text-lg font-medium">No companies found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
