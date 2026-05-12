"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative"
    >
      <Sun
        className="size-5 transition-all duration-300 dark:-rotate-90 dark:scale-0"
        aria-hidden
      />
      <Moon
        className="absolute size-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
        aria-hidden
      />
    </Button>
  );
}
