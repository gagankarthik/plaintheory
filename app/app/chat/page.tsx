import { getCurrentUser } from "@/lib/auth/session";
import { listThreads } from "@/lib/db/chat";
import { getUser } from "@/lib/db/user";

import { ChatView } from "./_components/chat-view";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const user = await getUser(session.userId);
  const threads = await listThreads(session.userId);
  const region = user?.onboarding.region ?? null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chat</p>
        <h1 className="font-serif text-3xl tracking-tight">Your coach, ready when you are.</h1>
      </div>
      <ChatView
        initialThreadId={threads[0]?.threadId ?? null}
        region={region}
        userEmail={user?.email ?? session.email}
      />
    </div>
  );
}
