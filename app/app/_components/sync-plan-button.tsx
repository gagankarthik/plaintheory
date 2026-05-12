"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const localDate = () => new Intl.DateTimeFormat("en-CA").format(new Date());

const writeCookie = (name: string, value: string, days = 365) => {
  const exp = new Date();
  exp.setDate(exp.getDate() + days);
  document.cookie = `${name}=${value}; path=/; SameSite=Lax; Expires=${exp.toUTCString()}`;
};

export function SyncPlanButton() {
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    setLoading(true);

    // 1. Stamp correct local date cookies so proxy/server sees today immediately.
    const today = localDate();
    writeCookie("pt-tz-offset", String(new Date().getTimezoneOffset()));
    writeCookie("pt-local-date", today, 2);

    try {
      // 2. Generate today's plan (force-creates even if one already exists).
      const res = await fetch("/api/plan/today", {
        method: "POST",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");

      toast.success("Synced — loading today.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sync. Try again.");
    }

    // 3. Hard-navigate to /app with cache-bust so the browser fetches fresh HTML.
    //    Runs whether plan gen succeeded or failed — cookies are already correct.
    window.location.href = `/app?t=${Date.now()}`;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={sync}
      disabled={loading}
      className="gap-1.5"
    >
      <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Syncing…" : "Sync today"}
    </Button>
  );
}
