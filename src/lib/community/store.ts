import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CommunitySubmission } from "./types";

/**
 * Runtime submission store. Submissions are appended to a JSON file outside
 * the committed source tree (gitignored) — in production this would be a
 * database table; the storage layer is isolated here so it can be swapped.
 */
const STORE_PATH = join(process.cwd(), "data", "community", "submissions.json");

const FREE_MAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "mail.com",
]);

/** Rotating invite codes for people between roles (no work email). */
const INVITE_CODES = new Set(["GTMHIRE-ANZ-2026", "GTMHIRE-BETA"]);

export function readSubmissions(): CommunitySubmission[] {
  if (!existsSync(STORE_PATH)) return [];
  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeSubmissions(subs: CommunitySubmission[]) {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(subs, null, 2) + "\n");
}

export type VerificationResult =
  | { ok: true; verification: CommunitySubmission["verification"] }
  | { ok: false; error: string };

export function verifySubmitter(input: {
  workEmail?: string;
  inviteCode?: string;
}): VerificationResult {
  if (input.workEmail) {
    const email = input.workEmail.trim().toLowerCase();
    const match = email.match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/);
    if (!match) return { ok: false, error: "Invalid email address." };
    const domain = match[1];
    if (FREE_MAIL_DOMAINS.has(domain)) {
      return {
        ok: false,
        error:
          "Please use a work email (personal email providers are not accepted), or use an invite code.",
      };
    }
    return {
      ok: true,
      verification: {
        method: "work_email_hash",
        hash: createHash("sha256").update(email).digest("hex"),
        emailDomain: domain,
      },
    };
  }

  if (input.inviteCode) {
    const code = input.inviteCode.trim().toUpperCase();
    if (!INVITE_CODES.has(code)) {
      return { ok: false, error: "Invalid invite code." };
    }
    return {
      ok: true,
      verification: {
        method: "invite_code",
        hash: createHash("sha256").update(code).digest("hex"),
      },
    };
  }

  return { ok: false, error: "Provide a work email or an invite code." };
}

export function appendSubmission(
  submission: Omit<CommunitySubmission, "id" | "submittedAt">
): CommunitySubmission {
  const record: CommunitySubmission = {
    ...submission,
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  const all = readSubmissions();
  all.push(record);
  writeSubmissions(all);
  return record;
}
