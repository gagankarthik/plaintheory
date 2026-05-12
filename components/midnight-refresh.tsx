"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Invisible component that triggers router.refresh() at local midnight and
 * whenever the device wakes from sleep after a day boundary has passed.
 * Mount once in the authenticated app layout.
 */
export function MidnightRefresh() {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const msUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0,
      );
      return midnight.getTime() - now.getTime();
    };

    const schedule = () => {
      timer = setTimeout(() => {
        router.refresh();
        schedule();
      }, msUntilMidnight());
    };

    schedule();

    // If the device slept over midnight, the timeout won't have fired.
    // Re-check when the tab becomes visible again.
    let trackedDate = new Date().toISOString().slice(0, 10);

    const onVisibilityChange = () => {
      if (!document.hidden) {
        const today = new Date().toISOString().slice(0, 10);
        if (today !== trackedDate) {
          trackedDate = today;
          router.refresh();
        }
        // Re-arm the timer in case it expired while the device was asleep.
        clearTimeout(timer);
        schedule();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}
