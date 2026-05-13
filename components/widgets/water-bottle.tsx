"use client";

import { Droplet, Minus, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const localDate = () => new Intl.DateTimeFormat("en-CA").format(new Date());

type Props = {
  initialGlasses: number;
  target: number;
  className?: string;
};

export function WaterBottle({ initialGlasses, target, className }: Props) {
  const [glasses, setGlasses] = useState(initialGlasses);
  const [pending, startTransition] = useTransition();
  const [splash, setSplash] = useState<"up" | "down" | null>(null);
  const safeTarget = Math.max(1, target);
  const pct = Math.min(100, Math.round((glasses / safeTarget) * 100));

  // Self-correct: if SSR rendered with a stale date, fetch the true today's count.
  useEffect(() => {
    const today = localDate();
    const tz = new Date().getTimezoneOffset();
    fetch(`/api/water?date=${today}&tz=${tz}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { count: number }) => {
        if (typeof data.count === "number") setGlasses(data.count);
      })
      .catch(() => { /* keep initialGlasses on error */ });
  }, []);

  const triggerSplash = (dir: "up" | "down") => {
    setSplash(dir);
    setTimeout(() => setSplash(null), 600);
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
    <Card className={cn("border-border/60", className)}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="relative h-28 w-16 shrink-0">
          <svg viewBox="0 0 64 112" className="h-full w-full">
            <defs>
              <clipPath id="bottle-clip">
                <path d="M22 4 L42 4 L42 18 Q42 22 46 26 Q56 36 56 56 L56 96 Q56 108 44 108 L20 108 Q8 108 8 96 L8 56 Q8 36 18 26 Q22 22 22 18 Z" />
              </clipPath>
            </defs>
            <path
              d="M22 4 L42 4 L42 18 Q42 22 46 26 Q56 36 56 56 L56 96 Q56 108 44 108 L20 108 Q8 108 8 96 L8 56 Q8 36 18 26 Q22 22 22 18 Z"
              fill="var(--card)"
              stroke="var(--border)"
              strokeWidth="2"
            />
            <g clipPath="url(#bottle-clip)">
              <rect
                x="0"
                y={112 - (pct / 100) * 104}
                width="64"
                height={(pct / 100) * 104}
                fill="var(--info)"
                opacity="0.7"
                className="transition-all duration-700 ease-out"
              />
              <ellipse
                cx="32"
                cy={112 - (pct / 100) * 104}
                rx="40"
                ry="6"
                fill="var(--info)"
                opacity="0.5"
                className={cn(
                  "transition-all duration-700 ease-out",
                  splash === "up" && "origin-center animate-[water-rise_0.6s_ease-out]",
                  splash === "down" && "origin-center animate-[water-drop_0.6s_ease-out]",
                )}
              />
            </g>
            <rect x="20" y="2" width="24" height="4" rx="1.5" fill="var(--primary)" />
          </svg>
          {splash === "up" ? (
            <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 select-none text-xs animate-[droplet-pop_0.6s_ease-out]">
              💧
            </span>
          ) : null}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Hydration
            </p>
            <Droplet className="size-4 text-info" />
          </div>
          <div>
            <p className="font-serif text-2xl text-foreground">
              {glasses} <span className="text-base text-muted-foreground">/ {safeTarget}</span>
            </p>
            <p className="text-xs text-muted-foreground">glasses today</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={removeGlass}
              disabled={pending || glasses <= 0}
              aria-label="Remove glass"
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground",
                "transition-all hover:bg-muted/60 hover:text-foreground active:scale-90 disabled:opacity-40",
              )}
            >
              <Minus className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={addGlass}
              disabled={pending}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-info/10 px-3 py-1.5 text-xs font-medium text-info",
                "transition-all hover:bg-info/20 active:scale-95 disabled:opacity-50",
              )}
            >
              <Plus className="size-3" /> Add glass
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
