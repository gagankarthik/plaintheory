import { NextResponse } from "next/server";

import { generateWeeklyDigest } from "@/lib/ai/digest";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentWeekStart, getDigest, saveDigest } from "@/lib/db/digests";
import { getUser, isPlusUser } from "@/lib/db/user";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(session.userId);
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (!isPlusUser(user)) {
    return NextResponse.json(
      { error: "Weekly digest is a Plus feature.", upgrade: "/pricing" },
      { status: 402 },
    );
  }

  const weekStart = getCurrentWeekStart();
  const existing = await getDigest(session.userId, weekStart);
  if (existing) {
    return NextResponse.json(
      { digest: existing, cached: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const digest = await generateWeeklyDigest(session.userId, weekStart);
    await saveDigest(digest);
    return NextResponse.json(
      { digest, cached: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[digest] generation failed:", err);
    return NextResponse.json({ error: "Digest generation failed" }, { status: 500 });
  }
}

export async function POST() {
  // Force a regeneration for the current week.
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(session.userId);
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (!isPlusUser(user)) {
    return NextResponse.json(
      { error: "Weekly digest is a Plus feature.", upgrade: "/pricing" },
      { status: 402 },
    );
  }

  try {
    const digest = await generateWeeklyDigest(session.userId);
    await saveDigest(digest);
    return NextResponse.json({ digest });
  } catch (err) {
    console.error("[digest] generation failed:", err);
    return NextResponse.json({ error: "Digest generation failed" }, { status: 500 });
  }
}
