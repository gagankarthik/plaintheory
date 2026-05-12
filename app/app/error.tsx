"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md space-y-5 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          We hit a snag
        </p>
        <h1 className="font-serif text-3xl tracking-tight">Couldn&rsquo;t load that.</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Often a transient hiccup — give it another go. If it persists, your AWS or AI
          credentials may need attention.
        </p>
        {error.digest ? (
          <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")}>Sign out</Button>
        </div>
      </div>
    </div>
  );
}
