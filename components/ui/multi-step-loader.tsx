"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type MultiStepLoaderProps = {
  steps: string[];
  /** Milliseconds between each step. Default 1400. */
  intervalMs?: number;
  /** Hold on the last step instead of looping. Default true. */
  holdLast?: boolean;
  className?: string;
};

/**
 * Sequenced status messages for long-running operations (chat reply, plan
 * generation). Cycles through the provided steps so the user knows the system
 * is doing work, not stuck.
 */
export function MultiStepLoader({
  steps,
  intervalMs = 1400,
  holdLast = true,
  className,
}: MultiStepLoaderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (steps.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => {
        if (holdLast && i >= steps.length - 1) return i;
        return (i + 1) % steps.length;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [steps, intervalMs, holdLast]);

  const current = steps[index] ?? "";

  return (
    <div className={cn("flex items-center gap-2.5 text-sm text-muted-foreground", className)}>
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      <span key={current} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
        {current}
      </span>
    </div>
  );
}
