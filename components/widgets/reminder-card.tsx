"use client";

import { Bell } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  hour: number;
  waterToday: number;
  waterTarget: number;
  todayCheckIns: number;
  planDone: boolean;
};

export function ReminderCard({
  hour,
  waterToday,
  waterTarget,
  todayCheckIns,
  planDone,
}: Props) {
  const reminders = useMemo(() => {
    const list: { label: string; icon: string }[] = [];
    if (hour < 10 && todayCheckIns === 0) {
      list.push({ icon: "🌤", label: "Quick mood check-in to start the day." });
    }
    if (hour >= 12 && hour < 14 && waterToday < Math.ceil(waterTarget / 3)) {
      list.push({ icon: "💧", label: "Glass of water with lunch?" });
    }
    if (hour >= 14 && hour < 17 && !planDone) {
      list.push({ icon: "🎯", label: "Mid-afternoon: any focus action you can knock out?" });
    }
    if (hour >= 17 && hour < 20) {
      list.push({ icon: "🧘", label: "Wind-down window. A short walk or stretch?" });
    }
    if (hour >= 20 && todayCheckIns < 2) {
      list.push({ icon: "🌙", label: "How did the day land? Evening reflection." });
    }
    if (hour >= 22) {
      list.push({ icon: "💤", label: "Screens down soon — tomorrow starts with sleep." });
    }
    return list;
  }, [hour, todayCheckIns, planDone, waterToday, waterTarget]);

  if (reminders.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="space-y-2.5 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          <p className="text-xs uppercase tracking-[0.18em] text-primary">
            Gentle nudge
          </p>
        </div>
        <ul className="space-y-1.5">
          {reminders.map((r) => (
            <li key={r.label} className="flex items-start gap-2 text-sm text-foreground">
              <span>{r.icon}</span>
              <span className="leading-relaxed">{r.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
