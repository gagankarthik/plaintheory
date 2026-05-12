"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CrisisResource } from "@/lib/ai/crisis";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: CrisisResource[];
};

export function CrisisModal({ open, onOpenChange, resources }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>This is a moment for a real human</DialogTitle>
          <DialogDescription>
            PlainTheory is a coaching companion, not a crisis line. Please reach out to someone
            trained — these lines are free and confidential.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.name} className="rounded-xl border border-border/60 bg-card p-4">
              <p className="font-medium">{r.name}</p>
              <p className="text-sm text-foreground">{r.contact}</p>
              <p className="text-xs text-muted-foreground">{r.description}</p>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
