"use client";

import { Droplet, Minus, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const localDate = () => new Intl.DateTimeFormat("en-CA").format(new Date());

type Props = {
  initialGlasses: number;
  target: number;
  className?: string;
};

/**
 * Vertical, square-ish water tile for the home widget grid.
 * Shares the same API as the WaterBottle component but lays out compactly.
 */
export function WaterWidget({ initialGlasses, target, className }: Props) {
  const [glasses, setGlasses] = useState(initialGlasses);
  const [pending, startTransition] = useTransition();
  const [splash, setSplash] = useState<"up" | "down" | null>(null);
  const safeTarget = Math.max(1, target);
  const pct = Math.min(100, Math.round((glasses / safeTarget) * 100));

  useEffect(() => {
    const today = localDate();
    const tz = new Date().getTimezoneOffset();
    fetch(`/api/water?date=${today}&tz=${tz}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { count: number }) => {
        if (typeof data.count === "number") setGlasses(data.count);
      })
      .catch(() => { /* keep initial */ });
  }, []);

  const triggerSplash = (dir: "up" | "down") => {
    setSplash(dir);
    setTimeout(() => setSplash(null), 500);
  };

  const addGlass = () => {
    const today = localDate();
    const next = glasses + 1;
    setGlasses(next);
    triggerSplash("up");
    startTransition(async () => {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "water", severity: 1, localDate: today }),
      });
      if (!res.ok) {
        toast.error("Couldn't save. Try again.");
        setGlasses((g) => g - 1);
        return;
      }
      if (next === safeTarget) {
        toast.success("Hydrated. Nice work today.", { icon: "💧" });
      }
    });
  };

  const removeGlass = () => {
    if (glasses <= 0) return;
    const today = localDate();
    const tz = new Date().getTimezoneOffset();
    setGlasses((g) => Math.max(0, g - 1));
    triggerSplash("down");
    startTransition(async () => {
      const res = await fetch(`/api/water?date=${today}&tz=${tz}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Couldn't undo. Try again.");
        setGlasses((g) => g + 1);
      }
    });
  };

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-3xl border border-info/20 bg-gradient-to-br from-info/15 via-info/5 to-transparent p-4 sm:p-5",
        className,
      )}
    >
      {/* Wave fill — subtle background ripple representing progress */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 transition-all duration-700 ease-out"
        style={{
          height: `${pct}%`,
          background:
            "linear-gradient(180deg, transparent 0%, oklch(0.62 0.1 230 / 0.18) 30%, oklch(0.62 0.1 230 / 0.28) 100%)",
        }}
      />
      <div className="relative flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-info/80">
          Hydration
        </p>
        <Droplet
          className={cn(
            "size-4 text-info transition-transform duration-300",
            splash === "up" && "scale-125",
            splash === "down" && "scale-90",
          )}
        />
      </div>

      <div className="relative my-2 text-center">
        <p className="font-serif text-4xl leading-none text-foreground sm:text-5xl">
          {glasses}
          <span className="text-xl text-muted-foreground"> / {safeTarget}</span>
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          glasses today
        </p>
      </div>

      <div className="relative flex items-center gap-1.5">
        <button
          type="button"
          onClick={removeGlass}
          disabled={pending || glasses <= 0}
          aria-label="Remove glass"
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full border border-info/30 bg-background/80 text-info backdrop-blur",
            "transition-all hover:bg-info/10 active:scale-90 disabled:opacity-40",
          )}
        >
          <Minus className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={addGlass}
          disabled={pending}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-info px-3 py-1.5 text-xs font-medium text-info-foreground",
            "transition-all hover:bg-info/90 active:scale-95 disabled:opacity-50",
          )}
        >
          <Plus className="size-3" />
          <span>Glass</span>
        </button>
      </div>
    </div>
  );
}
