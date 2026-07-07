"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ATTAINMENT_BAND_LABELS } from "@/lib/submissions/types";
import { REP_COMP_LABELS } from "@/lib/pricing";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const ROLE_OPTIONS = [
  ["ae", "Account Executive"],
  ["se_fde", "SE / FDE"],
  ["sdr", "SDR / BDR"],
  ["cs", "Customer Success"],
  ["other", "Other GTM"],
] as const;

const REGION_OPTIONS = ["AU", "NZ", "SG", "US", "UK", "DE", "JP", "IN"];

export default function SubmitClient({
  companies,
}: {
  companies: { slug: string; name: string }[];
}) {
  const searchParams = useSearchParams();
  const [company, setCompany] = useState(
    () => searchParams.get("company") ?? ""
  );
  const [region, setRegion] = useState("AU");
  const [role, setRole] = useState("ae");
  const [oteBaseSplit, setOteBaseSplit] = useState("");
  const [attainmentBand, setAttainmentBand] = useState("75_100");
  const [rampMonths, setRampMonths] = useState("6");
  const [compModel, setCompModel] = useState("booking");
  const [freeText, setFreeText] = useState("");
  const [verifyMode, setVerifyMode] = useState<"email" | "invite">("email");
  const [workEmail, setWorkEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "submitting" }
    | { state: "error"; message: string }
    | { state: "done"; message: string }
  >({ state: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          region,
          role,
          ote_base_split: oteBaseSplit,
          attainment_band: attainmentBand,
          ramp_months: Number(rampMonths),
          comp_model: compModel,
          free_text: freeText,
          work_email: verifyMode === "email" ? workEmail : "",
          invite_code: verifyMode === "invite" ? inviteCode : "",
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setStatus({
          state: "error",
          message: data.error ?? "Submission failed",
        });
        return;
      }
      setStatus({ state: "done", message: data.message ?? "Thanks!" });
    } catch {
      setStatus({ state: "error", message: "Network error — try again" });
    }
  }

  if (status.state === "done") {
    return (
      <div className="border border-rule bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-signal" aria-hidden />
        <h2 className="font-display mt-4 text-xl font-semibold">
          Submission received
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {status.message}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" render={<Link href="/companies" />}>
            Back to companies
          </Button>
          <Button
            onClick={() => {
              setStatus({ state: "idle" });
              setOteBaseSplit("");
              setFreeText("");
            }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-rule bg-card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="sub-company">Company</Label>
          <Select value={company} onValueChange={(v) => setCompany(v ?? "")}>
            <SelectTrigger id="sub-company" className="mt-1.5 w-full border-rule">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sub-region">Region</Label>
          <Select value={region} onValueChange={(v) => setRegion(v ?? "AU")}>
            <SelectTrigger id="sub-region" className="mt-1.5 w-full border-rule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGION_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sub-role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v ?? "ae")}>
            <SelectTrigger id="sub-role" className="mt-1.5 w-full border-rule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sub-ote">OTE / base split</Label>
          <Input
            id="sub-ote"
            className="mt-1.5 border-rule"
            placeholder="e.g. AU$150k base / AU$300k OTE (50/50)"
            value={oteBaseSplit}
            onChange={(e) => setOteBaseSplit(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="sub-attainment">Quota attainment (last full period)</Label>
          <Select
            value={attainmentBand}
            onValueChange={(v) => setAttainmentBand(v ?? "75_100")}
          >
            <SelectTrigger
              id="sub-attainment"
              className="mt-1.5 w-full border-rule"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ATTAINMENT_BAND_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sub-ramp">Ramp time (months to first full quota)</Label>
          <Input
            id="sub-ramp"
            className="mt-1.5 border-rule"
            type="number"
            min={0}
            max={36}
            value={rampMonths}
            onChange={(e) => setRampMonths(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="sub-comp-model">
            How are you actually comped? (rep_comp_model)
          </Label>
          <Select
            value={compModel}
            onValueChange={(v) => setCompModel(v ?? "booking")}
          >
            <SelectTrigger
              id="sub-comp-model"
              className="mt-1.5 w-full border-rule"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REP_COMP_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="sub-freetext">Anything else (optional)</Label>
          <Textarea
            id="sub-freetext"
            className="mt-1.5 border-rule"
            placeholder="Territory quality, accelerators, what you wish you'd known…"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-rule pt-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-gravy" aria-hidden />
          Lightweight verification
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          We store only a SHA-256 hash of your work email — never the address
          — or you can use an invite code. Aggregates render only when 3+
          verified submissions exist per company-region, so an individual
          submission is never identifiable.
        </p>
        <div className="mt-3 flex gap-1.5">
          {(
            [
              ["email", "Work email"],
              ["invite", "Invite code"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setVerifyMode(mode)}
              aria-pressed={verifyMode === mode}
              className={`focus-ring border px-2.5 py-1 text-xs font-medium transition-colors ${
                verifyMode === mode
                  ? "border-brief bg-brief text-primary-foreground"
                  : "border-rule bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 max-w-sm">
          {verifyMode === "email" ? (
            <>
              <Label htmlFor="sub-email">Work email (hashed, never stored)</Label>
              <Input
                id="sub-email"
                className="mt-1.5 border-rule"
                type="email"
                placeholder="you@company.com"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
              />
            </>
          ) : (
            <>
              <Label htmlFor="sub-invite">Invite code</Label>
              <Input
                id="sub-invite"
                className="mt-1.5 border-rule"
                placeholder="e.g. GTM-EARLY-2026"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </>
          )}
        </div>
      </div>

      {status.state === "error" && (
        <p className="mt-4 border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {status.message}
        </p>
      )}

      <Button
        type="submit"
        className="mt-6"
        disabled={status.state === "submitting" || !company}
      >
        {status.state === "submitting"
          ? "Submitting…"
          : "Submit anonymously"}
      </Button>
    </form>
  );
}
