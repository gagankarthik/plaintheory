"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_LEVELS,
  CONDITIONS,
  CONDITION_CLUSTERS,
  GOALS,
  type ActivityLevelId,
  type ConditionId,
  type GoalId,
} from "@/lib/onboarding/options";
import type { OnboardingState } from "@/lib/onboarding/state";
import { cn } from "@/lib/utils";

type Props = { initial: OnboardingState };

export function EditProfile({ initial }: Props) {
  const [conditions, setConditions] = useState<ConditionId[]>(initial.conditions ?? []);
  const [goals, setGoals] = useState<GoalId[]>(initial.goals ?? []);
  const [wakeTime, setWakeTime] = useState(initial.wakeTime ?? "07:00");
  const [sleepTime, setSleepTime] = useState(initial.sleepTime ?? "23:00");
  const [dietaryNotes, setDietaryNotes] = useState(initial.medications ?? "");
  const [heightCm, setHeightCm] = useState<string>(initial.body?.heightCm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState<string>(initial.body?.weightKg?.toString() ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevelId | "">(
    initial.body?.activityLevel ?? "",
  );
  const [hydrationTarget, setHydrationTarget] = useState<string>(
    initial.body?.hydrationTargetGlasses?.toString() ?? "8",
  );

  const [pending, startTransition] = useTransition();

  const toggleId = <T extends string>(set: T[], id: T): T[] =>
    set.includes(id) ? set.filter((x) => x !== id) : [...set, id];

  const save = (patch: Record<string, unknown>) => {
    startTransition(async () => {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        toast.error("Couldn't save changes.");
        return;
      }
      toast.success("Saved.");
    });
  };

  return (
    <div className="space-y-5">
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Focus areas</CardTitle>
          <CardDescription>Update what you&rsquo;re working on. Coaching adapts immediately.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          {CONDITION_CLUSTERS.map((cluster) => (
            <div key={cluster.id} className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {cluster.label}
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {CONDITIONS.filter((c) => c.cluster === cluster.id).map((c) => {
                  const checked = conditions.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors",
                        checked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/60 hover:bg-accent/40",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(state) => {
                          const next = state === true
                            ? toggleId(conditions, c.id)
                            : conditions.filter((id) => id !== c.id);
                          setConditions(next);
                          save({ conditions: next });
                        }}
                      />
                      <span>{c.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Goals</CardTitle>
          <CardDescription>Change goals anytime — the AI follows.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-1.5 px-6 pb-6 sm:grid-cols-2">
          {GOALS.map((g) => {
            const checked = goals.includes(g.id);
            return (
              <label
                key={g.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors",
                  checked
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 hover:bg-accent/40",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(state) => {
                    const next = state === true
                      ? toggleId(goals, g.id)
                      : goals.filter((id) => id !== g.id);
                    setGoals(next);
                    save({ goals: next });
                  }}
                />
                <span>{g.label}</span>
              </label>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Your body</CardTitle>
          <CardDescription>
            Helps the coach scale portions, exercise volumes, and hydration. All optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Height (cm)" htmlFor="height">
              <Input
                id="height"
                type="number"
                inputMode="numeric"
                min={80}
                max={260}
                placeholder="170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                onBlur={() => {
                  const n = Number(heightCm);
                  if (n) save({ body: { heightCm: n } });
                }}
              />
            </FormField>
            <FormField label="Weight (kg)" htmlFor="weight">
              <Input
                id="weight"
                type="number"
                inputMode="numeric"
                min={20}
                max={300}
                placeholder="70"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                onBlur={() => {
                  const n = Number(weightKg);
                  if (n) save({ body: { weightKg: n } });
                }}
              />
            </FormField>
          </div>
          <FormField label="Activity level" htmlFor="activity">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {ACTIVITY_LEVELS.map((a) => {
                const active = activityLevel === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setActivityLevel(a.id);
                      save({ body: { activityLevel: a.id } });
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/60 hover:bg-accent/40",
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </button>
                );
              })}
            </div>
          </FormField>
          <FormField label="Hydration target (glasses/day)" htmlFor="hydration">
            <Input
              id="hydration"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              placeholder="8"
              value={hydrationTarget}
              onChange={(e) => setHydrationTarget(e.target.value)}
              onBlur={() => {
                const n = Number(hydrationTarget);
                if (n) save({ body: { hydrationTargetGlasses: n } });
              }}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Daily rhythm</CardTitle>
          <CardDescription>The coach aligns prompts to your day.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
          <FormField label="Wake" htmlFor="wake">
            <Input
              id="wake"
              type="time"
              value={wakeTime}
              onChange={(e) => {
                setWakeTime(e.target.value);
                save({ wakeTime: e.target.value });
              }}
            />
          </FormField>
          <FormField label="Sleep" htmlFor="sleep">
            <Input
              id="sleep"
              type="time"
              value={sleepTime}
              onChange={(e) => {
                setSleepTime(e.target.value);
                save({ sleepTime: e.target.value });
              }}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Dietary notes</CardTitle>
          <CardDescription>
            Allergies, foods you avoid, patterns (vegan, gluten-free). The coach never suggests
            anything you avoid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-6">
          <Textarea
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            placeholder="e.g. dairy-free, allergic to peanuts, prefer fish over red meat"
            rows={3}
          />
          <Button
            variant="outline"
            size="sm"
            loading={pending}
            onClick={() => save({ medications: dietaryNotes })}
          >
            Save notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
