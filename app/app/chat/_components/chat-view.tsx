"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CrisisModal } from "@/components/auth/crisis-modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCrisisResources, type CrisisResource } from "@/lib/ai/crisis";
import type { RegionId } from "@/lib/onboarding/options";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; content: string };
type ChatMode = "coach" | "mood";

type Props = {
  initialThreadId: string | null;
  region: RegionId | null;
  userEmail: string;
  isPlus: boolean;
};

const COACH_SEED = "plaintheory-coach";

const MODES: {
  id: ChatMode;
  icon: string;
  label: string;
  description: string;
  placeholder: string;
  empty: string;
  quickStarts: string[];
}[] = [
  {
    id: "coach",
    icon: "🧭",
    label: "Coach",
    description: "Daily tasks, goals & routines",
    placeholder: "Ask about meals, routines, focus, sleep…",
    empty: "Ask anything about your day — meals, routine, focus, stress, sleep. Coaching, not therapy.",
    quickStarts: [
      "What should I eat for breakfast today?",
      "Help me build a morning routine",
      "How do I improve my sleep?",
      "I need help staying focused today",
    ],
  },
  {
    id: "mood",
    icon: "💙",
    label: "Mood",
    description: "Feelings, emotions & support",
    placeholder: "Share how you're feeling…",
    empty: "This is a safe space. Share how you're feeling — lonely, excited, stressed, happy, or anything in between.",
    quickStarts: [
      "I've been feeling lonely lately",
      "I'm really stressed and don't know why",
      "Something exciting just happened",
      "I'm feeling a bit down today",
    ],
  },
];

export function ChatView({ initialThreadId, region, userEmail, isPlus }: Props) {
  const [mode, setMode] = useState<ChatMode>("coach");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [rateLimited, setRateLimited] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resources: CrisisResource[] = getCrisisResources(region);

  const currentMode = MODES.find((m) => m.id === mode)!;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const switchMode = (next: ChatMode) => {
    if (next === mode) return;
    setMode(next);
    setMessages([]);
    setThreadId(null);
    setDraft("");
    setError(null);
    setRateLimited(null);
  };

  const send = async (overrideContent?: string) => {
    const content = (overrideContent ?? draft).trim();
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
        body: JSON.stringify({ content, threadId, mode }),
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
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04)]">
        <div className="flex h-[70vh] min-h-[500px]">
          {/* Mode sidebar — desktop */}
          <aside className="hidden w-52 shrink-0 flex-col border-r border-border/40 bg-muted/20 sm:flex">
            <div className="space-y-1 p-3">
              <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Mode
              </p>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMode(m.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                    mode === m.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50",
                  )}
                >
                  <span className="text-lg leading-none">{m.icon}</span>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium", mode === m.id ? "text-primary" : "text-foreground")}>
                      {m.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick starts */}
            <div className="mt-2 border-t border-border/40 p-3">
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Quick start
              </p>
              <div className="mt-1 space-y-0.5">
                {currentMode.quickStarts.map((qs) => (
                  <button
                    key={qs}
                    type="button"
                    onClick={() => void send(qs)}
                    disabled={sending}
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {qs}
                  </button>
                ))}
              </div>
            </div>

            {/* Upgrade banner — free users only */}
            {!isPlus ? (
              <div className="mt-auto border-t border-border/40 p-3">
                <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary shrink-0" />
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.15em]">
                      Plus
                    </p>
                  </div>
                  <p className="text-[11px] leading-snug text-foreground">
                    You&rsquo;re on the free plan — <span className="font-medium">5 messages / day</span>. Upgrade for unlimited coaching, all day.
                  </p>
                  <Link href="/pricing" className="block">
                    <Button size="sm" className="w-full gap-1.5 text-xs">
                      <Sparkles className="size-3" />
                      Upgrade to Plus
                    </Button>
                  </Link>
                </div>
              </div>
            ) : null}
          </aside>

          {/* Chat area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile mode tabs */}
            <div className="flex border-b border-border/40 sm:hidden">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMode(m.id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
                    mode === m.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="text-4xl">{currentMode.icon}</span>
                  <p className="mt-3 max-w-xs text-sm text-muted-foreground">{currentMode.empty}</p>
                  {/* Mobile quick starts */}
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:hidden">
                    {currentMode.quickStarts.slice(0, 2).map((qs) => (
                      <button
                        key={qs}
                        type="button"
                        onClick={() => void send(qs)}
                        className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        {qs}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => <Bubble key={m.id} msg={m} userEmail={userEmail} />)
              )}
            </div>

            {/* Status banners */}
            {error ? (
              <div className="mx-4 mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            ) : null}
            {rateLimited !== null ? (
              <div className="mx-4 mb-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">
                      Daily limit reached &mdash; {rateLimited} messages used
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Resets tomorrow. Upgrade to Plus for unlimited coaching.
                    </p>
                  </div>
                  <Link href="/pricing" className="shrink-0">
                    <Button size="sm" className="gap-1.5 text-xs w-full sm:w-auto">
                      <Sparkles className="size-3" />
                      Upgrade to Plus
                    </Button>
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Input */}
            <div className="flex items-end gap-2 border-t border-border/40 p-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={currentMode.placeholder}
                rows={2}
                className="min-h-[54px] resize-none"
              />
              <Button onClick={() => void send()} loading={sending} size="lg">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CrisisModal open={crisisOpen} onOpenChange={setCrisisOpen} resources={resources} />
    </>
  );
}

function Bubble({ msg, userEmail }: { msg: Msg; userEmail: string }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex items-end gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar seed={isUser ? userEmail : COACH_SEED} size={28} className="size-7 shrink-0" />
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
