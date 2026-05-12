import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
};

/**
 * PlainTheory mark — a soft rising arc with a calm dot above. Reads as a
 * sunrise or a thoughtful pause. Inherits currentColor so it adapts to theme.
 */
export function LogoMark({ className, size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M4 22C4 14.268 9.373 8 16 8C22.627 8 28 14.268 28 22"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="16" cy="4" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function LogoWithWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={22} className="text-primary" />
      <span className="font-serif text-base tracking-tight sm:text-lg">PlainTheory</span>
    </span>
  );
}
