"use client";

import { useEffect, useRef, useState } from "react";

import { CrisisModal } from "@/components/auth/crisis-modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getCrisisResources, type CrisisResource } from "@/lib/ai/crisis";
import type { RegionId } from "@/lib/onboarding/options";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; content: string };

type Props = {
  initialThreadId: string | null;
  region: RegionId | null;
  userEmail: string;
};

const COACH_SEED = "plaintheory-coach";

export function ChatView({ initialThreadId, region, userEmail }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [rateLimited, setRateLimited] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resources: CrisisResource[] = getCrisisResources(region);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    setRateLimited(null);

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setDraft("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, threadId }),
      });
      const data = await res.json();
      if (data.kind === "crisis") {
        setCrisisOpen(true);
        setMessages((m) => m.slice(0, -1));
      } else if (data.kind === "rate-limited") {
        setRateLimited(data.limit);
        setMessages((m) => m.slice(0, -1));
      } else if (data.kind === "ok") {
        setThreadId(data.threadId);
        const assistant = data.messages[1];
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "assistant", content: assistant.content },
        ]);
      } else {
        setError(data.error ?? "Something went wrong.");
        setMessages((m) => m.slice(0, -1));
      }
    } catch {
      setError("Network error. Try again.");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Card className="border-border/60">
        <CardContent className="flex h-[60vh] flex-col gap-4 p-4">
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <p className="max-w-xs">
                  Ask anything about your day — meals, routine, focus, stress, sleep. Coaching, not
                  therapy.
                </p>
              </div>
            ) : (
              messages.map((m) => <Bubble key={m.id} msg={m} userEmail={userEmail} />)
            )}
          </div>
          {error ? (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          ) : null}
          {rateLimited !== null ? (
            <div className="rounded-lg bg-warning/15 px-3 py-2 text-xs text-warning">
              You&rsquo;ve hit today&rsquo;s free limit ({rateLimited} messages). It resets
              tomorrow.
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Ask anything…"
              rows={2}
              className="min-h-[54px] resize-none"
            />
            <Button onClick={send} loading={sending} size="lg">
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
      <CrisisModal open={crisisOpen} onOpenChange={setCrisisOpen} resources={resources} />
    </>
  );
}

function Bubble({ msg, userEmail }: { msg: Msg; userEmail: string }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar
        seed={isUser ? userEmail : COACH_SEED}
        size={28}
        className="size-7 shrink-0"
      />
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border/60 bg-card text-foreground",
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}
