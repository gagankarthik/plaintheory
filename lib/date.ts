import { cookies } from "next/headers";

/**
 * Returns today's date as YYYY-MM-DD in the user's local timezone.
 * Reads the `pt-local-date` cookie set by the DaySync client component.
 * Falls back to UTC if the cookie is missing (e.g. first render before JS runs).
 */
export async function getLocalDate(): Promise<string> {
  const store = await cookies();
  const val = store.get("pt-local-date")?.value;
  if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  return new Date().toISOString().slice(0, 10);
}
