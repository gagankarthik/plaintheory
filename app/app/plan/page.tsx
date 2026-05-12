import { redirect } from "next/navigation";

import { generateDailyPlan } from "@/lib/ai/daily-plan";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { getPlan } from "@/lib/db/plans";
import { getUser } from "@/lib/db/user";

import { PlanView } from "./_components/plan-view";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/sign-in");

  const user = await getUser(session.userId);
  if (!user || user.onboarding.step !== "complete") redirect("/onboarding");

  const date = await getLocalDate();
  let plan = await getPlan(session.userId, date);
  let error: string | null = null;

  if (!plan) {
    try {
      plan = await generateDailyPlan(session.userId, date);
    } catch (e) {
      error = e instanceof Error ? e.message : "Plan generation failed";
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {error ? (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn&rsquo;t generate today&rsquo;s plan. {error}
        </div>
      ) : null}
      {plan ? <PlanView key={plan.date} plan={plan} /> : null}
    </div>
  );
}
