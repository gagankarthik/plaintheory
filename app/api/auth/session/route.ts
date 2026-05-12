import { NextResponse } from "next/server";

import { verifyIdToken } from "@/lib/auth/jwt";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { ensureUser } from "@/lib/db/user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("idToken" in body) ||
    typeof (body as { idToken: unknown }).idToken !== "string"
  ) {
    return NextResponse.json({ error: "missing idToken" }, { status: 400 });
  }

  const idToken = (body as { idToken: string }).idToken;

  let claims;
  try {
    claims = await verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  // First-time signers get a profile row provisioned here. Failures are logged
  // but don't block session creation — the next authenticated request will retry.
  try {
    await ensureUser(claims.sub, claims.email);
  } catch (err) {
    console.error("[auth/session] ensureUser failed:", err);
  }

  await setSessionCookie(idToken);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
