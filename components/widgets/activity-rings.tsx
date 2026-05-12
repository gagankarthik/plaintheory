import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Ring = {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
};

type Props = {
  hydration: { value: number; target: number };
  checkIns: { value: number; target: number };
  planActions: { value: number; target: number };
  className?: string;
};

const RING_RADIUS = 44;
const RING_GAP = 10;

export function ActivityRings({ hydration, checkIns, planActions, className }: Props) {
  const rings: Ring[] = [
    { label: "Hydration", value: hydration.value, target: hydration.target, color: "var(--info)", unit: "glasses" },
    { label: "Check-ins", value: checkIns.value, target: checkIns.target, color: "var(--primary)", unit: "today" },
    { label: "Plan", value: planActions.value, target: planActions.target, color: "var(--success)", unit: "actions" },
  ];

  return (
    <Card className={cn("border-border/60 overflow-hidden", className)}>
      <CardContent className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-6">
        <div className="relative size-40 shrink-0">
          <svg viewBox="0 0 160 160" className="size-full -rotate-90">
            {rings.map((ring, i) => {
              const r = RING_RADIUS + i * RING_GAP;
              const c = 2 * Math.PI * r;
              const pct = Math.min(1, ring.target === 0 ? 0 : ring.value / ring.target);
              const offset = c * (1 - pct);
              return (
                <g key={ring.label}>
                  <circle
                    cx="80"
                    cy="80"
                    r={r}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth="9"
                    strokeLinecap="round"
                    opacity="0.15"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={r}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                    style={{ filter: `drop-shadow(0 0 6px ${ring.color}40)` }}
                  />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Today&rsquo;s rings
          </p>
          <div className="space-y-2">
            {rings.map((ring) => {
              const pct = ring.target === 0 ? 0 : Math.min(100, Math.round((ring.value / ring.target) * 100));
              return (
                <div key={ring.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: ring.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{ring.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {ring.value} / {ring.target} {ring.unit ? `· ${pct}%` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
