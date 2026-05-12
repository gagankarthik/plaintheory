"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_LEVELS,
  ALLERGENS,
  CONDITIONS,
  CONDITION_CLUSTERS,
  DIETARY_PATTERNS,
  GOALS,
  type ActivityLevelId,
  type AllergenId,
  type ConditionId,
  type DietaryPatternId,
  type GoalId,
} from "@/lib/onboarding/options";
import type { OnboardingState } from "@/lib/onboarding/state";
import { cn } from "@/lib/utils";

export function GoalsEditor({ initial }: { initial: OnboardingState }) {
  const [conditions, setConditions] = useState<ConditionId[]>(initial.conditions ?? []);
  const [goals, setGoals] = useState<GoalId[]>(initial.goals ?? []);
  const [dietaryNotes, setDietaryNotes] = useState(initial.medications ?? "");
  const [dietaryPatterns, setDietaryPatterns] = useState<DietaryPatternId[]>(
    initial.dietaryPatterns ?? [],
  );
  const [allergens, setAllergens] = useState<AllergenId[]>(initial.allergens ?? []);
  const [wakeTime, setWakeTime] = useState(initial.wakeTime ?? "07:00");
  const [sleepTime, setSleepTime] = useState(initial.sleepTime ?? "23:00");
  const [heightCm, setHeightCm] = useState(initial.body?.heightCm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initial.body?.weightKg?.toString() ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevelId | "">(
    initial.body?.activityLevel ?? "",
  );
  const [hydrationTarget, setHydrationTarget] = useState(
    initial.body?.hydrationTargetGlasses?.toString() ?? "8",
  );
  const [pending, startTransition] = useTransition();

  const save = (patch: Record<string, unknown>) => {
    startTransition(async () => {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) toast.error("Couldn't save changes.");
      else toast.success("Saved.");
    });
  };

  const saveRoutine = () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(wakeTime) || !timeRegex.test(sleepTime)) {
      toast.error("Enter valid times in HH:MM format.");
      return;
    }
    save({ wakeTime, sleepTime });
  };

  const saveBody = () => {
    const body: Record<string, unknown> = {};
    const h = Number(heightCm);
    const w = Number(weightKg);
    const hyd = Number(hydrationTarget);
    if (heightCm && h >= 80 && h <= 260) body.heightCm = h;
    if (weightKg && w >= 20 && w <= 300) body.weightKg = w;
    if (activityLevel) body.activityLevel = activityLevel;
    if (hydrationTarget && hyd >= 1 && hyd <= 20) body.hydrationTargetGlasses = hyd;
    save({ body: Object.keys(body).length ? body : {} });
  };

  const clearBody = () => {
    setHeightCm("");
    setWeightKg("");
    setActivityLevel("");
    setHydrationTarget("8");
    save({ body: {} });
  };

  return (
    <div className="space-y-5">
      {/* Focus areas */}
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Focus areas</CardTitle>
          <CardDescription>
            What you&rsquo;d like to grow in. Your daily plan adapts to these immediately.
          </CardDescription>
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
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        checked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/60 hover:bg-accent/40",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(state) => {
                          const next =
                            state === true
                              ? [...conditions, c.id]
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

      {/* Goals */}
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Goals</CardTitle>
          <CardDescription>What good looks like for you. Pick as many as apply.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-1.5 px-6 pb-6 sm:grid-cols-2">
          {GOALS.map((g) => {
            const checked = goals.includes(g.id);
            return (
              <label
                key={g.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                  checked
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 hover:bg-accent/40",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(state) => {
                    const next =
                      state === true ? [...goals, g.id] : goals.filter((id) => id !== g.id);
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

      {/* Daily routine */}
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Daily rhythm</CardTitle>
          <CardDescription>
            Your usual wake and sleep times. The coach aligns suggestions to your schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="wakeTime" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Wake time
              </label>
              <Input
                id="wakeTime"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="sleepTime" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Sleep time
              </label>
              <Input
                id="sleepTime"
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" size="sm" loading={pending} onClick={saveRoutine}>
            Save times
          </Button>
        </CardContent>
      </Card>

      {/* Dietary notes */}
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Dietary notes</CardTitle>
          <CardDescription>
            Allergies, foods you avoid, or patterns you follow. The coach never suggests anything
            you&rsquo;ve flagged here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-6">
          <Textarea
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            placeholder="e.g. dairy-free, allergic to peanuts, prefer fish over red meat"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={pending}
              onClick={() => save({ medications: dietaryNotes })}
            >
              Save notes
            </Button>
            {dietaryNotes ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => {
                  setDietaryNotes("");
                  save({ medications: "" });
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Dietary patterns */}
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Dietary patterns</CardTitle>
          <CardDescription>
            How you generally eat. The coach avoids suggesting anything outside your pattern.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-1.5 px-6 pb-6 sm:grid-cols-3">
          {DIETARY_PATTERNS.map((d) => {
            const checked = dietaryPatterns.includes(d.id);
            return (
              <label
                key={d.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                  checked
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 hover:bg-accent/40",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(state) => {
                    const next =
                      state === true
                        ? [...dietaryPatterns, d.id]
                        : dietaryPatterns.filter((id) => id !== d.id);
                    setDietaryPatterns(next);
                    save({ dietaryPatterns: next });
                  }}
                />
                <span>{d.label}</span>
              </label>
            );
          })}
        </CardContent>
      </Card>

      {/* Allergens */}
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Allergens to avoid</CardTitle>
          <CardDescription>
            Things to keep out of meal and recipe suggestions entirely.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-1.5 px-6 pb-6 sm:grid-cols-3">
          {ALLERGENS.map((a) => {
            const checked = allergens.includes(a.id);
            return (
              <label
                key={a.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                  checked
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border/60 hover:bg-accent/40",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(state) => {
                    const next =
                      state === true
                        ? [...allergens, a.id]
                        : allergens.filter((id) => id !== a.id);
                    setAllergens(next);
                    save({ allergens: next });
                  }}
                />
                <span>{a.label}</span>
              </label>
            );
          })}
        </CardContent>
      </Card>

      {/* Body & activity */}
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Body & activity</CardTitle>
          <CardDescription>
            Optional. Helps scale portions, exercise volume, and hydration targets. Never used
            for medical assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="heightCm" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Height (cm)
              </label>
              <Input
                id="heightCm"
                type="number"
                inputMode="numeric"
                min={80}
                max={260}
                placeholder="e.g. 170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="weightKg" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Weight (kg)
              </label>
              <Input
                id="weightKg"
                type="number"
                inputMode="numeric"
                min={20}
                max={300}
                placeholder="e.g. 70"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="hydration" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Water target (glasses/day)
              </label>
              <Input
                id="hydration"
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                placeholder="8"
                value={hydrationTarget}
                onChange={(e) => setHydrationTarget(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Activity level
            </p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {ACTIVITY_LEVELS.map((a) => {
                const active = activityLevel === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActivityLevel(active ? "" : a.id)}
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
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" loading={pending} onClick={saveBody}>
              Save body info
            </Button>
            {(heightCm || weightKg || activityLevel) ? (
              <Button variant="ghost" size="sm" disabled={pending} onClick={clearBody}>
                Clear all
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
