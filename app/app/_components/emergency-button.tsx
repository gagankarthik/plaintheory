"use client";

import { LifeBuoy, MessageCircle, Wind } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * A small always-available "emergency" button. Tapping it opens an animated
 * calming dialog — a breathing guide plus a quick way to reach the coach.
 * Intentionally non-clinical: a grounding pause, not medical advice.
 */
export function EmergencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Need a moment? Open calm help"
          className="emergency-ring fixed bottom-20 right-4 z-40 inline-flex size-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive text-destructive-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 sm:right-6 lg:bottom-6"
        >
          <LifeBuoy className="size-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md text-center">
        <DialogHeader className="items-center">
          <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Wind className="size-5" />
          </span>
          <DialogTitle className="text-center">Take a moment.</DialogTitle>
          <DialogDescription className="text-center">
            Whatever&rsquo;s going on, you don&rsquo;t have to figure it out this second. Breathe
            with the circle for a few rounds.
          </DialogDescription>
        </DialogHeader>

        {/* Breathing guide */}
        <div className="relative mx-auto flex size-44 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-destructive/15 to-info/15 blur-xl" />
          <span className="animate-breathe absolute inline-flex size-36 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-info/30">
            <span className="size-24 rounded-full bg-gradient-to-br from-primary/50 to-info/40" />
          </span>
          <span className="relative text-xs font-medium uppercase tracking-[0.2em] text-foreground/80">
            Breathe
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/app/chat" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <MessageCircle className="size-4" /> Talk to your coach
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            I&rsquo;m okay
          </Button>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          PlainTheory is general coaching, not crisis or medical care. If you&rsquo;re in danger or
          need urgent help, contact your local emergency services.
        </p>
      </DialogContent>
    </Dialog>
  );
}
