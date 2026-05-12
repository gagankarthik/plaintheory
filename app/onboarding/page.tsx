import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoWithWordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureUser, getUser } from "@/lib/db/user";

import { Wizard } from "./_components/wizard";

export default async function OnboardingPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  let user = await getUser(session.userId);
  if (!user) {
    user = await ensureUser(session.userId, session.email);
  }
  if (user.onboarding.step === "complete") {
    redirect("/app");
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/">
          <LogoWithWordmark />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col">
        <Wizard initial={user.onboarding} />
      </main>
    </div>
  );
}
