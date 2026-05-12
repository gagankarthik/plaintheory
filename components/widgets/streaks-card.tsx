import { Flame, Star, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  checkInStreak: number;
  planStreak: number;
  bestHabitStreak: number;
  className?: string;
};

type StreakRowProps = {
  icon: React.ReactNode;
  label: string;
  days: number;
  color: string;
};

function StreakRow({ icon, label, days, color }: StreakRowProps) {
  const active = days > 0;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", active ? color : "bg-muted/40")}>
          {icon}
        </span>
        <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("font-serif text-xl font-semibold", active ? "text-foreground" : "text-muted-foreground/50")}>
          {days}
        </span>
        <span className="text-xs text-muted-foreground">{days === 1 ? "day" : "days"}</span>
      </div>
    </div>
  );
}

export function StreaksCard({ checkInStreak, planStreak, bestHabitStreak, className }: Props) {
  const best = Math.max(checkInStreak, planStreak, bestHabitStreak);

  return (
    <Card className={cn("border-border/60", className)}>
      <CardContent className="space-y-4 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Streaks</p>
          {best >= 3 ? (
            <span className="text-xs font-medium text-warning">{best}-day best 🔥</span>
          ) : null}
        </div>

        <div className="space-y-3">
          <StreakRow
            icon={<Flame className={cn("size-4", checkInStreak > 0 ? "text-warning" : "text-muted-foreground/40")} />}
            label="Daily check-ins"
            days={checkInStreak}
            color="bg-warning/15"
          />
          <StreakRow
            icon={<Star className={cn("size-4", planStreak > 0 ? "text-primary" : "text-muted-foreground/40")} />}
            label="Full plans done"
            days={planStreak}
            color="bg-primary/10"
          />
          <StreakRow
            icon={<Zap className={cn("size-4", bestHabitStreak > 0 ? "text-success" : "text-muted-foreground/40")} />}
            label="Best habit"
            days={bestHabitStreak}
            color="bg-success/10"
          />
        </div>

        {best === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            Start today — day 1 is always the hardest.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
