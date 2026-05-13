import { cookies } from "next/headers";

import { type IdTokenClaims, verifyIdToken } from "./jwt";

export const ID_TOKEN_COOKIE = "pt-id";

// Cognito ID token TTL is 1h; cookie max-age matches.
const ID_TOKEN_MAX_AGE = 60 * 60;
const isProd = process.env.NODE_ENV === "production";

export type SessionUser = {
  userId: string;
  email: string;
  emailVerified: boolean;
};

function userFromClaims(claims: IdTokenClaims): SessionUser {
  return {
    userId: claims.sub,
    email: claims.email,
    emailVerified: claims.email_verified === true || claims.email_verified === "true",
  };
}

export async function setSessionCookie(idToken: string): Promise<void> {
  const store = await cookies();
  store.set(ID_TOKEN_COOKIE, idToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ID_TOKEN_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ID_TOKEN_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const idToken = store.get(ID_TOKEN_COOKIE)?.value;
  if (!idToken) return null;
  try {
    const claims = await verifyIdToken(idToken);
    return userFromClaims(claims);
  } catch {
    return null;
  }
}

/**
 * Use in Server Components / Route Handlers that REQUIRE an authenticated user.
 * Throws — caller should rely on proxy.ts to have already redirected unauthed.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

/**
 * Where the "home" / brand-mark should point on public pages.
 * Logged-in visitors expect to return to their app home, not the marketing site.
 */
export async function getHomeHref(): Promise<"/app" | "/"> {
  const user = await getCurrentUser();
  return user ? "/app" : "/";
}
