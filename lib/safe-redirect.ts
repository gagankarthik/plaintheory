/**
 * Validate a `from=` query parameter before redirecting to it. Prevents open
 * redirects by rejecting absolute URLs, protocol-relative URLs, and loops
 * back to auth pages.
 */
export function safeReturnTo(from: string | null, fallback = "/app"): string {
  if (!from) return fallback;
  if (!from.startsWith("/")) return fallback;
  if (from.startsWith("//") || from.startsWith("/\\")) return fallback;
  if (from.startsWith("/sign-in") || from.startsWith("/sign-up")) return fallback;
  if (from.startsWith("/confirm") || from.startsWith("/forgot-password")) return fallback;
  if (from.startsWith("/reset-password")) return fallback;
  return from;
}
