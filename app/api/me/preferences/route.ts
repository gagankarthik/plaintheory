import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { getUser, isPlusUser, updatePreferences } from "@/lib/db/user";

export const runtime = "nodejs";

const PreferencesSchema = z.object({
  calmMode: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = PreferencesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const user = await getUser(session.userId);
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Calm Mode is a Plus-only preference. Free users can hit the endpoint
  // but the change won't be persisted — surfaces the upgrade decision.
  if (parsed.data.calmMode !== undefined && !isPlusUser(user)) {
    return NextResponse.json(
      { error: "Calm Mode is a Plus feature.", upgrade: "/pricing" },
      { status: 402 },
    );
  }

  const updated = await updatePreferences(session.userId, parsed.data);
  return NextResponse.json({ preferences: updated.preferences ?? {} });
}
