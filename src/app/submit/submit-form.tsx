"use client";

import { useState, type FormEvent } from "react";
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
import {
  ATTAINMENT_BAND_LABELS,
  type AttainmentBand,
  type SubmissionRegion,
  type SubmissionRole,
} from "@/lib/community/types";
import { REP_COMP_LABELS, type RepCompModel } from "@/lib/pricing-models";
import { CheckCircle2, CircleAlert } from "lucide-react";

const REGIONS: SubmissionRegion[] = ["ANZ", "APAC", "AMER", "EMEA", "LATAM"];
const ROLES: SubmissionRole[] = ["AE", "SE", "FDE", "SDR", "CS", "Other GTM"];
const COMP_MODELS: Exclude<RepCompModel, "unknown">[] = [
  "booking",
  "consumption",
  "hybrid",
];

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function SubmitForm({
  companies,
}: {
  companies: { slug: string; name: string }[];
}) {
  const [companySlug, setCompanySlug] = useState("");
  const [region, setRegion] = useState<SubmissionRegion>("ANZ");
  const [role, setRole] = useState<SubmissionRole>("AE");
  const [oteUsd, setOteUsd] = useState("");
  const [baseUsd, setBaseUsd] = useState("");
  const [attainmentBand, setAttainmentBand] =
    useState<AttainmentBand>("70_100");
  const [rampMonths, setRampMonths] = useState("");
  const [compModel, setCompModel] =
    useState<Exclude<RepCompModel, "unknown">>("booking");
  const [freeText, setFreeText] = useState("");
  const [verifyMethod, setVerifyMethod] = useState<"email" | "invite">(
    "email"
  );
  const [workEmail, setWorkEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!companySlug) {
      setStatus({ state: "error", message: "Pick a company." });
      return;
    }
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug,
          region,
          role,
          oteUsd: Number(oteUsd),
          baseUsd: Number(baseUsd),
          attainmentBand,
          rampMonths: Number(rampMonths),
          compModel,
          freeText,
          workEmail: verifyMethod === "email" ? workEmail : undefined,
          inviteCode: verifyMethod === "invite" ? inviteCode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({
          state: "error",
          message: data.error ?? "Submission failed.",
        });
        return;
      }
      setStatus({ state: "success", message: data.message });
    } catch {
      setStatus({
        state: "error",
        message: "Network error — please try again.",
      });
    }
  }

  if (status.state === "success") {
    return (
      <div className="border border-signal/30 bg-signal/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-signal" aria-hidden />
        <h2 className="font-display mt-3 text-xl font-semibold">
          Submission received
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {status.message}
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => setStatus({ state: "idle" })}
        >
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 border border-rule bg-card p-6"
      aria-label="Anonymous comp submission"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Select
            value={companySlug || null}
            onValueChange={(v) => setCompanySlug(v ?? "")}
          >
            <SelectTrigger id="company" className="w-full border-rule">
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
        <div className="space-y-1.5">
          <Label htmlFor="region">Region</Label>
          <Select
            value={region}
            onValueChange={(v) => v && setRegion(v as SubmissionRegion)}
          >
            <SelectTrigger id="region" className="w-full border-rule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Select
            value={role}
            onValueChange={(v) => v && setRole(v as SubmissionRole)}
          >
            <SelectTrigger id="role" className="w-full border-rule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comp-model">Comp model</Label>
          <Select
            value={compModel}
            onValueChange={(v) =>
              v && setCompModel(v as Exclude<RepCompModel, "unknown">)
            }
          >
            <SelectTrigger id="comp-model" className="w-full border-rule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMP_MODELS.map((m) => (
                <SelectItem key={m} value={m}>
                  {REP_COMP_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ote">OTE (USD)</Label>
          <Input
            id="ote"
            type="number"
            min={20000}
            max={2000000}
            required
            placeholder="e.g. 300000"
            value={oteUsd}
            onChange={(e) => setOteUsd(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="base">Base (USD)</Label>
          <Input
            id="base"
            type="number"
            min={10000}
            max={2000000}
            required
            placeholder="e.g. 150000"
            value={baseUsd}
            onChange={(e) => setBaseUsd(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="attainment">Attainment last full year</Label>
          <Select
            value={attainmentBand}
            onValueChange={(v) => v && setAttainmentBand(v as AttainmentBand)}
          >
            <SelectTrigger id="attainment" className="w-full border-rule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(ATTAINMENT_BAND_LABELS) as [
                  AttainmentBand,
                  string,
                ][]
              ).map(([band, label]) => (
                <SelectItem key={band} value={band}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ramp">Ramp (months to full quota)</Label>
          <Input
            id="ramp"
            type="number"
            min={0}
            max={24}
            step={0.5}
            required
            placeholder="e.g. 6"
            value={rampMonths}
            onChange={(e) => setRampMonths(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="free-text">Anything else (optional)</Label>
        <Textarea
          id="free-text"
          rows={3}
          maxLength={2000}
          placeholder="Territory quality, quota fairness, accelerators, culture…"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
        />
      </div>

      <fieldset className="border border-rule bg-muted/20 p-4">
        <legend className="px-1 font-mono-data text-[10px] uppercase tracking-widest text-gravy">
          Verification
        </legend>
        <div className="mb-3 flex gap-2" role="radiogroup" aria-label="Verification method">
          <button
            type="button"
            role="radio"
            aria-checked={verifyMethod === "email"}
            onClick={() => setVerifyMethod("email")}
            className={`focus-ring px-3 py-1.5 text-xs font-medium ${
              verifyMethod === "email"
                ? "bg-brief text-primary-foreground"
                : "border border-rule text-muted-foreground hover:bg-accent"
            }`}
          >
            Work email
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={verifyMethod === "invite"}
            onClick={() => setVerifyMethod("invite")}
            className={`focus-ring px-3 py-1.5 text-xs font-medium ${
              verifyMethod === "invite"
                ? "bg-brief text-primary-foreground"
                : "border border-rule text-muted-foreground hover:bg-accent"
            }`}
          >
            Invite code
          </button>
        </div>
        {verifyMethod === "email" ? (
          <div className="space-y-1.5">
            <Label htmlFor="work-email">Work email</Label>
            <Input
              id="work-email"
              type="email"
              required
              placeholder="you@company.com"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Hashed with SHA-256 before storage — the raw address is never
              kept, and you&apos;ll never receive email from us.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="invite-code">Invite code</Label>
            <Input
              id="invite-code"
              type="text"
              required
              placeholder="GTMHIRE-…"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              For people between roles — ask anyone who has submitted before.
            </p>
          </div>
        )}
      </fieldset>

      {status.state === "error" && (
        <p
          role="alert"
          className="flex items-center gap-2 border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
          {status.message}
        </p>
      )}

      <Button type="submit" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Submitting…" : "Submit anonymously"}
      </Button>
    </form>
  );
}
