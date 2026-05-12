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
        <label htmlFor="region" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Region
        </label>
        <select
          id="region"
          value={region}
          disabled={pending}
          onChange={(e) => saveRegion(e.target.value as RegionId)}
          className={cn(
            "h-10 w-full max-w-xs rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "appearance-none",
            !region && "text-muted-foreground",
          )}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
        >
          <option value="" disabled>Select your region…</option>
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Used for local crisis resources if ever needed.</p>
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
