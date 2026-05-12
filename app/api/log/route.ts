import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { appendSymptomLog, listSymptomLogs } from "@/lib/db/symptoms";

export const runtime = "nodejs";

const LogSchema = z.object({
  type: z.enum([
    "mood",
    "energy",
    "focus",
    "sleep",
    "eat",
    "relax",
    "water",
    "weight",
    "note",
  ]),
  severity: z.number().min(0).max(1000).optional(),
  notes: z.string().max(2000).optional(),
  context: z.string().max(500).optional(),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const logs = await listSymptomLogs(session.userId, { limit: 50 });
  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = LogSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const log = await appendSymptomLog({
    userId: session.userId,
    timestamp: new Date().toISOString(),
    symptomType: parsed.data.type,
    ...(parsed.data.localDate ? { localDate: parsed.data.localDate } : {}),
    ...(parsed.data.severity !== undefined ? { severity: parsed.data.severity } : {}),
    ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
    ...(parsed.data.context ? { context: parsed.data.context } : {}),
  });
  return NextResponse.json({ log });
}
