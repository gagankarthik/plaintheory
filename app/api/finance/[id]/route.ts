import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { deleteFinanceEntry } from "@/lib/db/finance";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  // The full SK needs the createdAt timestamp — passed alongside the id.
  const createdAt = new URL(request.url).searchParams.get("createdAt");
  if (!createdAt) {
    return NextResponse.json({ error: "missing createdAt" }, { status: 400 });
  }
  await deleteFinanceEntry(session.userId, createdAt, id);
  return NextResponse.json({ ok: true });
}
