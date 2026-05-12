"use client";

import { Amplify, type ResourcesConfig } from "aws-amplify";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;

if (userPoolId && userPoolClientId) {
  const config: ResourcesConfig = {
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        signUpVerificationMethod: "code",
        loginWith: { email: true },
        passwordFormat: {
          minLength: 12,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true,
        },
      },
    },
  };
  // Don't pass `{ ssr: true }` — that makes Amplify write 4+ token cookies
  // which bloats headers past the 8KB limit (HTTP 431). We manage our own
  // httpOnly `pt-id` cookie via jose; Amplify keeps tokens in localStorage.
  Amplify.configure(config);
} else if (typeof window !== "undefined") {
  console.error(
    "[plaintheory] Missing NEXT_PUBLIC_COGNITO_USER_POOL_ID or NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID — auth is disabled",
  );
}

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
