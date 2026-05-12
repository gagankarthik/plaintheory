"use client";

import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Habit = {
  habitId: string;
  name: string;
  cue?: string;
  createdAt: string;
};

type Completion = {
  habitId: string;
  date: string;
};

const DAY_MS = 86_400_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function streakFor(completions: Completion[], habitId: string): number {
  const dates = new Set(completions.filter((c) => c.habitId === habitId).map((c) => c.date));
  let count = 0;
  for (let i = 0; i < 365; i++) {
    const iso = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
    if (dates.has(iso)) count++;
    else if (i > 0) break;
  }
  return count;
}

export function HabitsView({
  initialHabits,
  initialCompletions,
}: {
  initialHabits: Habit[];
  initialCompletions: Completion[];
}) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions);
  const [name, setName] = useState("");
  const [cue, setCue] = useState("");
  const [creating, setCreating] = useState(false);

  const doneToday = useMemo(
    () => new Set(completions.filter((c) => c.date === today()).map((c) => c.habitId)),
    [completions],
  );

  const addHabit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, cue: cue.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create habit");
      setHabits((h) => [...h, data.habit]);
      setName("");
      setCue("");
      toast.success("Habit added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create habit");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="border-border/60">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Add a habit
          </p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Walk after lunch"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addHabit();
              }
            }}
          />
          <Input
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            placeholder="When? (optional cue — 'after coffee', 'before bed')"
          />
          <Button onClick={addHabit} loading={creating} className="w-full sm:w-auto">
            <Plus className="size-4" /> Add habit
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-2.5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Your habits ({habits.length})
        </p>
        {habits.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/40">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No habits yet. The trick is one at a time — pick something small.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {habits.map((h) => (
              <HabitRow
                key={h.habitId}
                habit={h}
                doneToday={doneToday.has(h.habitId)}
                streak={streakFor(completions, h.habitId)}
                onComplete={() => {
                  setCompletions((c) => [
                    ...c,
                    {
                      habitId: h.habitId,
                      date: today(),
                    } as Completion,
                  ]);
                }}
                onArchive={() => {
                  setHabits((hs) => hs.filter((x) => x.habitId !== h.habitId));
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HabitRow({
  habit,
  doneToday,
  streak,
  onComplete,
  onArchive,
}: {
  habit: Habit;
  doneToday: boolean;
  streak: number;
  onComplete: () => void;
  onArchive: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [removing, setRemoving] = useState(false);

  const toggle = () => {
    if (doneToday) return;
    onComplete();
    startTransition(async () => {
      const res = await fetch(`/api/habits/${habit.habitId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today() }),
      });
      if (!res.ok) {
        toast.error("Couldn't save completion.");
      } else {
        const nextStreak = streak + 1;
        if (nextStreak === 7 || nextStreak === 30 || nextStreak === 100) {
          toast.success(`${nextStreak}-day streak!`, { icon: "🔥" });
        } else {
          toast.success("Habit done.", { icon: "✨" });
        }
      }
    });
  };

  const archive = async () => {
    if (!confirm(`Archive "${habit.name}"? Past completions stay logged.`)) return;
    setRemoving(true);
    const res = await fetch(`/api/habits/${habit.habitId}`, { method: "DELETE" });
    if (res.ok) {
      onArchive();
      toast.success("Archived.");
    } else {
      toast.error("Couldn't archive.");
      setRemoving(false);
    }
  };

  return (
    <Card
      className={cn(
        "border-border/60 transition-all",
        doneToday ? "bg-primary/5 border-primary/30" : "",
      )}
    >
      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
        <button
          type="button"
          onClick={toggle}
          disabled={pending || doneToday}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            doneToday
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-primary/60 active:scale-95",
          )}
          aria-label={doneToday ? "Completed today" : "Mark done"}
        >
          {doneToday ? <Check className="size-4" strokeWidth={3} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{habit.name}</p>
          {habit.cue ? (
            <p className="truncate text-xs text-muted-foreground">{habit.cue}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {streak > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-1 text-xs font-medium text-warning">
              <Flame className="size-3" /> {streak}
            </span>
          ) : null}
          <button
            type="button"
            onClick={archive}
            disabled={removing}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Archive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
