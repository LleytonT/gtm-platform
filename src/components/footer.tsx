import Link from "next/link";
import { Train } from "lucide-react";

export function Footer() {
  return (
    <footer className="hairline-b border-t bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border border-brief bg-brief text-primary-foreground">
                <Train className="h-4 w-4" aria-hidden />
              </div>
              <span className="font-display text-lg font-semibold">GTM Hire</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Quantitative benchmarks for GTM professionals finding their next
              company. Forbes AI 50, hyperscalers, and established SaaS —
              scored on signals that matter.
            </p>
          </div>
          <div>
            <h2 className="font-mono-data mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Benchmarks
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Live rankings
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-foreground">
                  Company directory
                </Link>
              </li>
              <li>
                <Link href="/companies?category=forbes_ai50" className="hover:text-foreground">
                  Forbes AI 50
                </Link>
              </li>
              <li>
                <Link href="/companies?category=hyperscaler" className="hover:text-foreground">
                  Hyperscalers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-mono-data mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Data & trust
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Public job boards (Greenhouse / Lever / Ashby APIs)</li>
              <li>RepVue rep-sentiment percentiles</li>
              <li>Curated funding &amp; press events (sourced)</li>
              <li>Verified community submissions (n ≥ 3)</li>
              <li>
                <Link href="/methodology" className="underline hover:text-foreground">
                  Methodology &amp; limitations
                </Link>
              </li>
              <li>
                <Link href="/submit" className="underline hover:text-foreground">
                  Submit comp / quota data
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 hairline-b border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GTM Hire · Every rendered score
          carries source records — metrics without sources show
          &ldquo;insufficient data&rdquo;. Disputes &amp; corrections:{" "}
          <a href="mailto:corrections@gtmhire.example" className="underline">
            corrections@gtmhire.example
          </a>
        </div>
      </div>
    </footer>
  );
}
