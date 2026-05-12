import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  /** 1–5 latest mood rating, or null when no recent log. */
  rating: number | null;
  className?: string;
};

/**
 * A single SVG face that morphs across 5 expressions based on rating.
 * 1 = very low, 5 = joyful. Lines are smooth and warm — not clinical.
 */
export function MoodFace({ rating, className }: Props) {
  const r = rating ?? 0;
  const mouth = mouthPathFor(r);
  const browLeft = browFor(r, "left");
  const browRight = browFor(r, "right");
  const label = labelFor(r);

  return (
    <Card className={cn("border-border/60", className)}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 96 96" className="h-full w-full">
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="var(--secondary)"
              stroke="var(--border)"
              strokeWidth="2"
            />
            {/* Eyes */}
            <circle cx="34" cy="42" r="3" fill="var(--foreground)" />
            <circle cx="62" cy="42" r="3" fill="var(--foreground)" />
            {/* Brows */}
            <path
              d={browLeft}
              stroke="var(--foreground)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-500 ease-out"
            />
            <path
              d={browRight}
              stroke="var(--foreground)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-500 ease-out"
            />
            {/* Mouth */}
            <path
              d={mouth}
              stroke="var(--foreground)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-500 ease-out"
            />
            {/* Cheeks for happy */}
            {r >= 4 ? (
              <>
                <circle cx="26" cy="58" r="4" fill="var(--primary)" opacity="0.25" />
                <circle cx="70" cy="58" r="4" fill="var(--primary)" opacity="0.25" />
              </>
            ) : null}
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mood</p>
          <p className="font-serif text-2xl text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {rating === null ? "No check-in yet today." : `Last check-in: ${rating}/5`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function mouthPathFor(r: number): string {
  // Curve goes from frown (1) to flat (3) to grin (5).
  switch (r) {
    case 1:
      return "M30 70 Q48 56 66 70";
    case 2:
      return "M30 66 Q48 60 66 66";
    case 3:
      return "M32 64 L64 64";
    case 4:
      return "M30 62 Q48 72 66 62";
    case 5:
      return "M28 60 Q48 78 68 60";
    default:
      return "M32 64 L64 64";
  }
}

function browFor(r: number, side: "left" | "right"): string {
  const baseY = 30;
  if (side === "left") {
    if (r <= 1) return `M28 ${baseY + 2} L40 ${baseY - 2}`;
    if (r === 2) return `M28 ${baseY + 1} L40 ${baseY - 1}`;
    if (r >= 4) return `M28 ${baseY - 2} L40 ${baseY - 4}`;
    return `M28 ${baseY} L40 ${baseY}`;
  }
  if (r <= 1) return `M56 ${baseY - 2} L68 ${baseY + 2}`;
  if (r === 2) return `M56 ${baseY - 1} L68 ${baseY + 1}`;
  if (r >= 4) return `M56 ${baseY - 4} L68 ${baseY - 2}`;
  return `M56 ${baseY} L68 ${baseY}`;
}

function labelFor(r: number): string {
  switch (r) {
    case 1:
      return "Low";
    case 2:
      return "Off";
    case 3:
      return "Steady";
    case 4:
      return "Good";
    case 5:
      return "Bright";
    default:
      return "—";
  }
}
