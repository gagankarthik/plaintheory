import { NextResponse } from "next/server";

import { updateOnboarding } from "@/lib/db/user";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * Marks onboarding complete and stamps the disclaimer acceptance time.
 * Caller (the wizard) must have already PATCHed all required step data.
 */
export async function POST() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await updateOnboarding(session.userId, {
    step: "complete",
    disclaimerAcceptedAt: new Date().toISOString(),
  });
  return NextResponse.json({ onboarding: user.onboarding });
}
