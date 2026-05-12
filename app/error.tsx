"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root error]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md space-y-5 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="font-serif text-3xl tracking-tight">A glitch, not a wall.</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Something on our end didn&rsquo;t respond. Try again — if it keeps happening, sign
          out and back in.
        </p>
        {error.digest ? (
          <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")}>Go home</Button>
        </div>
      </div>
    </div>
  );
}
