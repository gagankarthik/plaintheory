import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoWithWordmark } from "@/components/brand/logo";
import { DaySync } from "@/components/day-sync";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth/session";
import { ensureUser, getUser } from "@/lib/db/user";
import { SessionRefresher } from "@/components/session-refresher";

import { AppNav } from "./_components/app-nav";
import { BottomNav } from "./_components/bottom-nav";
import { UserMenu } from "./_components/user-menu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();
  if (!session) redirect("/sign-in");

  let userEmail = session.email;
  try {
    let user = await getUser(session.userId);
    if (!user) {
      user = await ensureUser(session.userId, session.email);
    }
    // Block soft-deleted accounts from accessing the app.
    if (user.deletedAt) {
      await clearSessionCookie();
      redirect("/sign-in");
    }
    if (user.onboarding.step !== "complete") {
      redirect("/onboarding");
    }
    userEmail = user.email;
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[app layout] user lookup failed:", err);
    redirect("/onboarding");
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
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
            <UserMenu email={userEmail} />
          </div>
        </div>
      </header>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <main id="main" className="flex-1 pb-24 lg:pb-0">{children}</main>
      <BottomNav />
      <DaySync />
      <SessionRefresher />
    </div>
  );
}
