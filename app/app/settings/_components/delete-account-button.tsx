"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const onDelete = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/me/delete", { method: "POST" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Your account is scheduled for deletion.");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setPending(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete my account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            Your data will be retained for 30 days in case you change your mind, then permanently
            removed. You&rsquo;ll be signed out immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" loading={pending} onClick={onDelete}>
            Yes, delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
