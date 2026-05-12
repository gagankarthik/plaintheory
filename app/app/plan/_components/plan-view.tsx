"use client";

import { Check, PartyPopper, Plus, Sparkles, Trash2, Trophy, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DailyPlan, FocusAction } from "@/lib/db/plans";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<FocusAction["category"], string> = {
  food: "Food",
  movement: "Movement",
  hydration: "Hydration",
  medication: "Care",
  stress: "Stress",
  sleep: "Sleep",
};

const CATEGORY_EMOJI: Record<FocusAction["category"], string> = {
  food: "🥗",
  movement: "🏃",
  hydration: "💧",
  medication: "🌿",
  stress: "🧘",
  sleep: "🌙",
};

const COMPLETION_TOASTS = [
  "Nice. One down.",
  "That's two. Steady.",
  "Three in. Pattern is real.",
  "Four through. You're flying.",
  "Five. A full day.",
];

export function PlanView({ plan }: { plan: DailyPlan }) {
  const [actions, setActions] = useState<FocusAction[]>(plan.focusActions);
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(plan.completedActionIds ?? []),
  );
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<FocusAction["category"]>("movement");
  const [creating, setCreating] = useState(false);

  const total = actions.length;
  const doneCount = completed.size;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const allDone = doneCount === total && total > 0;
  const halfwayJustHit = doneCount === Math.ceil(total / 2) && total > 1;

  const submitNew = async () => {
    const text = newText.trim();
    if (!text) return;
    setCreating(true);
    try {
      const res = await fetch("/api/plan/today/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, category: newCategory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't add");
      setActions((a) => [...a, data.action]);
      setNewText("");
      setAdding(false);
      toast.success("Task added.", { icon: "✨" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header — task summary */}
      <Card className="border-border/60">
        <CardContent className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {new Date(plan.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">
                Today&rsquo;s tasks
              </h1>
            </div>
            <Badge variant={allDone ? "success" : "primary"} className="shrink-0">
              {doneCount} done · {total - doneCount} to go
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {plan.morningBriefing}
          </p>
          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  allDone ? "bg-success" : "bg-primary",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{pct}% complete</span>
              {doneCount > 0 && !allDone ? (
                <span className="flex items-center gap-1 text-primary">
                  <Sparkles className="size-3" />
                  Keep going.
                </span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All-done celebration */}
      {allDone ? (
        <Card className="border-success/40 bg-gradient-to-br from-success/10 via-success/5 to-transparent">
          <CardContent className="flex items-center gap-4 px-5 py-5 sm:px-6 sm:py-6">
            <div className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success">
              <Trophy className="size-7" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
                Full day. All {total} done.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                These small things compound. See you tomorrow morning.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Halfway nudge */}
      {halfwayJustHit && !allDone ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 px-5 py-4">
            <PartyPopper className="size-5 text-primary" />
            <p className="text-sm font-medium text-foreground">
              Halfway there. One more push.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Tasks */}
      <section className="space-y-2.5">
        <div className="flex items-baseline justify-between px-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tasks</p>
          <p className="text-xs text-muted-foreground">Tap to check off</p>
        </div>
        <div className="space-y-2">
          {actions.map((action, idx) => (
            <TaskRow
              key={action.id}
              index={idx + 1}
              action={action}
              done={completed.has(action.id)}
              custom={action.id.startsWith("custom-")}
              onToggle={(next) => {
                setCompleted((prev) => {
                  const updated = new Set(prev);
                  const wasComplete = prev.size === total;
                  if (next) {
                    updated.add(action.id);
                    if (!wasComplete) {
                      if (updated.size === total) {
                        toast.success("Full day. All actions done.", { icon: "🏆" });
                      } else {
                        toast.success(
                          COMPLETION_TOASTS[updated.size - 1] ?? "Done.",
                          { icon: "✨" },
                        );
                      }
                    }
                  } else {
                    updated.delete(action.id);
                  }
                  return updated;
                });
              }}
              onDelete={async () => {
                if (!action.id.startsWith("custom-")) return;
                const prev = actions;
                setActions((a) => a.filter((x) => x.id !== action.id));
                setCompleted((c) => {
                  const u = new Set(c);
                  u.delete(action.id);
                  return u;
                });
                const res = await fetch(
                  `/api/plan/today/custom?id=${encodeURIComponent(action.id)}`,
                  { method: "DELETE" },
                );
                if (!res.ok) {
                  toast.error("Couldn't remove.");
                  setActions(prev);
                }
              }}
            />
          ))}
        </div>

        {/* Add custom task */}
        {adding ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="space-y-2.5 p-3 sm:p-4">
              <Input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="e.g. Send the thing I've been avoiding"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submitNew();
                  } else if (e.key === "Escape") {
                    setAdding(false);
                    setNewText("");
                  }
                }}
              />
              <div className="flex flex-wrap gap-1.5">
                {(
                  ["movement", "food", "stress", "sleep", "hydration", "medication"] as const
                ).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCategory(c)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      newCategory === c
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-accent/40",
                    )}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={submitNew} loading={creating} size="sm" className="flex-1">
                  Add task
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAdding(false);
                    setNewText("");
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-card/40 px-4 py-3 text-sm font-medium text-muted-foreground transition-all",
              "hover:border-primary/40 hover:bg-card hover:text-foreground",
            )}
          >
            <Plus className="size-4" /> Add your own task
          </button>
        )}
      </section>

      {/* Notice card */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="space-y-1.5 px-5 py-5 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-warning">Notice today</p>
          <p className="text-sm leading-relaxed text-foreground">{plan.watchFor}</p>
        </CardContent>
      </Card>

      {/* Reflection */}
      <Card className="border-border/60">
        <CardContent className="space-y-3 px-5 py-5 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Evening reflection
          </p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-foreground">
            {plan.reflectionPrompts.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <p className="pt-1 text-center text-xs text-muted-foreground">
        General coaching, not therapy or medical advice.
      </p>
    </div>
  );
}

