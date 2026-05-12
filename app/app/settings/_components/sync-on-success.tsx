"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function SyncOnSuccess({ status }: { status: string }) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "success") return;

    async function sync() {
      try {
        await fetch("/api/billing/sync", { method: "POST" });
      } catch { /* best-effort */ }
      toast.success("You're on Plus. Welcome.", {
        description: "All features are now unlocked.",
        duration: 6000,
      });
      router.replace("/app/settings");
      router.refresh();
    }
    void sync();
  }, [status, router]);

  return null;
}
