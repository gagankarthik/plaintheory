import { NextResponse, type NextRequest } from "next/server";

import { verifyIdToken } from "@/lib/auth/jwt";
import { ID_TOKEN_COOKIE } from "@/lib/auth/session";

/**
 * Next.js 16 proxy (renamed from middleware) — runs on Node runtime, before
 * every matched request. Guards /app and /onboarding behind a valid Cognito
 * ID token in the httpOnly session cookie. Unauthenticated visitors get
 * redirected to /sign-in?from=<original-path>.
 *
 * The cookie value is verified against Cognito's JWKS via jose — no AWS API
 * calls per request, just signature verification with cached keys.
 */
export async function proxy(request: NextRequest) {
  const idToken = request.cookies.get(ID_TOKEN_COOKIE)?.value;

  if (!idToken) {
    return redirectToSignIn(request);
  }

  try {
    await verifyIdToken(idToken);
    return NextResponse.next();
  } catch {
    const response = redirectToSignIn(request);
    response.cookies.delete(ID_TOKEN_COOKIE);
    return response;
  }
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
