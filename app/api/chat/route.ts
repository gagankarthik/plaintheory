import { NextResponse } from "next/server";

import { sendChatMessage } from "@/lib/ai/chat";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("content" in body) ||
    typeof (body as { content: unknown }).content !== "string"
  ) {
    return NextResponse.json({ error: "missing content" }, { status: 400 });
  }
  const { content, threadId, mode } = body as {
    content: string;
    threadId?: string;
    mode?: "coach" | "mood";
  };
  if (content.trim().length === 0) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "message too long" }, { status: 400 });
  }

  try {
    const localDate = await getLocalDate();
    const result = await sendChatMessage(session.userId, content, {
      ...(threadId ? { threadId } : {}),
      ...(mode ? { mode } : {}),
      date: localDate,
    });
    if (result.kind === "crisis") {
      return NextResponse.json({ kind: "crisis" });
    }
    if (result.kind === "rate-limited") {
      return NextResponse.json({ kind: "rate-limited", limit: result.limit }, { status: 429 });
    }
    return NextResponse.json({
      kind: "ok",
      threadId: result.threadId,
      messages: [result.user, result.assistant],
    });
  } catch (err) {
    console.error("[chat] failed:", err);
    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }
}
