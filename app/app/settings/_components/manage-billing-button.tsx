"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ManageBillingButton() {
  const [pending, setPending] = useState(false);
  return (
    <Button
      loading={pending}
      onClick={async () => {
        setPending(true);
        try {
          const res = await fetch("/api/billing/portal", { method: "POST" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Portal failed");
          window.location.href = data.url;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Portal failed");
          setPending(false);
        }
      }}
    >
      Manage subscription
    </Button>
  );
}
