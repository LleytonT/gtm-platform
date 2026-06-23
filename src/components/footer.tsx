import Link from "next/link";
import { Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Rocket className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">GTM Hire</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Helping GTM professionals find and land roles at companies worth
              selling for.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/companies" className="hover:text-foreground">
                  Company Ratings
                </Link>
              </li>
              <li>
                <Link href="/outreach" className="hover:text-foreground">
                  Outreach Builder
                </Link>
              </li>
              <li>
                <Link href="/scenarios" className="hover:text-foreground">
                  Scenario Plays
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-foreground">GTM Career Guide</span>
              </li>
              <li>
                <span className="hover:text-foreground">
                  Salary Benchmarks
                </span>
              </li>
              <li>
                <span className="hover:text-foreground">Interview Prep</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-foreground">About</span>
              </li>
              <li>
                <span className="hover:text-foreground">Blog</span>
              </li>
              <li>
                <span className="hover:text-foreground">Contact</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GTM Hire. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
