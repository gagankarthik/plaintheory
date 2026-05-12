import { getCurrentUser } from "@/lib/auth/session";
import { listSymptomLogs } from "@/lib/db/symptoms";

import { LogView } from "./_components/log-view";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const logs = await listSymptomLogs(session.userId, { limit: 30 });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Check in</p>
        <h1 className="font-serif text-3xl tracking-tight">How are you, really?</h1>
        <p className="text-sm text-muted-foreground">
          Quick logs build the pattern. Skip the long entries — a number and a word is plenty.
        </p>
      </div>
      <LogView initialLogs={logs} />
    </div>
  );
}
