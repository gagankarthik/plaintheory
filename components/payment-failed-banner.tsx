"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PaymentFailedBanner() {
  const [pending, setPending] = useState(false);

  const openPortal = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal unavailable");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't open billing portal");
      setPending(false);
    }
  };

  return (
    <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2.5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <AlertTriangle className="size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            <span className="font-medium">Payment failed.</span>{" "}
            <span className="text-destructive/80">Update your card to keep Plus access.</span>
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={openPortal}
          className="shrink-0 text-xs font-medium text-destructive underline-offset-2 hover:underline disabled:opacity-60"
        >
          {pending ? "Opening…" : "Update card →"}
        </button>
      </div>
    </div>
  );
}
