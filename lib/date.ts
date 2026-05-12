import { cookies, headers } from "next/headers";

/**
 * Returns today's date as YYYY-MM-DD in the user's local timezone.
 *
 * Priority:
 * 1. x-pt-local-date header — injected by proxy from the stable
 *    pt-tz-offset cookie (most reliable; works from the very first render).
 * 2. pt-local-date cookie — set by DaySync; available after first JS run.
 * 3. UTC date — fallback when no client data is present yet.
 */
export async function getLocalDate(): Promise<string> {
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  const headerStore = await headers();
  const headerVal = headerStore.get("x-pt-local-date");
  if (headerVal && ISO_DATE.test(headerVal)) return headerVal;

  const cookieStore = await cookies();
  const cookieVal = cookieStore.get("pt-local-date")?.value;
  if (cookieVal && ISO_DATE.test(cookieVal)) return cookieVal;

  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns the browser's timezone offset in minutes (same as
 * Date.prototype.getTimezoneOffset — positive = behind UTC).
 * Returns null when no offset data is available.
 */
export async function getLocalTzOffset(): Promise<number | null> {
  const headerStore = await headers();
  const hVal = headerStore.get("x-pt-tz-offset");
  if (hVal) {
    const n = parseInt(hVal, 10);
    if (!isNaN(n)) return n;
  }
  const cookieStore = await cookies();
  const cVal = cookieStore.get("pt-tz-offset")?.value;
  if (cVal) {
    const n = parseInt(cVal, 10);
    if (!isNaN(n)) return n;
  }
  return null;
}

/**
 * Returns true when a log entry belongs to the given local date.
 *
 * Uses the log's own localDate field when available (set on the client for all
 * recent logs). Falls back to comparing the UTC timestamp against the user's
 * local-day window when tzOffsetMin is known, or a plain UTC-date prefix match
 * as a last resort (may be slightly off for users in UTC−N timezones).
 */
export function isLocalDay(
  log: { timestamp: string; localDate?: string },
  today: string,
  tzOffsetMin?: number | null,
): boolean {
  if (log.localDate) return log.localDate === today;

  if (tzOffsetMin != null && !isNaN(tzOffsetMin)) {
    // Convert "midnight local" to a UTC millisecond boundary.
    // getTimezoneOffset() = UTC − local, so local midnight = UTC 00:00 + offset minutes.
    const dayStartMs =
      new Date(today + "T00:00:00Z").getTime() + tzOffsetMin * 60 * 1_000;
    const dayEndMs = dayStartMs + 86_400_000;
    const logMs = new Date(log.timestamp).getTime();
    return logMs >= dayStartMs && logMs < dayEndMs;
  }

  // Last resort: compare UTC date prefix (works perfectly for UTC±0 users).
  return log.timestamp.startsWith(today);
}
