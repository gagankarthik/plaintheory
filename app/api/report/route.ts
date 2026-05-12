import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { listPlans } from "@/lib/db/plans";
import { listSymptomLogs } from "@/lib/db/symptoms";
import { getUser } from "@/lib/db/user";

export const runtime = "nodejs";

function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(session.userId);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const from = isoNDaysAgo(30);
  const to = new Date().toISOString();
  const [plans, logs] = await Promise.all([
    listPlans(session.userId, { from, to: to.slice(0, 10), limit: 60 }),
    listSymptomLogs(session.userId, { from, to, limit: 500 }),
  ]);

  // Lazy import: @react-pdf/renderer pulls in a heavy native-ish dep.
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { buildReflectionPdf } = await import("@/lib/pdf/reflection");

  const buffer = await renderToBuffer(
    buildReflectionPdf({
      email: user.email,
      from,
      to: to.slice(0, 10),
      plansCount: plans.length,
      logs,
    }),
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="plaintheory-reflection-${to.slice(0, 10)}.pdf"`,
    },
  });
}
