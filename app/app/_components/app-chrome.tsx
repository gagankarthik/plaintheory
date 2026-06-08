"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoWithWordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

import { AppNav } from "./app-nav";
import { BottomNav } from "./bottom-nav";
import { UserMenu } from "./user-menu";

/**
 * Global app chrome (top header + mobile bottom nav). The Finance section
 * runs as its own full-screen surface with a different top bar, so we hide
 * the standard chrome on any /app/finance route.
 */
export function AppChrome({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const standalone = pathname.startsWith("/app/finance");

  if (standalone) {
    return (
      <main id="main" className="flex-1">
        {children}
      </main>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <Link href="/app" className="shrink-0">
            <LogoWithWordmark />
          </Link>
          <div className="hidden min-w-0 flex-1 lg:block">
            <AppNav />
          </div>
          <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2 lg:flex-none">
            <ThemeToggle />
            <UserMenu email={email} />
          </div>
        </div>
      </header>
      <main id="main" className={cn("flex-1 pb-24 lg:pb-0")}>
        {children}
      </main>
      <BottomNav />
    </>
  );
}
