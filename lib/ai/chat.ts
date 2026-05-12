import { getConditions } from "@/lib/conditions";
import { appendMessage, createThread, listMessages, type ChatMessage } from "@/lib/db/chat";
import { incrementDailyUsage, UsageLimitExceededError } from "@/lib/db/usage";
import { getUser } from "@/lib/db/user";

import { openaiProvider } from "./openai";
import { looksEmergency } from "./crisis";
import { buildChatSystemPrompt, CHAT_PROMPT_VERSION } from "./prompts/chat.v1";

const FREE_TIER_DAILY_LIMIT = 5;

export type SendResult =
  | { kind: "ok"; threadId: string; user: ChatMessage; assistant: ChatMessage }
  | { kind: "crisis" }
  | { kind: "rate-limited"; limit: number };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function sendChatMessage(
  userId: string,
  content: string,
  options: { threadId?: string } = {},
): Promise<SendResult> {
  if (looksEmergency(content)) {
    return { kind: "crisis" };
  }

  try {
    await incrementDailyUsage(userId, todayKey(), FREE_TIER_DAILY_LIMIT);
  } catch (err) {
    if (err instanceof UsageLimitExceededError) {
      return { kind: "rate-limited", limit: err.limit };
    }
    throw err;
  }

  const user = await getUser(userId);
  if (!user) throw new Error("User not found");

  const conditions = getConditions(user.onboarding.conditions ?? []);
  const system = buildChatSystemPrompt({
    focusAreas: conditions,
    goals: user.onboarding.goals ?? [],
    ...(user.onboarding.wakeTime ? { wakeTime: user.onboarding.wakeTime } : {}),
    ...(user.onboarding.sleepTime ? { sleepTime: user.onboarding.sleepTime } : {}),
    ...(user.onboarding.medications ? { dietaryNotes: user.onboarding.medications } : {}),
  });

  let threadId = options.threadId;
  if (!threadId) {
    const thread = await createThread({ userId });
    threadId = thread.threadId;
  }

  const userMessage = await appendMessage({
    userId,
    threadId,
    role: "user",
    content,
  });

  const history = options.threadId ? await listMessages(userId, threadId) : [];
  const messages = [
    { role: "system" as const, content: system },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];
  if (!options.threadId) {
    messages.push({ role: "user", content });
  }

  const reply = await openaiProvider.generateText(messages, {
    temperature: 0.6,
    maxTokens: 600,
  });

  const assistantMessage = await appendMessage({
    userId,
    threadId,
    role: "assistant",
    content: reply,
    model: process.env.OPENAI_MODEL_REASONING ?? "gpt-4o",
    promptVersion: CHAT_PROMPT_VERSION,
  });

  return { kind: "ok", threadId, user: userMessage, assistant: assistantMessage };
}
