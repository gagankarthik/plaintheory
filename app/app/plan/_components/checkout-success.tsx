"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function CheckoutSuccess() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      try {
        await fetch("/api/billing/sync", { method: "POST" });
      } catch {
        // Best-effort — even if sync fails the plan may update via webhook
      }

      if (cancelled) return;

      toast.success("You're on Plus. Welcome.", {
        description: "All features are now unlocked.",
        duration: 6000,
      });

      // Remove the ?checkout=success param and hard-refresh so the server
      // component re-renders with the updated subscription plan.
      router.replace("/app/plan");
      router.refresh();
    }

    void sync();
    return () => { cancelled = true; };
  }, [router]);

  return null;
}
