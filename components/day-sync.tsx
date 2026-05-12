"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const COOKIE = "pt-local-date";

/** en-CA gives YYYY-MM-DD in the browser's local timezone. */
const localDate = () => new Intl.DateTimeFormat("en-CA").format(new Date());

const getCookie = () =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(COOKIE + "="))
    ?.split("=")[1] ?? null;

const setCookie = (date: string) => {
  const exp = new Date();
  exp.setDate(exp.getDate() + 2);
  document.cookie = `${COOKIE}=${date}; path=/; SameSite=Lax; Expires=${exp.toUTCString()}`;
};

/**
 * Keeps the server in sync with the browser's local date.
 *
 * On mount it writes the local YYYY-MM-DD to a cookie. If the stored date
 * differs (first visit, or day rolled over while sleeping), it calls
 * router.refresh() so server components re-render with the correct date.
 *
 * Also schedules a refresh at local midnight and on tab-visibility restore
 * (handles device sleep across midnight).
 *
 * Mount once in the authenticated app layout.
 */
export function DaySync() {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const sync = (forceRefresh = false) => {
      const today = localDate();
      const stored = getCookie();
      setCookie(today);
      if (stored !== today || forceRefresh) {
        router.refresh();
      }
    };

    const msUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0,
      );
      return midnight.getTime() - now.getTime();
    };

    const schedule = () => {
      timer = setTimeout(() => {
        sync(true);
        schedule();
      }, msUntilMidnight());
    };

    sync();
    schedule();

    const onVisibility = () => {
      if (!document.hidden) {
        sync();
        clearTimeout(timer);
        schedule();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return null;
}
