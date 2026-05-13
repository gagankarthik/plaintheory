import { getConditions } from "@/lib/conditions";
import { appendMessage, createThread, listMessages, type ChatMessage } from "@/lib/db/chat";
import { listSymptomLogs, type SymptomLog } from "@/lib/db/symptoms";
import { incrementDailyUsage, UsageLimitExceededError } from "@/lib/db/usage";
import { getUser, isPlusUser } from "@/lib/db/user";

import { openaiProvider } from "./openai";
import { looksEmergency } from "./crisis";
import {
  buildChatSystemPrompt,
  CHAT_PROMPT_VERSION,
  type ChatMode,
  type RecentMoodSnapshot,
} from "./prompts/chat.v1";

const FREE_TIER_DAILY_LIMIT = 5;
const MAX_HISTORY_TURNS = 20;
const MOOD_LOOKBACK_HOURS = 36;
const MOOD_SNAPSHOT_TYPES = new Set(["mood", "energy", "focus"]);

function average(nums: number[]): number | undefined {
  if (nums.length === 0) return undefined;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

async function getRecentMoodSnapshot(userId: string): Promise<RecentMoodSnapshot | undefined> {
  const now = Date.now();
  const fromIso = new Date(now - MOOD_LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
  let logs: SymptomLog[];
  try {
    logs = await listSymptomLogs(userId, { from: fromIso, limit: 50, newestFirst: true });
  } catch {
    return undefined;
  }
  const tracked = logs.filter((l) => MOOD_SNAPSHOT_TYPES.has(l.symptomType));
  if (tracked.length === 0) return undefined;

  const sev = (type: string) =>
    tracked.filter((l) => l.symptomType === type && typeof l.severity === "number").map((l) => l.severity as number);
  const moodAvg = average(sev("mood"));
  const energyAvg = average(sev("energy"));
  const focusAvg = average(sev("focus"));

  const newest = tracked[0];
  const lastLogHoursAgo = newest
    ? Math.max(0, Math.round((now - new Date(newest.timestamp).getTime()) / (1000 * 60 * 60)))
    : undefined;

  const recentNotes = tracked
    .map((l) => l.notes?.trim())
    .filter((n): n is string => Boolean(n))
    .slice(0, 3);

  if (
    moodAvg === undefined &&
    energyAvg === undefined &&
    focusAvg === undefined &&
    recentNotes.length === 0
  ) {
    return undefined;
  }

  return {
    ...(moodAvg !== undefined ? { moodAvg } : {}),
    ...(energyAvg !== undefined ? { energyAvg } : {}),
    ...(focusAvg !== undefined ? { focusAvg } : {}),
    ...(lastLogHoursAgo !== undefined ? { lastLogHoursAgo } : {}),
    ...(recentNotes.length ? { recentNotes } : {}),
  };
}

export type SendResult =
  | { kind: "ok"; threadId: string; user: ChatMessage; assistant: ChatMessage }
  | { kind: "crisis" }
  | { kind: "rate-limited"; limit: number };

export async function sendChatMessage(
  userId: string,
  content: string,
  options: { threadId?: string; mode?: ChatMode; date?: string } = {},
): Promise<SendResult> {
  if (looksEmergency(content)) {
    return { kind: "crisis" };
  }

  const date = options.date ?? new Date().toISOString().slice(0, 10);

  // Fetch user first so Plus subscribers bypass the rate limit.
  const user = await getUser(userId);
  if (!user) throw new Error("User not found");

  if (!isPlusUser(user)) {
    try {
      await incrementDailyUsage(userId, date, FREE_TIER_DAILY_LIMIT);
    } catch (err) {
      if (err instanceof UsageLimitExceededError) {
        return { kind: "rate-limited", limit: err.limit };
      }
      throw err;
    }
  }

  const conditions = getConditions(user.onboarding.conditions ?? []);
  const recentMood = await getRecentMoodSnapshot(userId);
  const system = buildChatSystemPrompt({
    focusAreas: conditions,
    goals: user.onboarding.goals ?? [],
    ...(user.onboarding.wakeTime ? { wakeTime: user.onboarding.wakeTime } : {}),
    ...(user.onboarding.sleepTime ? { sleepTime: user.onboarding.sleepTime } : {}),
    ...(user.onboarding.medications ? { dietaryNotes: user.onboarding.medications } : {}),
    ...(options.mode ? { mode: options.mode } : {}),
    ...(recentMood ? { recentMood } : {}),
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

  // Cap history at MAX_HISTORY_TURNS to keep token costs bounded.
  const history = options.threadId
    ? (await listMessages(userId, threadId)).slice(-MAX_HISTORY_TURNS)
    : [];

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
