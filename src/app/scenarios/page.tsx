"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { scenarios, getCompanyBySlug } from "@/lib/data";
import { Scenario } from "@/lib/types";
import {
  Phone,
  Target,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";

function ScenarioCard({
  scenario,
  defaultExpanded,
}: {
  scenario: Scenario;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const company = getCompanyBySlug(scenario.company);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer transition-colors hover:bg-muted/30"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  scenario.difficulty === "beginner"
                    ? "secondary"
                    : scenario.difficulty === "intermediate"
                      ? "default"
                      : "destructive"
                }
                className="text-xs"
              >
                {scenario.difficulty}
              </Badge>
              {company && (
                <Badge variant="outline" className="text-xs">
                  {company.name}
                </Badge>
              )}
            </div>
            <CardTitle className="mt-2 text-lg">{scenario.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {scenario.description}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {scenario.targetRole}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {scenario.targetCompany}
          </span>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="border-t bg-muted/10 pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Objectives */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-blue-600" />
                Objectives
              </h4>
              <ul className="mt-2 space-y-1.5">
                {scenario.objectives.map((obj) => (
                  <li
                    key={obj}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Talking Points */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                Key Talking Points
              </h4>
              <ul className="mt-2 space-y-1.5">
                {scenario.talkingPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Zap className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Objections */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Common Objections to Handle
              </h4>
              <ul className="mt-2 space-y-1.5">
                {scenario.objections.map((obj) => (
                  <li
                    key={obj}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    &ldquo;{obj}&rdquo;
                  </li>
                ))}
              </ul>
            </div>

            {/* Success Criteria */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                Success Criteria
              </h4>
              <ul className="mt-2 space-y-1.5">
                {scenario.successCriteria.map((criteria) => (
                  <li
                    key={criteria}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-purple-500" />
                    {criteria}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {company && (
            <>
              <Separator className="my-6" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Practice selling <strong>{company.name}</strong>&apos;s
                  product. Use the talking points above as your framework.
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" render={<Link href={`/companies/${company.slug}`} />}>
                    View Company <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                  <Button size="sm" render={<Link href={`/outreach?company=${company.slug}`} />}>
                    Build Outreach <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense>
      <ScenariosContent />
    </Suspense>
  );
}

function ScenariosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [companyFilter, setCompanyFilter] = useState(
    () => searchParams.get("company") ?? "all"
  );
  const [difficultyFilter, setDifficultyFilter] = useState(
    () => searchParams.get("difficulty") ?? "all"
  );

  const syncUrl = useCallback(
    (updates: { company?: string; difficulty?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if ("company" in updates) {
        if (updates.company && updates.company !== "all")
          params.set("company", updates.company);
        else params.delete("company");
      }
      if ("difficulty" in updates) {
        if (updates.difficulty && updates.difficulty !== "all")
          params.set("difficulty", updates.difficulty);
        else params.delete("difficulty");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const filtered = useMemo(() => {
    let result = [...scenarios];

    if (companyFilter !== "all") {
      result = result.filter((s) => s.company === companyFilter);
    }

    if (difficultyFilter !== "all") {
      result = result.filter((s) => s.difficulty === difficultyFilter);
    }

    return result;
  }, [companyFilter, difficultyFilter]);

  const scenarioCompanies = useMemo(
    () => [...new Set(scenarios.map((s) => s.company))],
    []
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Scenario Plays</h1>
        <p className="mt-2 text-muted-foreground">
          Practice selling real products to real personas. Each scenario gives
          you talking points, objections to handle, and success criteria — so
          you can demonstrate product knowledge in your interviews.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center">
        <Select
          value={companyFilter}
          onValueChange={(v) => {
            const next = v ?? "all";
            setCompanyFilter(next);
            syncUrl({ company: next });
          }}
        >
          <SelectTrigger className="w-[200px]" aria-label="Filter by company">
            <SelectValue placeholder="Filter by company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {scenarioCompanies.map((slug) => {
              const c = getCompanyBySlug(slug);
              return c ? (
                <SelectItem key={slug} value={slug}>
                  {c.name}
                </SelectItem>
              ) : null;
            })}
          </SelectContent>
        </Select>
        <Select
          value={difficultyFilter}
          onValueChange={(v) => {
            const next = v ?? "all";
            setDifficultyFilter(next);
            syncUrl({ difficulty: next });
          }}
        >
          <SelectTrigger className="w-[200px]" aria-label="Filter by difficulty">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" aria-live="polite" aria-atomic="true">
          {filtered.length} scenarios
        </Badge>
      </div>

      {/* Scenario List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              defaultExpanded={index === 0 && companyFilter !== "all"}
            />
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center">
          <Phone className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium">No scenarios found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </Card>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-xl border bg-muted/30 p-8 text-center">
        <h3 className="text-lg font-semibold">
          Ready to put this into practice?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Find the right company, build your outreach, and use these scenarios
          to prep for your interview.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button render={<Link href="/companies" />}>
            Browse Companies <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" render={<Link href="/outreach" />}>
            Build Outreach <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
