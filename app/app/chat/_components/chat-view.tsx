"use client";

import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CrisisModal } from "@/components/auth/crisis-modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Textarea } from "@/components/ui/textarea";
import { getCrisisResources, type CrisisResource } from "@/lib/ai/crisis";
import type { RegionId } from "@/lib/onboarding/options";
import { cn } from "@/lib/utils";

type MsgStatus = "ok" | "failed" | "crisis";
type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: MsgStatus;
};
type ChatMode = "coach" | "mood";

type Usage = { used: number; limit: number };

type Props = {
  initialThreadId: string | null;
  region: RegionId | null;
  userEmail: string;
  isPlus: boolean;
  initialUsage: Usage | null;
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

export function ChatView({
  initialThreadId,
  region,
  userEmail,
  isPlus,
  initialUsage,
}: Props) {
  const [mode, setMode] = useState<ChatMode>("coach");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(initialUsage);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resources: CrisisResource[] = getCrisisResources(region);

  const currentMode = MODES.find((m) => m.id === mode)!;
  const atLimit = usage !== null && usage.used >= usage.limit;
  const remaining = usage ? Math.max(0, usage.limit - usage.used) : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const switchMode = (next: ChatMode) => {
    if (next === mode) return;
    setMode(next);
    setMessages([]);
    setThreadId(null);
    setDraft("");
  };

  const markLastUserAs = (status: MsgStatus) => {
    setMessages((m) => {
      const next = [...m];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i]!.role === "user") {
          next[i] = { ...next[i]!, status };
          break;
        }
      }
      return next;
    });
  };

  const send = async (overrideContent?: string, retryId?: string) => {
    const content = (overrideContent ?? draft).trim();
    if (!content || sending) return;
    if (atLimit) return; // input is already disabled at the limit
    setSending(true);

    // Insert (or re-mark) the user message
    let userMsgId = retryId;
    if (retryId) {
      setMessages((m) => m.map((x) => (x.id === retryId ? { ...x, status: undefined } : x)));
    } else {
      userMsgId = crypto.randomUUID();
      const userMsg: Msg = { id: userMsgId, role: "user", content };
      setMessages((m) => [...m, userMsg]);
      setDraft("");
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, threadId, mode }),
      });
      const data = await res.json();
      if (data.kind === "crisis") {
        setCrisisOpen(true);
        markLastUserAs("crisis");
        // Soft in-chat acknowledgement so the thread doesn't feel abandoned
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "I hear you. What you said is bigger than what I'm here for — please reach a person who can actually be with you on it. The numbers and links should be right next to this.",
          },
        ]);
      } else if (data.kind === "rate-limited") {
        markLastUserAs("failed");
        setUsage((u) => (u ? { ...u, used: data.limit ?? u.limit } : u));
      } else if (data.kind === "ok") {
        setThreadId(data.threadId);
        const assistant = data.messages[1];
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "assistant", content: assistant.content },
        ]);
        setUsage((u) => (u ? { ...u, used: u.used + 1 } : u));
      } else {
        markLastUserAs("failed");
      }
    } catch {
      markLastUserAs("failed");
    } finally {
      setSending(false);
    }
  };

  const retry = (msg: Msg) => {
    if (atLimit) return;
    void send(msg.content, msg.id);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04)]">
        <div className="flex h-[calc(100dvh-200px)] min-h-[420px] sm:h-[70vh] sm:min-h-[500px]">
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

            {/* Usage + upgrade — free users only */}
            {!isPlus && usage ? (
              <div className="mt-auto border-t border-border/40 p-3">
                <div className="space-y-2.5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
                      <Sparkles className="-mt-px mr-1 inline size-3" />
                      Plus
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-medium tabular-nums",
                        atLimit ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {usage.used} / {usage.limit} today
                    </p>
                  </div>
                  {/* Mini usage bar */}
                  <div className="h-1 overflow-hidden rounded-full bg-border/60">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        atLimit ? "bg-destructive" : "bg-primary",
                      )}
                      style={{
                        width: `${Math.min(100, Math.round((usage.used / usage.limit) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] leading-snug text-foreground">
                    {atLimit
                      ? "You've used today's free messages. Resets tomorrow."
                      : remaining === 1
                        ? "Last message for today on free."
                        : "Free includes 5 messages a day. Plus is unlimited."}
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
                messages.map((m) => (
                  <Bubble
                    key={m.id}
                    msg={m}
                    userEmail={userEmail}
                    onRetry={
                      m.status === "failed" && !atLimit ? () => retry(m) : undefined
                    }
                  />
                ))
              )}
              {sending ? (
                <div className="flex items-end gap-2 pl-1">
                  <Avatar seed={COACH_SEED} size={28} className="size-7 shrink-0" />
                  <div className="rounded-2xl rounded-bl-sm bg-muted/60 px-3.5 py-2.5">
                    <MultiStepLoader
                      steps={
                        mode === "mood"
                          ? ["Listening…", "Sitting with that…", "Finding the right words…"]
                          : [
                              "Reading what you said…",
                              "Pulling in your recent context…",
                              "Thinking it through…",
                              "Writing a reply…",
                            ]
                      }
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Status banners */}
            {atLimit ? (
              <div className="mx-3 mb-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 sm:mx-4 sm:px-4 sm:py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">
                      Daily limit reached &mdash; {usage?.limit} messages today
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Resets at midnight your time. Plus is unlimited.
                    </p>
                  </div>
                  <Link href="/pricing" className="shrink-0">
                    <Button size="sm" className="w-full gap-1.5 text-xs sm:w-auto">
                      <Sparkles className="size-3" />
                      Upgrade to Plus
                    </Button>
                  </Link>
                </div>
              </div>
            ) : !isPlus && remaining !== null && remaining <= 2 ? (
              <div className="mx-3 mb-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[11px] text-warning sm:mx-4">
                {remaining === 0
                  ? "No messages left today."
                  : `${remaining} ${remaining === 1 ? "message" : "messages"} left today on free.`}
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
                placeholder={
                  atLimit
                    ? "Daily limit reached — resets tomorrow."
                    : currentMode.placeholder
                }
                rows={2}
                disabled={atLimit}
                className="min-h-[54px] resize-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Button
                onClick={() => void send()}
                loading={sending}
                disabled={atLimit || !draft.trim()}
                size="lg"
              >
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

function Bubble({
  msg,
  userEmail,
  onRetry,
}: {
  msg: Msg;
  userEmail: string;
  onRetry?: () => void;
}) {
  const isUser = msg.role === "user";
  const failed = msg.status === "failed";
  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <div className={cn("flex items-end gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
        <Avatar seed={isUser ? userEmail : COACH_SEED} size={28} className="size-7 shrink-0" />
        <div
          className={cn(
            "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%]",
            isUser
              ? failed
                ? "bg-destructive/10 text-foreground ring-1 ring-destructive/40"
                : "bg-primary text-primary-foreground"
              : "border border-border/60 bg-card text-foreground",
          )}
        >
          {msg.content}
        </div>
      </div>
      {failed ? (
        <div className="flex items-center gap-2 pr-9 text-[11px] text-destructive">
          <AlertCircle className="size-3" />
          <span>Didn&rsquo;t send.</span>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 font-medium text-destructive underline-offset-2 hover:underline"
            >
              <RefreshCw className="size-3" />
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
