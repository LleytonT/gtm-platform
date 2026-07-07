"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RoleLensTabs, WeightControls, useScoreSettings } from "@/components/score-settings";
import { THREE_T_META } from "@/lib/three-ts";
import { Company, CompanyResearch } from "@/lib/types";
import { CompanyScorecard, computeWeightedScore } from "@/lib/scoring";
import { Search, SlidersHorizontal, Train } from "lucide-react";

type SortOption =
  | "gravyTrain"
  | "timing"
  | "territory"
  | "talent"
  | "growth"
  | "gtm_momentum"
  | "funding_velocity"
  | "quota_reality"
  | "regional_balance"
  | "pmf_strength";

type CategoryFilter = "all" | "forbes_ai50" | "hyperscaler" | "established";

export type CompanyListItem = {
  company: Company;
  scorecard: CompanyScorecard;
  research: CompanyResearch;
  anzExpanding: boolean;
};

/** Sort helper: null (insufficient data) always sorts last. */
function byDesc(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

export default function CompaniesClient({
  items,
  industries,
  regions,
}: {
  items: CompanyListItem[];
  industries: string[];
  regions: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { effectiveWeights } = useScoreSettings();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [industryFilter, setIndustryFilter] = useState(
    () => searchParams.get("industry") ?? "all"
  );
  const [regionFilter, setRegionFilter] = useState(
    () => searchParams.get("region") ?? "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    () => (searchParams.get("category") as CategoryFilter) ?? "all"
  );
  const [gravyTrainOnly, setGravyTrainOnly] = useState(
    () => searchParams.get("gravy") === "1"
  );
  const [anzOnly, setAnzOnly] = useState(
    () => searchParams.get("anz") === "1"
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    () => (searchParams.get("sort") as SortOption) ?? "gravyTrain"
  );

  const syncUrl = useCallback(
    (updates: {
      q?: string;
      industry?: string;
      region?: string;
      gravy?: boolean;
      anz?: boolean;
      sort?: string;
      category?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if ("q" in updates) {
        const q = updates.q?.trim();
        if (q) params.set("q", q);
        else params.delete("q");
      }
      if ("industry" in updates) {
        if (updates.industry && updates.industry !== "all")
          params.set("industry", updates.industry);
        else params.delete("industry");
      }
      if ("region" in updates) {
        if (updates.region && updates.region !== "all")
          params.set("region", updates.region);
        else params.delete("region");
      }
      if ("gravy" in updates) {
        if (updates.gravy) params.set("gravy", "1");
        else params.delete("gravy");
      }
      if ("anz" in updates) {
        if (updates.anz) params.set("anz", "1");
        else params.delete("anz");
      }
      if ("sort" in updates) {
        if (updates.sort && updates.sort !== "gravyTrain")
          params.set("sort", updates.sort);
        else params.delete("sort");
      }
      if ("category" in updates) {
        if (updates.category && updates.category !== "all")
          params.set("category", updates.category);
        else params.delete("category");
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      syncUrl({ q: search });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, syncUrl]);

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

    if (categoryFilter !== "all") {
      result = result.filter(({ company: c }) =>
        c.categories.includes(categoryFilter)
      );
    }

    if (regionFilter !== "all") {
      result = result.filter(({ company: c }) =>
        c.expandingRegions?.includes(regionFilter)
      );
    }

    if (anzOnly) {
      result = result.filter((item) => item.anzExpanding);
    }

    const weighted = new Map(
      result.map((item) => [
        item.company.slug,
        computeWeightedScore(item.scorecard, effectiveWeights).value,
      ])
    );

    if (gravyTrainOnly) {
      result = result.filter((item) => {
        const v = weighted.get(item.company.slug) ?? null;
        return v !== null && v >= 75;
      });
    }

    result.sort((a, b) => {
      const sa = a.scorecard;
      const sb = b.scorecard;
      switch (sortBy) {
        case "timing":
          return byDesc(sa.dimensions.timing.value, sb.dimensions.timing.value);
        case "territory":
          return byDesc(
            sa.dimensions.territory.value,
            sb.dimensions.territory.value
          );
        case "talent":
          return byDesc(sa.dimensions.talent.value, sb.dimensions.talent.value);
        case "growth":
          return (
            parseFloat(b.company.financials.growthRate) -
            parseFloat(a.company.financials.growthRate)
          );
        case "gtm_momentum":
          return byDesc(
            sa.benchmarks.gtm_momentum.value,
            sb.benchmarks.gtm_momentum.value
          );
        case "funding_velocity":
          return byDesc(
            sa.benchmarks.funding_velocity.value,
            sb.benchmarks.funding_velocity.value
          );
        case "quota_reality":
          return byDesc(
            sa.benchmarks.quota_reality.value,
            sb.benchmarks.quota_reality.value
          );
        case "regional_balance":
          return byDesc(
            sa.benchmarks.regional_balance.value,
            sb.benchmarks.regional_balance.value
          );
        case "pmf_strength":
          return byDesc(
            sa.benchmarks.pmf_strength.value,
            sb.benchmarks.pmf_strength.value
          );
        default:
          return byDesc(
            weighted.get(a.company.slug) ?? null,
            weighted.get(b.company.slug) ?? null
          );
      }
    });

    return result;
  }, [
    items,
    search,
    industryFilter,
    categoryFilter,
    regionFilter,
    gravyTrainOnly,
    anzOnly,
    sortBy,
    effectiveWeights,
  ]);

  const hasFilters =
    search ||
    industryFilter !== "all" ||
    categoryFilter !== "all" ||
    regionFilter !== "all" ||
    gravyTrainOnly ||
    anzOnly;

  const resultsMessage = hasFilters
    ? `${filtered.length} companies match your filters`
    : `${filtered.length} companies`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        align="left"
        eyebrow="Forbes AI 50 · Hyperscalers · SaaS"
        title="Company benchmarks"
        description="Compare sourced GTM signals across companies — user-weighted gravy train scores, job-board momentum, funding velocity, and community-verified quota reality."
        className="mb-8"
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4 border border-rule bg-card p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Label htmlFor="company-search" className="sr-only">
                Search companies
              </Label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="company-search"
                name="company-search"
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Search companies…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-rule bg-background pl-9"
              />
            </div>
            <RoleLensTabs />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                const next = (v ?? "all") as CategoryFilter;
                setCategoryFilter(next);
                syncUrl({ category: next });
              }}
            >
              <SelectTrigger
                id="category-filter"
                className="w-[160px] border-rule bg-background"
                aria-label="Filter by category"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="forbes_ai50">Forbes AI 50</SelectItem>
                <SelectItem value="hyperscaler">Hyperscalers</SelectItem>
                <SelectItem value="established">Established SaaS</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={industryFilter}
              onValueChange={(v) => {
                const next = v ?? "all";
                setIndustryFilter(next);
                syncUrl({ industry: next });
              }}
            >
              <SelectTrigger
                id="industry-filter"
                className="w-[180px] border-rule bg-background"
                aria-label="Filter by industry"
              >
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
              onValueChange={(v) => {
                const next = v ?? "all";
                setRegionFilter(next);
                syncUrl({ region: next });
              }}
            >
              <SelectTrigger
                id="region-filter"
                className="w-[160px] border-rule bg-background"
                aria-label="Filter by region"
              >
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
              onValueChange={(v) => {
                if (!v) return;
                setSortBy(v as SortOption);
                syncUrl({ sort: v });
              }}
            >
              <SelectTrigger
                id="sort-by"
                className="w-[180px] border-rule bg-background"
                aria-label="Sort companies"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gravyTrain">Gravy train score</SelectItem>
                <SelectItem value="gtm_momentum">GTM momentum</SelectItem>
                <SelectItem value="funding_velocity">Funding velocity</SelectItem>
                <SelectItem value="quota_reality">Quota reality</SelectItem>
                <SelectItem value="regional_balance">Regional balance</SelectItem>
                <SelectItem value="pmf_strength">PMF strength</SelectItem>
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
              onClick={() => {
                const next = !gravyTrainOnly;
                setGravyTrainOnly(next);
                syncUrl({ gravy: next });
              }}
              aria-pressed={gravyTrainOnly}
              className={`focus-ring inline-flex h-9 items-center gap-2 border px-3 text-sm font-medium transition-colors ${
                gravyTrainOnly
                  ? "border-gravy bg-gravy/15 text-brief"
                  : "border-rule bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              <Train className="h-3.5 w-3.5" aria-hidden />
              Gravy train only
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !anzOnly;
                setAnzOnly(next);
                syncUrl({ anz: next });
              }}
              aria-pressed={anzOnly}
              className={`focus-ring inline-flex h-9 items-center gap-2 border px-3 text-sm font-medium transition-colors ${
                anzOnly
                  ? "border-sky-400 bg-sky-50 text-sky-800"
                  : "border-rule bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              Expanding into ANZ
            </button>
          </div>
        </div>
        <WeightControls />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Badge variant="secondary" aria-live="polite" aria-atomic="true">
            {resultsMessage}
          </Badge>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setIndustryFilter("all");
                setCategoryFilter("all");
                setRegionFilter("all");
                setGravyTrainOnly(false);
                setAnzOnly(false);
                setSortBy("gravyTrain");
                router.replace(pathname, { scroll: false });
              }}
              className="focus-ring text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
        <SignalSourceLegend />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ company, scorecard, research, anzExpanding }) => (
            <CompanyCard
              key={company.slug}
              company={company}
              scorecard={scorecard}
              research={research}
              anzExpanding={anzExpanding}
            />
          ))}
        </div>
      ) : (
        <div
          className="border border-dashed border-rule bg-card py-16 text-center"
          role="status"
        >
          <p className="text-lg font-medium">No companies match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try different filters or clear your search.
          </p>
        </div>
      )}
    </div>
  );
}
