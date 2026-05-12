import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary/10 text-primary",
        outline: "border border-border text-foreground",
        success: "bg-success/15 text-success",
        warning: "bg-warning/20 text-warning",
        destructive: "bg-destructive/12 text-destructive",
        info: "bg-info/12 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
