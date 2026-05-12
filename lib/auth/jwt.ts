import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export type IdTokenClaims = JWTPayload & {
  sub: string;
  email: string;
  email_verified?: boolean | "true" | "false";
  token_use: "id";
  "cognito:username"?: string;
};

type Config = {
  userPoolId: string;
  clientId: string;
  region: string;
  issuer: string;
};

let cachedConfig: Config | null = null;
let cachedJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getConfig(): Config {
  if (cachedConfig) return cachedConfig;
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
  if (!userPoolId || !clientId) {
    throw new Error("Missing NEXT_PUBLIC_COGNITO_* env vars for JWT verification");
  }
  const region = userPoolId.split("_")[0];
  if (!region) {
    throw new Error(`Unexpected user pool ID format: ${userPoolId}`);
  }
  cachedConfig = {
    userPoolId,
    clientId,
    region,
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  };
  return cachedConfig;
}

function getJWKS() {
  if (cachedJWKS) return cachedJWKS;
  const config = getConfig();
  cachedJWKS = createRemoteJWKSet(new URL(`${config.issuer}/.well-known/jwks.json`));
  return cachedJWKS;
}

export async function verifyIdToken(token: string): Promise<IdTokenClaims> {
  const config = getConfig();
  const { payload } = await jwtVerify(token, getJWKS(), {
    issuer: config.issuer,
    audience: config.clientId,
  });

  if (payload.token_use !== "id") {
    throw new Error("Token is not an ID token");
  }
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("Token missing required claims (sub or email)");
  }

  return payload as IdTokenClaims;
}
