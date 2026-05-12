import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getUser, updateOnboarding } from "@/lib/db/user";

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

  const current = await getUser(session.userId);
  if (!current) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  // Conditions (focus areas) are required for plan generation to work.
  if (!current.onboarding.conditions?.length) {
    return NextResponse.json(
      { error: "Select at least one focus area before completing onboarding" },
      { status: 400 },
    );
  }

  const user = await updateOnboarding(session.userId, {
    step: "complete",
    disclaimerAcceptedAt: new Date().toISOString(),
  });
  return NextResponse.json({ onboarding: user.onboarding });
}
