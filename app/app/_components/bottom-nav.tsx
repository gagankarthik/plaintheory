"use client";

import { Home, ListChecks, MessageCircle, NotebookPen, Repeat } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  icon: typeof Home;
  label: string;
  exact?: boolean;
};

const TABS: Tab[] = [
  { href: "/app", icon: Home, label: "Home", exact: true },
  { href: "/app/plan", icon: ListChecks, label: "Today" },
  { href: "/app/habits", icon: Repeat, label: "Habits" },
  { href: "/app/log", icon: NotebookPen, label: "Log" },
  { href: "/app/chat", icon: MessageCircle, label: "Chat" },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-2xl transition-all",
                    active ? "bg-primary/10" : "bg-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 transition-transform",
                      active ? "scale-110" : "",
                    )}
                  />
                </span>
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
