import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { clearSessionCookie } from "@/lib/auth/session";
import { markUserDeleted } from "@/lib/db/user";

export const runtime = "nodejs";

/**
 * Soft-delete: marks the user record with deletedAt and signs them out.
 * A separate batch job (Phase 10+) will hard-delete after 30 days.
 */
export async function POST() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await markUserDeleted(session.userId);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
