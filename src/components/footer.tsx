import Link from "next/link";
import { Train } from "lucide-react";

export function Footer() {
  return (
    <footer className="hairline-b border-t bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border border-brief bg-brief text-primary-foreground">
                <Train className="h-4 w-4" aria-hidden />
              </div>
              <span className="font-display text-lg font-semibold">GTM Hire</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Find companies where the product sells itself. Score the Three
              T&apos;s and join the gravy train.
            </p>
          </div>
          <div>
            <h2 className="font-mono-data mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Platform
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/companies" className="hover:text-foreground">
                  Gravy train finder
                </Link>
              </li>
              <li>
                <Link href="/outreach" className="hover:text-foreground">
                  Outreach builder
                </Link>
              </li>
              <li>
                <Link href="/scenarios" className="hover:text-foreground">
                  Scenario plays
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-mono-data mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Resources
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>GTM career guide</li>
              <li>Salary benchmarks</li>
              <li>Interview prep</li>
            </ul>
          </div>
          <div>
            <h2 className="font-mono-data mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Company
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 hairline-b border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GTM Hire
        </div>
      </div>
    </footer>
  );
}
