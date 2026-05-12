import { randomUUID } from "node:crypto";

import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { ddb, getTableName } from "./client";
import { threadKey, threadMessageKey, threadMessagePrefix, userScopePK } from "./keys";

export type ChatThread = {
  userId: string;
  threadId: string;
  createdAt: string;
  title?: string;
  lastMessageAt?: string;
};

export type ChatMessage = {
  userId: string;
  threadId: string;
  timestamp: string;
  role: "user" | "assistant" | "system";
  content: string;
  /** Set when the safety pipeline rewrote, refused, or flagged a turn. */
  guardrails?: {
    triggered: string[];
    originalContent?: string;
  };
  model?: string;
  promptVersion?: string;
};

export async function createThread(
  input: Omit<ChatThread, "threadId" | "createdAt">,
): Promise<ChatThread> {
  const threadId = randomUUID();
  const thread: ChatThread = {
    ...input,
    threadId,
    createdAt: new Date().toISOString(),
  };
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: { ...threadKey(input.userId, threadId), ...thread },
    }),
  );
  return thread;
}

export async function listThreads(userId: string): Promise<ChatThread[]> {
  // SK begins_with `THREAD#` matches both thread metadata AND messages (since
  // messages are `THREAD#<id>#MSG#<ts>`). Filter to metadata items in code.
  // Acceptable until volume justifies a separate prefix; see docs/data-model.md.
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": userScopePK(userId),
        ":prefix": "THREAD#",
      },
    }),
  );
  return (res.Items ?? [])
    .filter((i) => !(i.SK as string).includes("#MSG#"))
    .map((i) => stripKeys<ChatThread>(i));
}

export async function appendMessage(
  input: Omit<ChatMessage, "timestamp"> & { timestamp?: string },
): Promise<ChatMessage> {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const message: ChatMessage = { ...input, timestamp };
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: { ...threadMessageKey(input.userId, input.threadId, timestamp), ...message },
    }),
  );
  return message;
}

export async function listMessages(userId: string, threadId: string): Promise<ChatMessage[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": userScopePK(userId),
        ":prefix": threadMessagePrefix(threadId),
      },
    }),
  );
  return (res.Items ?? []).map((i) => stripKeys<ChatMessage>(i));
}

function stripKeys<T>(item: Record<string, unknown>): T {
  const { PK: _pk, SK: _sk, ...rest } = item as { PK: string; SK: string } & T;
  return rest as T;
}
