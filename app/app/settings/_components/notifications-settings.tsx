"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import type { OnboardingState } from "@/lib/onboarding/state";

const ITEMS: Array<{
  name: keyof NonNullable<OnboardingState["notifications"]>;
  label: string;
  description: string;
}> = [
  {
    name: "dailyPlan",
    label: "Morning plan",
    description: "Three focus actions for the day, sent at your wake time.",
  },
  {
    name: "eveningReflection",
    label: "Evening reflection",
    description: "A short three-question check-in at bedtime.",
  },
  {
    name: "weeklyInsights",
    label: "Weekly insights",
    description: "Sunday recap of patterns we noticed across the week.",
  },
];

export function NotificationsSettings({
  initial,
}: {
  initial: OnboardingState["notifications"];
}) {
  const [prefs, setPrefs] = useState({
    dailyPlan: initial?.dailyPlan ?? true,
    eveningReflection: initial?.eveningReflection ?? false,
    weeklyInsights: initial?.weeklyInsights ?? true,
  });
  const [, startTransition] = useTransition();

  const toggle = (name: keyof typeof prefs) => {
    const next = { ...prefs, [name]: !prefs[name] };
    setPrefs(next);
    startTransition(async () => {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: next }),
      });
      if (!res.ok) {
        setPrefs(prefs);
        toast.error("Couldn't save.");
      }
    });
  };

  return (
    <div className="space-y-2.5">
      {ITEMS.map((item) => (
        <label
          key={item.name}
          htmlFor={`notif-${item.name}`}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
        >
          <Checkbox
            id={`notif-${item.name}`}
            checked={prefs[item.name]}
            onCheckedChange={() => toggle(item.name)}
            className="mt-0.5"
          />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
