"use client";

import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pt-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Browser-only check — setVisible after mount is the standard hydration-safe pattern.
    const tid = window.setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    }, 0);
    return () => window.clearTimeout(tid);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now() }));
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card p-4 shadow-[0_2px_8px_-2px_rgb(0_0_0_/_0.08),0_24px_48px_-12px_rgb(0_0_0_/_0.16)] backdrop-blur sm:bottom-6 sm:p-5"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Cookie className="size-4" />
        </span>
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-medium text-foreground">A short note on cookies</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            We only use essential cookies — your sign-in session and your theme preference.
            No tracking. No ads. Read our{" "}
            <Link href="/privacy" className="font-medium text-foreground underline-offset-2 hover:underline">
              privacy policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button size="sm" onClick={dismiss}>
            Got it
          </Button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
