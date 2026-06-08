import { redirect } from "next/navigation";

import { DaySync } from "@/components/day-sync";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth/session";
import { ensureUser, getUser } from "@/lib/db/user";
import { SessionRefresher } from "@/components/session-refresher";

import { PaymentFailedBanner } from "@/components/payment-failed-banner";

import { AppChrome } from "./_components/app-chrome";
import { EmergencyButton } from "./_components/emergency-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();
  if (!session) redirect("/sign-in");

  let userEmail = session.email;
  let subscriptionStatus: string | undefined;
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
    subscriptionStatus = user.subscriptionStatus ?? undefined;
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[app layout] user lookup failed:", err);
    redirect("/onboarding");
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      {subscriptionStatus === "past_due" ? <PaymentFailedBanner /> : null}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppChrome email={userEmail}>{children}</AppChrome>
      <EmergencyButton />
      <DaySync />
      <SessionRefresher />
    </div>
  );
}
