"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/auth/form-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ACTIVITY_LEVELS, type ActivityLevelId } from "@/lib/onboarding/options";
import type { OnboardingState } from "@/lib/onboarding/state";
import { cn } from "@/lib/utils";

export function ProfileEditor({ initial }: { initial: OnboardingState }) {
  const [heightCm, setHeightCm] = useState<string>(
    initial.body?.heightCm?.toString() ?? "",
  );
  const [weightKg, setWeightKg] = useState<string>(
    initial.body?.weightKg?.toString() ?? "",
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevelId | "">(
    initial.body?.activityLevel ?? "",
  );
  const [hydrationTarget, setHydrationTarget] = useState<string>(
    initial.body?.hydrationTargetGlasses?.toString() ?? "8",
  );
  const [wakeTime, setWakeTime] = useState(initial.wakeTime ?? "07:00");
  const [sleepTime, setSleepTime] = useState(initial.sleepTime ?? "23:00");
  const [, startTransition] = useTransition();

  const save = (patch: Record<string, unknown>) => {
    startTransition(async () => {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) toast.error("Couldn't save.");
      else toast.success("Saved.");
    });
  };

  return (
    <div className="space-y-5">
      <Card className="border-border/60">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg">Body</CardTitle>
          <CardDescription>
            Helps the coach scale food portions and exercise volumes. All optional.
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
          <CardDescription>Prompts align to your day.</CardDescription>
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
    </div>
  );
}
