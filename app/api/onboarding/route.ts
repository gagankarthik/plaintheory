import { NextResponse } from "next/server";

import { getUser, updateOnboarding } from "@/lib/db/user";
import { onboardingPatchSchema } from "@/lib/onboarding/schemas";
import type { OnboardingState } from "@/lib/onboarding/state";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await getUser(session.userId);
  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }
  return NextResponse.json({ onboarding: user.onboarding });
}

export async function PATCH(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = onboardingPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await updateOnboarding(session.userId, parsed.data as Partial<OnboardingState>);
  return NextResponse.json({ onboarding: user.onboarding });
}
