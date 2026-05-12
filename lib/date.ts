import { cookies, headers } from "next/headers";

/**
 * Returns today's date as YYYY-MM-DD in the user's local timezone.
 *
 * Priority:
 * 1. x-pt-local-date header — injected by middleware from the stable
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
