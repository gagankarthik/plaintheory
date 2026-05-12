"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REGIONS, type RegionId } from "@/lib/onboarding/options";
import type { OnboardingState } from "@/lib/onboarding/state";
import { cn } from "@/lib/utils";

type Props = {
  email: string;
  memberSince: string;
  plan: string;
  onboarding: OnboardingState;
};

export function AccountSettings({ email, memberSince, plan, onboarding }: Props) {
  const [region, setRegion] = useState<RegionId | "">(onboarding.region ?? "");
  const [birthYear, setBirthYear] = useState(onboarding.birthYear?.toString() ?? "");
  const [pending, startTransition] = useTransition();

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

  const saveRegion = (val: RegionId) => {
    setRegion(val);
    save({ region: val });
  };

  const saveBirthYear = () => {
    const y = Number(birthYear);
    const currentYear = new Date().getFullYear();
    if (!y || y < 1900 || y > currentYear - 18) {
      toast.error("Enter a valid birth year (18+ only).");
      return;
    }
    save({ birthYear: y });
  };

  return (
    <div className="space-y-4">
      {/* Read-only fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email">
          <p className="truncate font-medium text-foreground">{email}</p>
          <p className="text-xs text-muted-foreground">Cannot be changed here</p>
        </Field>
        <Field label="Member since">
          <p className="font-medium text-foreground">{memberSince}</p>
        </Field>
        <Field label="Plan">
          <p className="font-medium text-foreground">{plan}</p>
        </Field>
      </div>

      {/* Editable: Region */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Region
        </label>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => saveRegion(r.value)}
              disabled={pending}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                region === r.value
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "border-border/60 text-foreground hover:bg-accent/40",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        {!region && (
          <p className="text-xs text-muted-foreground">Select your region for local crisis resources.</p>
        )}
      </div>

      {/* Editable: Birth year */}
      <div className="space-y-1.5">
        <label htmlFor="birthYear" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Birth year
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="birthYear"
            type="number"
            inputMode="numeric"
            min={1900}
            max={new Date().getFullYear() - 18}
            placeholder="e.g. 1990"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="max-w-[140px]"
          />
          <Button
            variant="outline"
            size="sm"
            loading={pending}
            onClick={saveBirthYear}
            disabled={!birthYear}
          >
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">PlainTheory is 18+ only.</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
