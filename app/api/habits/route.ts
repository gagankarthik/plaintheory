import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { createHabit, listHabits } from "@/lib/db/habits";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().min(1).max(80),
  cue: z.string().max(160).optional(),
  targetDaysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
});

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const habits = await listHabits(session.userId);
  return NextResponse.json({ habits });
}

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const habit = await createHabit({
    userId: session.userId,
    name: parsed.data.name,
    ...(parsed.data.cue ? { cue: parsed.data.cue } : {}),
    ...(parsed.data.targetDaysOfWeek
      ? { targetDaysOfWeek: parsed.data.targetDaysOfWeek }
      : {}),
  });
  return NextResponse.json({ habit });
}
