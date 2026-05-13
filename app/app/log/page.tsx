import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate, isLocalDay, getLocalTzOffset } from "@/lib/date";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { getUser } from "@/lib/db/user";

import { LogView } from "./_components/log-view";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const [logs, user, date, tzOffset] = await Promise.all([
    listSymptomLogs(session.userId, { limit: 30 }),
    getUser(session.userId),
    getLocalDate(),
    getLocalTzOffset(),
  ]);

  const hydrationTarget = user?.onboarding.body?.hydrationTargetGlasses ?? 8;
  const waterToday = logs.filter(
    (l) => l.symptomType === "water" && isLocalDay(l, date, tzOffset),
  ).length;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Check in</p>
        <h1 className="font-serif text-3xl tracking-tight">How are you, really?</h1>
        <p className="text-sm text-muted-foreground">
          Quick logs build the pattern. Skip the long entries — a number and a word is plenty.
        </p>
      </div>
      <LogView
        initialLogs={logs}
        waterToday={waterToday}
        hydrationTarget={hydrationTarget}
      />
    </div>
  );
}
