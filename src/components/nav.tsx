"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart3,
  BellRing,
  BookOpenText,
  Building2,
  Menu,
  Radar,
  Train,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Benchmarks", icon: BarChart3 },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/signals", label: "Signals", icon: Radar },
  { href: "/methodology", label: "Methodology", icon: BookOpenText },
  { href: "/agent", label: "Alerts", icon: BellRing },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 hairline-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center border border-brief bg-brief text-primary-foreground">
            <Train className="h-4 w-4" aria-hidden />
          </div>
          <div className="leading-none">
            <span className="font-display text-lg font-semibold tracking-tight">
              GTM Hire
            </span>
            <span className="font-mono-data block text-[10px] uppercase tracking-widest text-muted-foreground">
              Benchmarks
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brief text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Button size="sm" render={<Link href="/submit" />}>
            Submit comp data
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden"
            render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="mt-8 flex flex-col gap-2" aria-label="Mobile">
              {navItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brief text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
              <Button size="sm" className="mt-4" render={<Link href="/submit" />}>
                Submit comp data
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