function TaskRow({
  index,
  action,
  done,
  custom,
  onToggle,
  onDelete,
}: {
  index: number;
  action: FocusAction;
  done: boolean;
  custom: boolean;
  onToggle: (done: boolean) => void;
  onDelete: () => void | Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    const next = !done;
    onToggle(next);
    startTransition(async () => {
      const res = await fetch("/api/plan/today/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: action.id, done: next }),
      });
      if (!res.ok) {
        toast.error("Couldn't save. Try again.");
        onToggle(!next);
      }
    });
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border bg-card transition-all duration-200 sm:gap-4",
        done ? "border-primary/30 bg-primary/5" : "border-border/60",
        "hover:border-primary/40",
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="flex flex-1 items-start gap-3 px-4 py-4 text-left active:scale-[0.998] sm:gap-4 sm:px-5"
      >
        <span
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
            done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card group-hover:border-primary/60",
          )}
        >
          {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : null}
        </span>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl border text-xs font-medium transition-colors sm:size-10",
            done
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border/60 bg-card/60 text-muted-foreground",
          )}
          aria-hidden
        >
          <span className="text-base sm:text-lg">{CATEGORY_EMOJI[action.category]}</span>
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.15em]",
                done ? "text-primary/70" : "text-muted-foreground",
              )}
            >
              Task {index} · {CATEGORY_LABELS[action.category]}
            </span>
            {custom ? (
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-primary">
                · Yours
              </span>
            ) : null}
          </div>
          <p
            className={cn(
              "text-sm leading-relaxed sm:text-base",
              done ? "text-muted-foreground line-through decoration-1" : "text-foreground",
            )}
          >
            {action.text}
          </p>
        </div>
      </button>
      {custom ? (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label="Remove custom task"
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
