"use client";

import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  LayoutDashboard,
  PiggyBank,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { displayName } from "@/lib/user-display";

import { UserMenu } from "../../_components/user-menu";

const TABS = [
  { href: "/app/finance", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/finance/reports", label: "Reports", icon: BarChart3 },
  { href: "/app/finance/expense", label: "Expense", icon: ArrowDownRight },
  { href: "/app/finance/earning", label: "Earning", icon: ArrowUpRight },
  { href: "/app/finance/saving", label: "Saving", icon: PiggyBank },
];

export function FinanceTopbar({ email }: { email: string }) {
  const pathname = usePathname() ?? "";
  const name = email ? displayName(email) : "";
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6">
        {/* Title row */}
        <div className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/app"
              aria-label="Back to app"
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <p className="font-serif text-lg tracking-tight text-foreground sm:text-xl">
              Finance
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {name ? (
              <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:inline">
                Hi, {name}
              </span>
            ) : null}
            <ThemeToggle />
            {email ? <UserMenu email={email} /> : null}
          </div>
        </div>
        {/* Tabs row — horizontally scrollable on mobile */}
        <nav className="-mx-1 flex items-center gap-1 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
