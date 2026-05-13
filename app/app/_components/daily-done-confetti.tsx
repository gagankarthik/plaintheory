"use client";

import { useEffect, useState } from "react";

import { Confetti } from "@/components/ui/confetti";

const STORAGE_KEY = "pt-confetti-shown";

/**
 * Fires confetti once per date when the user lands on a fully-completed day.
 * Persists "shown" state in localStorage so a refresh doesn't re-trigger.
 */
export function DailyDoneConfetti({ date, done }: { date: string; done: boolean }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!done) return;
    try {
      const last = window.localStorage.getItem(STORAGE_KEY);
      if (last === date) return;
      window.localStorage.setItem(STORAGE_KEY, date);
    } catch {
      // storage unavailable — still fire once per mount
    }
    setActive(true);
    const id = setTimeout(() => setActive(false), 2600);
    return () => clearTimeout(id);
  }, [date, done]);

  return <Confetti active={active} />;
}
