"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** en-CA locale gives YYYY-MM-DD in the browser's local timezone. */
const localDate = () => new Intl.DateTimeFormat("en-CA").format(new Date());

const writeCookie = (name: string, value: string, days = 365) => {
  const exp = new Date();
  exp.setDate(exp.getDate() + days);
  document.cookie = `${name}=${value}; path=/; SameSite=Lax; Expires=${exp.toUTCString()}`;
};

/**
 * Forces a full app sync:
 * 1. Writes pt-tz-offset + pt-local-date so the proxy computes today's date.
 * 2. Calls POST /api/plan/today to generate today's plan if missing.
 * 3. Hard-reloads — every page re-renders with the correct date.
 */
export function SyncPlanButton() {
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    setLoading(true);

    // Step 1 — stamp the correct local date into cookies before any request.
    writeCookie("pt-tz-offset", String(new Date().getTimezoneOffset()));
    writeCookie("pt-local-date", localDate(), 2);

    try {
      // Step 2 — ensure today's plan exists (force-generates if missing).
      const res = await fetch("/api/plan/today", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");

      toast.success("All synced — loading today.");
      // Step 3 — hard reload: proxy now sees fresh cookies, all pages re-render.
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sync. Try again.");
      setLoading(false);
    }
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
