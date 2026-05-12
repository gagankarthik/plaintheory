"use client";

import {
  confirmResetPassword as amplifyConfirmResetPassword,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
  resetPassword as amplifyResetPassword,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  fetchAuthSession,
} from "aws-amplify/auth";

export async function signUp(email: string, password: string) {
  return amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: { email },
    },
  });
}

export async function confirmSignUp(email: string, code: string) {
  return amplifyConfirmSignUp({ username: email, confirmationCode: code });
}

export async function resendSignUpCode(email: string) {
  return amplifyResendSignUpCode({ username: email });
}

export async function signIn(email: string, password: string) {
  // Amplify throws "There is already a signed in user" if its in-memory /
  // storage state still has a session (common after sign-up or a partial
  // sign-out). Silently clear first so the new sign-in always succeeds.
  try {
    await amplifySignOut();
  } catch {
    // No existing session — nothing to clear.
  }
  return amplifySignIn({ username: email, password });
}

export async function resetPassword(email: string) {
  return amplifyResetPassword({ username: email });
}

export async function confirmResetPassword(email: string, code: string, newPassword: string) {
  return amplifyConfirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });
}

async function getFreshIdToken(forceRefresh = false): Promise<string> {
  const session = await fetchAuthSession(forceRefresh ? { forceRefresh: true } : undefined);
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) {
    throw new Error("No ID token available — sign in first");
  }
  return idToken;
}

/**
 * Establish a server session by posting the current ID token to the API,
 * which sets an httpOnly cookie. Call after sign-in or token refresh.
 */
export async function syncServerSession(): Promise<void> {
  const idToken = await getFreshIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error(`Failed to establish server session (${res.status})`);
  }
}

/**
 * Force Amplify to refresh tokens, then re-sync the server cookie.
 * Call from the client when an API responds 401 due to expired ID token.
 */
export async function refreshServerSession(): Promise<void> {
  const idToken = await getFreshIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error(`Failed to refresh server session (${res.status})`);
  }
}

/**
 * Sign out on both Amplify (clears local storage / refresh tokens) and the
 * server (deletes the httpOnly cookie). Idempotent.
 */
export async function signOut(): Promise<void> {
  try {
    await amplifySignOut();
  } catch {
    /* ignore — clear server cookie regardless */
  }
  await fetch("/api/auth/session", { method: "DELETE" });
}
