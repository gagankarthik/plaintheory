"use client";

import { Droplet, Plus } from "lucide-react";
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

  const addGlass = () => {
    const today = localDate();
    const next = glasses + 1;
    setGlasses(next);
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
                className="transition-all duration-700 ease-out"
              />
            </g>
            <rect x="20" y="2" width="24" height="4" rx="1.5" fill="var(--primary)" />
          </svg>
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
          <button
            type="button"
            onClick={addGlass}
            disabled={pending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-info/10 px-3 py-1.5 text-xs font-medium text-info",
              "transition-all hover:bg-info/20 active:scale-95 disabled:opacity-50",
            )}
          >
            <Plus className="size-3" /> Add glass
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
