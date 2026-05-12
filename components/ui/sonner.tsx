"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  const { theme } = useTheme();
  const resolvedTheme: "system" | "light" | "dark" =
    theme === "dark" ? "dark" : theme === "light" ? "light" : "system";
  return (
    <SonnerToaster
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border/60 group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
