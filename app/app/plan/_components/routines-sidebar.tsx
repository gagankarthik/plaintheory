import { Moon, Sun } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { UpgradeGate } from "@/components/ui/upgrade-gate";
import type { DailyRoutine } from "@/lib/db/plans";

function RoutineCard({ routine }: { routine: DailyRoutine }) {
  const isMorning = routine.title.toLowerCase().includes("morning");
  const Icon = isMorning ? Sun : Moon;
  const color = isMorning ? "var(--warning)" : "var(--primary)";

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-3.5 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
          >
            <Icon className="size-4" style={{ color }} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{routine.title}</p>
            {routine.time ? (
              <p className="text-xs text-muted-foreground">{routine.time}</p>
            ) : null}
          </div>
        </div>
        <ol className="space-y-2">
          {routine.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  color,
                }}
              >
                {i + 1}
              </span>
              <span className="text-sm leading-snug text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

/** Blurred routine preview used inside the gate. */
function RoutinePreview() {
  return (
    <div className="space-y-4">
      {["Morning Routine", "Evening Routine"].map((title, t) => (
        <Card key={title} className="border-border/60">
          <CardContent className="space-y-3 px-5 py-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-border/40" />
              <div className="space-y-1">
                <div className="h-3 w-28 rounded-full bg-border/60" />
                <div className="h-2.5 w-14 rounded-full bg-border/40" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: t === 0 ? 4 : 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 size-5 shrink-0 rounded-full bg-border/50" />
                  <div className={`h-2.5 rounded-full bg-border/50 ${["w-full", "w-4/5", "w-3/5", "w-11/12"][i % 4]}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RoutinesSidebar({
  routines,
  isPlus,
}: {
  routines: DailyRoutine[];
  isPlus: boolean;
}) {
  if (!isPlus) {
    return (
      <aside className="space-y-4">
        <p className="px-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Today&rsquo;s routines
        </p>
        <UpgradeGate
          title="Morning & evening routines"
          description="AI-crafted routines timed to your wake and sleep schedule. Available on Plus."
          preview={<RoutinePreview />}
        />
      </aside>
    );
  }

  if (!routines.length) return null;

  return (
    <aside className="space-y-4">
      <p className="px-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Today&rsquo;s routines
      </p>
      {routines.map((r) => (
        <RoutineCard key={r.title} routine={r} />
      ))}
    </aside>
  );
}
