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
import { companies } from "@/lib/data";
import { Search, SlidersHorizontal } from "lucide-react";

type SortOption = "overall" | "financials" | "pmf" | "packages" | "growth";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("overall");

  const industries = useMemo(
    () => [...new Set(companies.map((c) => c.industry))],
    []
  );

  const stages = useMemo(
    () => [...new Set(companies.map((c) => c.stage))],
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
          c.industry.toLowerCase().includes(q)
      );
    }

    if (industryFilter !== "all") {
      result = result.filter((c) => c.industry === industryFilter);
    }

    if (stageFilter !== "all") {
      result = result.filter((c) => c.stage === stageFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "financials":
          return b.financials.score - a.financials.score;
        case "pmf":
          return b.pmf.score - a.pmf.score;
        case "packages":
          return b.packages.score - a.packages.score;
        case "growth":
          return (
            parseFloat(b.financials.growthRate) -
            parseFloat(a.financials.growthRate)
          );
        default:
          return b.overallScore - a.overallScore;
      }
    });

    return result;
  }, [search, industryFilter, stageFilter, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Company Ratings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Companies rated on what actually matters for GTM professionals —
          financials, product-market fit, and compensation packages.
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
          <Select value={industryFilter} onValueChange={(v) => setIndustryFilter(v ?? "all")}>
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
          <Select value={stageFilter} onValueChange={(v) => setStageFilter(v ?? "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
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
              <SelectItem value="overall">Overall Score</SelectItem>
              <SelectItem value="financials">Financials</SelectItem>
              <SelectItem value="pmf">Product-Market Fit</SelectItem>
              <SelectItem value="packages">Comp Packages</SelectItem>
              <SelectItem value="growth">Growth Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6 flex items-center gap-2">
        <Badge variant="secondary">{filtered.length} companies</Badge>
        {(search || industryFilter !== "all" || stageFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setIndustryFilter("all");
              setStageFilter("all");
            }}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Company grid */}
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
