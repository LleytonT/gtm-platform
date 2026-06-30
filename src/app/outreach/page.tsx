"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { companies } from "@/lib/data";
import { Company } from "@/lib/types";
import {
  Mail,
  Link2,
  Users,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function generateEmailTemplate(
  company: Company,
  role: string,
  managerName: string
): string {
  return `Subject: ${role} opportunity at ${company.name} — quick question

Hi ${managerName || "[Hiring Manager]"},

I've been following ${company.name}'s growth in the ${company.industry} space — ${company.financials.growthRate} YoY growth and ${company.pmf.retention} net dollar retention are seriously impressive numbers.

I'm currently an SDR looking to make my next move, and ${company.name} stands out for a few reasons:

• The ${company.pmf.competitivePosition.toLowerCase()} position in ${company.industry} means there's real product-market fit — which makes selling dramatically easier
• ${company.pmf.signals[0]}
• The GTM team is ${company.gtmTeamSize}, which tells me you're investing heavily in go-to-market

I'd love to learn more about the ${role} role and what you're looking for in your next hire. Would you have 15 minutes this week for a quick call?

I've done my homework on ${company.name} and can speak to how I'd approach selling your product — happy to demonstrate that in our conversation.

Best,
[Your Name]`;
}

function generateLinkedInTemplate(
  company: Company,
  role: string,
  managerName: string
): string {
  return `Hi ${managerName || "[Name]"},

I came across the ${role} opening at ${company.name} and wanted to reach out directly rather than just applying through the portal.

${company.name}'s ${company.financials.growthRate} growth caught my eye — combined with ${company.pmf.retention} net retention, it's clear there's strong PMF here. That's exactly the kind of company I want to sell for.

I'm an SDR who's done the research on ${company.name}'s position in ${company.industry} and I'd love to share how I'd approach selling your product.

Open to a quick chat this week?`;
}

function generateReferralTemplate(
  company: Company,
  role: string,
  contactName: string
): string {
  return `Hi ${contactName || "[Contact Name]"},

Hope you're doing well! I noticed you're at ${company.name} and I wanted to reach out because I'm actively looking at opportunities there.

I've been researching the company pretty deeply — the ${company.financials.growthRate} growth rate, ${company.pmf.retention} net retention, and the way they're positioned as a ${company.pmf.competitivePosition.toLowerCase()} in ${company.industry} is really compelling.

I'm looking at the ${role} role specifically. Would you be open to:

1. Sharing what it's actually like selling at ${company.name}?
2. If it's a good fit, potentially referring me to the hiring manager?

I know referral bonuses are usually pretty solid at companies like ${company.name}, so it could be a win-win. No pressure at all either way — I'd genuinely appreciate any insight you can share about the culture and sales org.

Thanks so much!
[Your Name]`;
}

export default function OutreachPage() {
  return (
    <Suspense>
      <OutreachContent />
    </Suspense>
  );
}

function OutreachContent() {
  const searchParams = useSearchParams();
  const preselectedCompany = searchParams.get("company") || "";

  const [selectedCompany, setSelectedCompany] = useState(preselectedCompany);
  const [role, setRole] = useState("");
  const [managerName, setManagerName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const company = useMemo(
    () => companies.find((c) => c.slug === selectedCompany),
    [selectedCompany]
  );

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const emailTemplate = company
    ? generateEmailTemplate(company, role || "SDR/AE", managerName)
    : "";
  const linkedinTemplate = company
    ? generateLinkedInTemplate(company, role || "SDR/AE", managerName)
    : "";
  const referralTemplate = company
    ? generateReferralTemplate(company, role || "SDR/AE", managerName)
    : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Outreach Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Generate personalized outreach to hiring managers, recruiters, and
          referrals at your target company. Don&apos;t just apply — get in the
          door.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4" aria-hidden />
                Configure outreach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company">Target Company</Label>
                <Select
                  value={selectedCompany}
                  onValueChange={(v) => setSelectedCompany(v ?? "")}
                >
                  <SelectTrigger id="company" className="mt-1.5">
                    <SelectValue placeholder="Select a company" />
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
                <Label htmlFor="role">Target Role</Label>
                <Input
                  id="role"
                  name="target-role"
                  autoComplete="organization-title"
                  placeholder="e.g. SDR, Commercial AE…"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="manager">
                  Hiring Manager / Contact Name
                </Label>
                <Input
                  id="manager"
                  name="contact-name"
                  autoComplete="name"
                  spellCheck={false}
                  placeholder="e.g. Sarah Johnson…"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              {company && (
                <>
                  <Separator />
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Company Intel
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Revenue:</span>{" "}
                        {company.financials.revenue}
                      </p>
                      <p>
                        <span className="font-medium">Growth:</span>{" "}
                        {company.financials.growthRate}
                      </p>
                      <p>
                        <span className="font-medium">Retention:</span>{" "}
                        {company.pmf.retention}
                      </p>
                      <p>
                        <span className="font-medium">OTE:</span>{" "}
                        {company.packages.ote}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2">
          {company ? (
            <Tabs defaultValue="email">
              <TabsList className="mb-4">
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="gap-2">
                  <Link2 className="h-3.5 w-3.5" />
                  LinkedIn
                </TabsTrigger>
                <TabsTrigger value="referral" className="gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Referral Ask
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Email to Hiring Manager
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(emailTemplate, "email")}
                    >
                      {copied === "email" ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" /> Copy
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={emailTemplate}
                      readOnly
                      className="min-h-[400px] font-mono text-sm"
                    />
                    <p className="mt-3 text-xs text-muted-foreground">
                      Personalized using {company.name}&apos;s real financial data and
                      PMF signals. Edit as needed before sending.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="linkedin">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      LinkedIn Connection Request
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(linkedinTemplate, "linkedin")}
                    >
                      {copied === "linkedin" ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" /> Copy
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={linkedinTemplate}
                      readOnly
                      className="min-h-[300px] font-mono text-sm"
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {linkedinTemplate.length} characters
                      </Badge>
                      {linkedinTemplate.length > 300 && (
                        <Badge
                          variant="destructive"
                          className="text-xs"
                        >
                          Over LinkedIn 300 char limit — shorten for connection
                          request
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="referral">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Referral Request
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(referralTemplate, "referral")}
                    >
                      {copied === "referral" ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" /> Copy
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={referralTemplate}
                      readOnly
                      className="min-h-[350px] font-mono text-sm"
                    />
                    <p className="mt-3 text-xs text-muted-foreground">
                      Send this to someone you know at {company.name} or a mutual
                      connection. Adjust the tone based on your relationship.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="flex items-center justify-center py-20">
              <div className="text-center">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-lg font-medium">
                  Select a company to get started
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a target company and role to generate personalized
                  outreach templates
                </p>
                <Button variant="outline" className="mt-4" render={<Link href="/companies" />}>
                  Browse Companies <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
