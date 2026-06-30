"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CompanyResearch,
  ResearchFinding,
  ResearchLensId,
} from "@/lib/types";
import {
  RESEARCH_LENS_META,
  RESEARCH_LENS_ORDER,
  getLensScoreColor,
  getSentimentStyles,
} from "@/lib/research-playbook";
import { THREE_T_META } from "@/lib/three-ts";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Newspaper,
  Star,
  TrendingUp,
  Users,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

const LENS_ICONS = {
  messages: MessageCircle,
  star: Star,
  users: Users,
  newspaper: Newspaper,
  trending: TrendingUp,
} as const;

function FindingCard({ finding }: { finding: ResearchFinding }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        getSentimentStyles(finding.sentiment)
      )}
    >
      <p className="text-sm text-muted-foreground">{finding.text}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge
          variant={
            finding.sentiment === "red_flag"
              ? "destructive"
              : finding.sentiment === "positive"
                ? "default"
                : "secondary"
          }
          className="text-[10px] capitalize"
        >
          {finding.sentiment === "red_flag" ? "red flag" : finding.sentiment}
        </Badge>
        <Badge variant="outline" className="text-[10px] capitalize">
          {finding.confidence}
        </Badge>
        {finding.feedsThreeT.map((t) => (
          <Badge key={t} variant="outline" className="text-[10px]">
            → {THREE_T_META[t].label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function LensPanel({
  lensId,
  lens,
  defaultOpen,
}: {
  lensId: ResearchLensId;
  lens: CompanyResearch["lenses"][ResearchLensId];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const meta = RESEARCH_LENS_META[lensId];
  const Icon = LENS_ICONS[meta.icon];

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {meta.order}
                </span>
              </div>
              <div>
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {lens.headline}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {meta.howTo}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "text-lg font-bold",
                  getLensScoreColor(lens.score)
                )}
              >
                {lens.score}
              </span>
              {open ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="space-y-4 border-t pt-4">
          {lens.findings.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What we know
              </p>
              {lens.findings.map((f) => (
                <FindingCard key={f.text} finding={f} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No findings yet — run through the checklist below.
            </p>
          )}

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              Your checklist
            </p>
            <ul className="space-y-1.5">
              {lens.checklist.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {lens.resources && lens.resources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lens.resources.map((r) => (
                <Button
                  key={r.url}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  nativeButton={false}
                  render={
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  {r.label}
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function ResearchPlaybook({
  research,
  companyName,
}: {
  research: CompanyResearch;
  companyName: string;
}) {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2">
            5-step research playbook
          </Badge>
          <h2 className="text-2xl font-bold">How we diligenced {companyName}</h2>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Your research workflow, systematized. Each lens feeds the Three
            T&apos;s — coffee chats and LinkedIn sweeps aren&apos;t separate from
            the score, they&apos;re how we build it.
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Diligence score</p>
          <p
            className={cn(
              "text-2xl font-bold",
              getLensScoreColor(research.diligenceScore)
            )}
          >
            {research.diligenceScore}/100
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-5">
        {RESEARCH_LENS_ORDER.map((id) => {
          const lens = research.lenses[id];
          const meta = RESEARCH_LENS_META[id];
          const Icon = LENS_ICONS[meta.icon];
          return (
            <div
              key={id}
              className="rounded-lg border bg-card p-3 text-center"
            >
              <Icon className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                {meta.shortLabel}
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  getLensScoreColor(lens.score)
                )}
              >
                {lens.score}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {RESEARCH_LENS_ORDER.map((id, i) => (
          <LensPanel
            key={id}
            lensId={id}
            lens={research.lenses[id]}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Run your own diligence</p>
            <p className="text-sm text-muted-foreground">
              The checklist is yours to complete. Found something we missed?
              That&apos;s the highest-signal data we can add.
            </p>
          </div>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/companies" />}>
            Compare companies
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export function ResearchPlaybookSummary({
  research,
}: {
  research: CompanyResearch;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {RESEARCH_LENS_ORDER.map((id) => {
        const meta = RESEARCH_LENS_META[id];
        const score = research.lenses[id].score;
        return (
          <Badge key={id} variant="outline" className="text-xs">
            {meta.shortLabel}:{" "}
            <span className={cn("ml-1 font-bold", getLensScoreColor(score))}>
              {score}
            </span>
          </Badge>
        );
      })}
    </div>
  );
}
