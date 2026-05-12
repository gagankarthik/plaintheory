import { Compass, Flame, Heart, Leaf, Lock, Sparkles, Sun, Trophy } from "lucide-react";

import type { Badge } from "@/lib/achievements";
import { ALL_BADGES } from "@/lib/achievements";
import { cn } from "@/lib/utils";

const ICONS = {
  flame: Flame,
  sun: Sun,
  sparkles: Sparkles,
  trophy: Trophy,
  leaf: Leaf,
  compass: Compass,
  heart: Heart,
} as const;

const GRADIENTS: Record<string, string> = {
  flame: "from-orange-400/80 to-red-500/80",
  sun: "from-amber-300/80 to-orange-400/80",
  sparkles: "from-violet-300/80 to-fuchsia-400/80",
  trophy: "from-yellow-300/80 to-amber-500/80",
  leaf: "from-emerald-300/80 to-green-500/80",
  compass: "from-sky-300/80 to-blue-500/80",
  heart: "from-rose-300/80 to-pink-500/80",
};

export function BadgesRow({ earned }: { earned: Badge[] }) {
  const earnedIds = new Set(earned.map((b) => b.id));

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Achievements
        </p>
        <p className="text-xs text-muted-foreground">
          {earned.length} / {ALL_BADGES.length} earned
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {ALL_BADGES.map((meta) => {
          const isEarned = earnedIds.has(meta.id);
          const Icon = ICONS[meta.icon] ?? Sparkles;
          const gradient = GRADIENTS[meta.icon] ?? GRADIENTS.sparkles;
          return (
            <div
              key={meta.id}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all",
                isEarned
                  ? "border-border/60 bg-card hover:scale-[1.03]"
                  : "border-border/40 bg-card/40 opacity-60",
              )}
              title={meta.description}
            >
              <div className="relative">
                <svg viewBox="0 0 64 72" className="h-16 w-14">
                  <defs>
                    <linearGradient id={`grad-${meta.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={isEarned ? 1 : 0.3} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={isEarned ? 0.7 : 0.2} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M32 2 L60 16 L60 44 L32 68 L4 44 L4 16 Z"
                    className={cn(
                      "transition-all",
                      isEarned ? `bg-gradient-to-b ${gradient}` : "",
                    )}
                    fill={isEarned ? `url(#grad-${meta.id})` : "var(--muted)"}
                    stroke={isEarned ? "var(--card)" : "var(--border)"}
                    strokeWidth="1.5"
                    style={
                      isEarned
                        ? {
                            filter:
                              "drop-shadow(0 4px 8px rgb(0 0 0 / 0.12)) drop-shadow(0 1px 2px rgb(0 0 0 / 0.06))",
                          }
                        : undefined
                    }
                  />
                  <foreignObject x="20" y="22" width="24" height="24">
                    <div className="flex size-6 items-center justify-center text-white">
                      <Icon className="size-5" strokeWidth={2.5} />
                    </div>
                  </foreignObject>
                </svg>
                {!isEarned ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="size-4 text-muted-foreground" />
                  </div>
                ) : null}
              </div>
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-[11px] font-medium leading-tight",
                    isEarned ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {meta.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
