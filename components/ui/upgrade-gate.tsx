"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Button } from "./button";

type Props = {
  title: string;
  description?: string;
  /** Content to blur behind the gate. Purely decorative — screen-reader hidden. */
  preview?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function UpgradeGate({ title, description, preview, className, compact = false }: Props) {
  return (
    <div className={cn("relative isolate", className)}>
      {/* Blurred preview — gives users a sense of what's behind the gate */}
      {preview ? (
        <div
          className="pointer-events-none select-none overflow-hidden rounded-2xl opacity-30 blur-[3px]"
          aria-hidden
        >
          {preview}
        </div>
      ) : null}

      {/* Gate overlay */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 text-center",
          preview
            ? "absolute inset-0 rounded-2xl bg-background/70 backdrop-blur-[2px]"
            : "rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8",
        )}
      >
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
          <Lock className="size-4 text-primary" strokeWidth={2.5} />
        </div>
        <div className="space-y-1 px-2">
          <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>
            {title}
          </p>
          {description ? (
            <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm max-w-xs")}>
              {description}
            </p>
          ) : null}
        </div>
        <Link href="/pricing">
          <Button size={compact ? "sm" : "default"} className="gap-1.5">
            <Sparkles className="size-3.5" />
            Upgrade to Plus
          </Button>
        </Link>
      </div>
    </div>
  );
}
