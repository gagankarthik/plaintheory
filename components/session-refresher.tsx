"use client";

import { useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

import { refreshServerSession } from "@/lib/auth/cognito-client";

// Refresh the server-side session cookie 5 minutes before the Cognito ID token expires.
const REFRESH_BUFFER_MS = 5 * 60 * 1_000;

/**
 * Invisible component mounted once in the app layout.
 * Amplify auto-refreshes the ID token using its stored refresh token;
 * this component re-syncs the server-side httpOnly cookie so the proxy
 * never sees an expired token and redirects the user mid-session.
 */
export function SessionRefresher() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    async function scheduleRefresh() {
      try {
        const session = await fetchAuthSession();
        const exp = session.tokens?.idToken?.payload.exp as number | undefined;
        if (!exp) return;

        const msUntilExpiry = exp * 1_000 - Date.now();
        const delay = Math.max(0, msUntilExpiry - REFRESH_BUFFER_MS);

        timer = setTimeout(async () => {
          try {
            await refreshServerSession();
            void scheduleRefresh();
          } catch {
            // Refresh token also expired — let the proxy redirect naturally on next navigation.
          }
        }, delay);
      } catch {
        // No Amplify session available (SSR hydration, not signed in, etc.) — skip.
      }
    }

    void scheduleRefresh();
    return () => clearTimeout(timer);
  }, []);

  return null;
}
