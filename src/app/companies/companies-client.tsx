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
import { ScoredCompanyCard } from "@/components/scored-company-card";
import { WeightsPanel } from "@/components/weights-panel";
import { LastUpdated } from "@/components/provenance";
import { useWeights } from "@/components/weights-provider";
import { SectionHeader } from "@/components/section-header";
import { computeComposite } from "@/lib/scoring/weights";
import type { ScoredCompany } from "@/lib/scored";
import type { DimensionScore } from "@/lib/scoring/types";
import { MapPin, Search, SlidersHorizontal, Train } from "lucide-react";

type SortOption =
  | "composite"
  | "timing"
  | "territory"
  | "talent"
  | "gtm_momentum"
  | "funding_velocity"
  | "quota_reality"
  | "regional_balance"
  | "pmf_strength";

const SORT_LABELS: Record<SortOption, string> = {
  composite: "Gravy train (your weights)",
  gtm_momentum: "GTM momentum",
  funding_velocity: "Funding velocity",
  quota_reality: "Quota reality",
  regional_balance: "Regional balance",
  pmf_strength: "PMF strength",
  timing: "Timing",
  territory: "Territory",
  talent: "Talent",
};

type CategoryFilter = "all" | "forbes_ai50" | "hyperscaler" | "established";

function dimValue(score: DimensionScore): number | null {
  return score.value;
}

export default function CompaniesClient({
  items,
  industries,
}: {
  items: ScoredCompany[];
  industries: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { weights, lens } = useWeights();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [industryFilter, setIndustryFilter] = useState(
    () => searchParams.get("industry") ?? "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    () => (searchParams.get("category") as CategoryFilter) ?? "all"
  );
  const [anzOnly, setAnzOnly] = useState(() => searchParams.get("anz") === "1");
  const [gravyTrainOnly, setGravyTrainOnly] = useState(
    () => searchParams.get("gravy") === "1"
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    () => (searchParams.get("sort") as SortOption) ?? "composite"
  );

  const syncUrl = useCallback(
    (updates: {
      q?: string;
      industry?: string;
      anz?: boolean;
      gravy?: boolean;
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
      if ("anz" in updates) {
        if (updates.anz) params.set("anz", "1");
        else params.delete("anz");
      }
      if ("gravy" in updates) {
        if (updates.gravy) params.set("gravy", "1");
        else params.delete("gravy");
      }
      if ("sort" in updates) {
        if (updates.sort && updates.sort !== "composite")
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
    let result = items;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        ({ company: c }) =>
          c.name.toLowerCase().includes(q) ||
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

    if (anzOnly) {
      result = result.filter(
        ({ scorecard }) => scorecard.anzDetections.length > 0
      );
    }

    // Composite depends on the user's weights + role lens, so ranking
    // recomputes client-side whenever either changes (P1.8, P1.10).
    const withComposite = result.map((item) => ({
      item,
      composite: computeComposite(item.scorecard, weights, lens).value,
    }));

    let ranked = withComposite;
    if (gravyTrainOnly) {
      ranked = ranked.filter(
        ({ composite }) => composite != null && composite >= 75
      );
    }

    const sortValue = ({
      item,
      composite,
    }: (typeof ranked)[number]): number | null => {
      switch (sortBy) {
        case "timing":
        case "territory":
        case "talent":
          return dimValue(item.scorecard.dimensions[sortBy]);
        case "gtm_momentum":
        case "funding_velocity":
        case "quota_reality":
        case "regional_balance":
        case "pmf_strength":
          return dimValue(item.scorecard.benchmarks[sortBy]);
        default:
          return composite;
      }
    };

    // Companies with insufficient data sort to the bottom — a missing
    // metric is never treated as a zero score.
    return [...ranked]
      .sort((a, b) => {
        const av = sortValue(a);
        const bv = sortValue(b);
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return bv - av;
      })
      .map(({ item }) => item);
  }, [
    items,
    search,
    industryFilter,
    categoryFilter,
    anzOnly,
    gravyTrainOnly,
    sortBy,
    weights,
    lens,
  ]);

  const hasFilters =
    search ||
    industryFilter !== "all" ||
    categoryFilter !== "all" ||
    anzOnly ||
    gravyTrainOnly;

  const resultsMessage = hasFilters
    ? `${filtered.length} companies match your filters`
    : `${filtered.length} companies`;

  const newestUpdate = useMemo(() => {
    let latest: string | null = null;
    for (const { scorecard } of items) {
      if (
        scorecard.lastUpdated &&
        (!latest || scorecard.lastUpdated > latest)
      ) {
        latest = scorecard.lastUpdated;
      }
    }
    return latest;
  }, [items]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        align="left"
        eyebrow="Forbes AI 50 · Hyperscalers · SaaS"
        title="Company benchmarks"
        description="Every score is computed from source-backed inputs — public job boards, sourced funding events, RepVue, and verified community submissions. Click any number for its provenance."
        className="mb-4"
      />
      <div className="mb-6">
        <LastUpdated iso={newestUpdate} prefix="Freshest signal retrieved" />
      </div>

      <WeightsPanel className="mb-6" />

      <div className="mb-8 flex flex-col gap-4 border border-rule bg-card p-4 sm:flex-row sm:items-center">
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
            value={sortBy}
            onValueChange={(v) => {
              if (!v) return;
              setSortBy(v as SortOption);
              syncUrl({ sort: v });
            }}
          >
            <SelectTrigger
              id="sort-by"
              className="w-[210px] border-rule bg-background"
              aria-label="Sort companies"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                ? "border-gravy bg-gravy/15 text-brief"
                : "border-rule bg-background text-muted-foreground hover:bg-accent"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Expanding into ANZ
          </button>
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
            Gravy train only (75+)
          </button>
        </div>
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
                setAnzOnly(false);
                setGravyTrainOnly(false);
                setSortBy("composite");
                router.replace(pathname, { scroll: false });
              }}
              className="focus-ring text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Companies without source-backed data rank last — never with a
          synthesized score.
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ScoredCompanyCard key={item.company.slug} item={item} />
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
