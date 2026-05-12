import { cn } from "@/lib/utils";

type Props = {
  current: number;
  total: number;
};

export function Progress({ current, total }: Props) {
  return (
    <div
      className="flex justify-center gap-1.5"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 w-8 rounded-full transition-colors duration-500",
            i < current ? "bg-primary" : i === current ? "bg-primary/60" : "bg-border/60",
          )}
        />
      ))}
    </div>
  );
}
