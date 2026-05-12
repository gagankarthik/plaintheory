import { type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, htmlFor, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
