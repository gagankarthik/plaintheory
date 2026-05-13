import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { listThreads } from "@/lib/db/chat";
import { getDailyUsage } from "@/lib/db/usage";
import { getUser, isPlusUser } from "@/lib/db/user";

import { ChatView } from "./_components/chat-view";

export const dynamic = "force-dynamic";

const FREE_CHAT_DAILY_LIMIT = 5;

export default async function ChatPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const [user, threads, today] = await Promise.all([
    getUser(session.userId),
    listThreads(session.userId),
    getLocalDate(),
  ]);
  const region = user?.onboarding.region ?? null;
  const isPlus = user ? isPlusUser(user) : false;
  const initialUsage = isPlus
    ? null
    : { used: await getDailyUsage(session.userId, today), limit: FREE_CHAT_DAILY_LIMIT };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chat</p>
        <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">
          Your coach, ready when you are.
        </h1>
      </div>
      <ChatView
        initialThreadId={threads[0]?.threadId ?? null}
        region={region}
        userEmail={user?.email ?? session.email}
        isPlus={isPlus}
        initialUsage={initialUsage}
      />
    </div>
  );
}
