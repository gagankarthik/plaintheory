import { redirect } from "next/navigation";

import { generateDailyPlan } from "@/lib/ai/daily-plan";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { getPlan } from "@/lib/db/plans";
import { getUser } from "@/lib/db/user";

import { CheckoutSuccess } from "./_components/checkout-success";
import { PlanView } from "./_components/plan-view";
import { RoutinesSidebar } from "./_components/routines-sidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Today's Plan",
  description: "Your personalised daily coaching plan — tasks, routines, and reflection prompts.",
};

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const checkoutStatus = params.checkout;
  const session = await getCurrentUser();
  if (!session) redirect("/sign-in");

  const user = await getUser(session.userId);
  if (!user || user.onboarding.step !== "complete") redirect("/onboarding");

  const isPlus = !!(user.subscriptionPlan || user.stripeCustomerId);

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

  const routines = plan?.routines ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {checkoutStatus === "success" ? <CheckoutSuccess /> : null}
      {error ? (
        <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn&rsquo;t generate today&rsquo;s plan. {error}
        </div>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1">
          {plan ? <PlanView key={plan.date} plan={plan} isPlus={isPlus} /> : null}
        </div>
        <div className="w-full lg:w-80 lg:shrink-0">
          <RoutinesSidebar routines={routines} isPlus={isPlus} />
        </div>
      </div>
    </div>
  );
}
