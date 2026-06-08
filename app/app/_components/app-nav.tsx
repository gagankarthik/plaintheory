"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app", label: "Home", exact: true },
  { href: "/app/plan", label: "Today" },
  { href: "/app/habits", label: "Habits" },
  { href: "/app/log", label: "Log" },
  { href: "/app/finance", label: "Finance" },
  { href: "/app/chat", label: "Chat" },
  { href: "/app/insights", label: "Insights" },
];

export function AppNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto sm:gap-1">
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
