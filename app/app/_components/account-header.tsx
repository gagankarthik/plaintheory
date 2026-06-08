"use client";

import { Settings, Target, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app/profile", label: "Profile", icon: User },
  { href: "/app/goals", label: "Goals", icon: Target },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

/**
 * Shared header for the account-related pages (Profile / Goals / Settings).
 * Gives them one identity block and a sub-nav so users can move between the
 * three related surfaces without going back to a menu.
 */
export function AccountHeader({
  name,
  email,
  plan,
  isPlus,
}: {
  name: string;
  email: string;
  plan: string;
  isPlus: boolean;
}) {
  const pathname = usePathname() ?? "";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar seed={email} size={56} className="size-14 shrink-0 sm:size-16" />
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Your account
          </p>
          <h1 className="truncate font-serif text-2xl tracking-tight sm:text-3xl">{name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm text-muted-foreground">{email}</p>
            <Badge variant={isPlus ? "primary" : "outline"} className="shrink-0">
              {plan}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="-mx-1 flex items-center gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card/60 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
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
  );
}
