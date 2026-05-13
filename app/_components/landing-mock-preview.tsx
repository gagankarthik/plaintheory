"use client";

import { Check, Droplet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TASKS = [
  { emoji: "🥗", text: "Protein-first breakfast", initial: true },
  { emoji: "🏃", text: "Walk 10 minutes after lunch", initial: true },
  { emoji: "🌙", text: "Phone off by 9:30pm", initial: false },
] as const;

/**
 * The hero mock preview — task list animates the third row from open → checked
 * the first time the card enters view. Small payoff that telegraphs "this thing
 * is alive" without being noisy.
 */
export function LandingMockPreview() {
  const [thirdDone, setThirdDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      // Fallback: animate after a beat.
      const t = setTimeout(() => setThirdDone(true), 1400);
      return () => clearTimeout(t);
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(() => setThirdDone(true), 900);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const doneCount = TASKS.filter((t, i) => (i === 2 ? thirdDone : t.initial)).length;
  const pct = Math.round((doneCount / TASKS.length) * 100);

  return (
    <div className="mx-auto mt-12 max-w-3xl px-2 sm:mt-16" ref={containerRef}>
      <div className="rounded-3xl border border-border/60 bg-card/80 p-3 shadow-[0_2px_4px_0_rgb(0_0_0_/_0.04),0_40px_80px_-30px_rgb(0_0_0_/_0.18)] backdrop-blur sm:p-5">
        <Card className="border-border/60">
          <CardContent className="space-y-3 p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span>Tuesday — your day</span>
              <Badge
                variant={pct === 100 ? "success" : "primary"}
                className="text-[10px] transition-all duration-500"
              >
                {doneCount} / {TASKS.length} done
              </Badge>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  pct === 100 ? "bg-success" : "bg-primary",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <ul className="space-y-2">
              {TASKS.map((t, i) => {
                const done = i === 2 ? thirdDone : t.initial;
                return (
                  <li
                    key={t.text}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-sm transition-all duration-500",
                      done ? "border-primary/30 bg-primary/5" : "border-border/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-500",
                        done
                          ? "bg-primary text-primary-foreground"
                          : "border-2 border-border bg-card",
                      )}
                    >
                      <Check
                        className={cn(
                          "size-3 transition-all duration-300",
                          done ? "scale-100 opacity-100" : "scale-0 opacity-0",
                        )}
                        strokeWidth={3}
                      />
                    </span>
                    <span className="text-base">{t.emoji}</span>
                    <span
                      className={cn(
                        "transition-all duration-500",
                        done ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {t.text}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-3 py-2.5">
              <Droplet className="size-4 text-info" />
              <p className="flex-1 text-xs text-muted-foreground">Hydration</p>
              <p className="font-serif text-sm text-foreground">
                6 <span className="text-xs text-muted-foreground">/ 8</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
