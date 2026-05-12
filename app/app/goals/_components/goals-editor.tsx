"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  CONDITIONS,
  CONDITION_CLUSTERS,
  GOALS,
  type ConditionId,
  type GoalId,
} from "@/lib/onboarding/options";
import type { OnboardingState } from "@/lib/onboarding/state";
import { cn } from "@/lib/utils";

export function GoalsEditor({ initial }: { initial: OnboardingState }) {
  const [conditions, setConditions] = useState<ConditionId[]>(initial.conditions ?? []);
  const [goals, setGoals] = useState<GoalId[]>(initial.goals ?? []);
  const [dietaryNotes, setDietaryNotes] = useState(initial.medications ?? "");
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

  return (
    <div className="space-y-5">
      <Card className="border-border/60" id="goals">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Focus areas</CardTitle>
          <CardDescription>
            What you&rsquo;d like to grow in. Pick anything from these clusters.
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
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors",
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

      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Goals</CardTitle>
          <CardDescription>What good looks like for you.</CardDescription>
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
                    const next =
                      state === true
                        ? [...goals, g.id]
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
          <CardTitle className="text-lg">Dietary notes</CardTitle>
          <CardDescription>
            Allergies, foods you avoid, patterns. The coach never suggests anything you
            avoid.
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
