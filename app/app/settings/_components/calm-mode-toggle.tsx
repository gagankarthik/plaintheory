"use client";

import { Leaf, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  initialEnabled: boolean;
  isPlus: boolean;
};

export function CalmModeToggle({ initialEnabled, isPlus }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    if (!isPlus) return;
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const res = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calmMode: next }),
      });
      if (!res.ok) {
        toast.error("Couldn't save. Try again.");
        setEnabled(!next);
        return;
      }
      toast.success(next ? "Calm Mode on. No more streak nudges." : "Calm Mode off.");
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
            <Leaf className="size-4" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium text-foreground">Calm Mode</p>
            <p className="text-sm text-muted-foreground">
              Hide streaks, badges, and celebratory nudges. The plan stays, the nags go.
            </p>
          </div>
        </div>
        {isPlus ? (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={toggle}
            disabled={pending}
            className={cn(
              "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors",
              enabled ? "bg-success" : "bg-border",
              pending && "opacity-60",
            )}
          >
            <span
              className={cn(
                "inline-block size-5 transform rounded-full bg-background shadow-sm transition-transform",
                enabled ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary">
            <Lock className="size-3" /> Plus
          </span>
        )}
      </div>

      {!isPlus ? (
        <Link href="/pricing">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Sparkles className="size-3.5" />
            Unlock with Plus
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
