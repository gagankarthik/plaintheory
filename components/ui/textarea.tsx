import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground",
        "transition-colors duration-200",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
