import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { archiveHabit } from "@/lib/db/habits";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await archiveHabit(session.userId, id);
  return NextResponse.json({ ok: true });
}
