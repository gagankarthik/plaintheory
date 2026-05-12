import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate, isLocalDay } from "@/lib/date";
import { listSymptomLogs } from "@/lib/db/symptoms";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const paramDate = params.get("date");
  const today = paramDate && ISO.test(paramDate) ? paramDate : await getLocalDate();

  const tzRaw = params.get("tz");
  const tzOffset = tzRaw != null ? parseInt(tzRaw, 10) : null;
  const safeTz = tzOffset !== null && !isNaN(tzOffset) ? tzOffset : null;

  // Query a 3-day UTC window so no log is missed regardless of timezone.
  const dayBefore = new Date(new Date(today + "T00:00:00Z").getTime() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  const dayAfter = new Date(new Date(today + "T00:00:00Z").getTime() + 86_400_000)
    .toISOString()
    .slice(0, 10);

  const logs = await listSymptomLogs(session.userId, { from: dayBefore, to: dayAfter });

  const count = logs.filter(
    (l) => l.symptomType === "water" && isLocalDay(l, today, safeTz),
  ).length;

  return NextResponse.json(
    { count, date: today },
    { headers: { "Cache-Control": "no-store" } },
  );
}
