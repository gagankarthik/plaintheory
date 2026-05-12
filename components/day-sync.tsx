"use client";

import { useEffect } from "react";

const DATE_COOKIE = "pt-local-date";
const TZ_COOKIE = "pt-tz-offset";

/** en-CA locale gives YYYY-MM-DD in the browser's local timezone. */
const localDate = () => new Intl.DateTimeFormat("en-CA").format(new Date());

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1] ?? null;

const setCookie = (name: string, value: string, days = 365) => {
  const exp = new Date();
  exp.setDate(exp.getDate() + days);
  document.cookie = `${name}=${value}; path=/; SameSite=Lax; Expires=${exp.toUTCString()}`;
};

/**
 * Keeps server components in sync with the browser's local date.
 *
 * On mount it writes two cookies:
 *  - pt-tz-offset  : the browser's stable timezone offset (minutes behind UTC).
 *    Middleware reads this to compute the correct date on every server render
 *    without any client round-trip.
 *  - pt-local-date : today's YYYY-MM-DD. Middleware also reads this as a
 *    fallback before pt-tz-offset is established.
 *
 * If the stored date differs from today (first visit after midnight, new
 * timezone, etc.) the page is hard-reloaded so the server sees the fresh
 * cookies immediately. A hard reload is used instead of router.refresh()
 * because it guarantees the updated cookies are included in the new request.
 *
 * Also schedules a reload at local midnight and on tab-visibility restore
 * so the app stays correct after the device sleeps through midnight.
 *
 * Mount once in the authenticated app layout.
 */
export function DaySync() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const sync = (forceReload = false) => {
      const today = localDate();
      const tzOffset = new Date().getTimezoneOffset(); // minutes behind UTC
      const storedDate = getCookie(DATE_COOKIE);

      // Always keep the tz offset cookie up to date (stable; changes rarely).
      setCookie(TZ_COOKIE, String(tzOffset));
      setCookie(DATE_COOKIE, today, 2);

      if (storedDate !== today || forceReload) {
        // Hard reload so the server sees the new cookies in the same request.
        window.location.reload();
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
        10, // 10 s past midnight to be safe
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
  }, []);

  return null;
}
