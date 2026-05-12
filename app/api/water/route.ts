import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { listSymptomLogs } from "@/lib/db/symptoms";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const paramDate = request.nextUrl.searchParams.get("date");
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const today = paramDate && ISO.test(paramDate) ? paramDate : await getLocalDate();

  const logs = await listSymptomLogs(session.userId, { limit: 200 });
  const count = logs.filter(
    (l) =>
      l.symptomType === "water" &&
      (l.localDate ? l.localDate === today : l.timestamp.startsWith(today)),
  ).length;

  return NextResponse.json({ count, date: today });
}
