import { NextResponse, type NextRequest } from "next/server";

import { verifyIdToken } from "@/lib/auth/jwt";
import { ID_TOKEN_COOKIE } from "@/lib/auth/session";

/**
 * Next.js 16 proxy — runs before every matched request.
 *
 * 1. Auth guard: protects /app and /onboarding behind a valid Cognito ID token.
 * 2. Date injection: reads the pt-tz-offset cookie (browser timezone offset in
 *    minutes behind UTC) and sets the x-pt-local-date request header so server
 *    components always see the correct local date without a client round-trip.
 */
export async function proxy(request: NextRequest) {
  // --- Auth guard ---
  const idToken = request.cookies.get(ID_TOKEN_COOKIE)?.value;

  if (!idToken) {
    return redirectToSignIn(request);
  }

  let verified = false;
  try {
    await verifyIdToken(idToken);
    verified = true;
  } catch {
    const response = redirectToSignIn(request);
    response.cookies.delete(ID_TOKEN_COOKIE);
    return response;
  }

  if (!verified) return redirectToSignIn(request);

  // --- Local date injection ---
  const requestHeaders = new Headers(request.headers);
  const tzOffsetRaw = request.cookies.get("pt-tz-offset")?.value;

  if (tzOffsetRaw !== undefined) {
    const offset = parseInt(tzOffsetRaw, 10);
    if (!isNaN(offset)) {
      // getTimezoneOffset() = UTC − local (minutes).
      // localMs = UTC − offset × 60 000
      const localMs = Date.now() - offset * 60 * 1_000;
      const localDate = new Date(localMs).toISOString().slice(0, 10);
      requestHeaders.set("x-pt-local-date", localDate);
    }
  } else {
    const dateVal = request.cookies.get("pt-local-date")?.value;
    if (dateVal && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      requestHeaders.set("x-pt-local-date", dateVal);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

function redirectToSignIn(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/sign-in";
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
