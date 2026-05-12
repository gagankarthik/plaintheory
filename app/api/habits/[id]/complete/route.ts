import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { markHabitComplete } from "@/lib/db/habits";

export const runtime = "nodejs";

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const { id } = await ctx.params;
  const completion = await markHabitComplete({
    userId: session.userId,
    habitId: id,
    date: parsed.data.date,
    completedAt: new Date().toISOString(),
    ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
  });
  return NextResponse.json({ completion });
}
