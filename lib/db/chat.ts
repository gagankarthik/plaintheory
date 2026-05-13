import { randomUUID } from "node:crypto";

import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

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
  /** Embedding of `content` — used by the Plus-only semantic memory layer. */
  embedding?: number[];
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

/**
 * Sets an embedding on an existing message in-place. Used by the Plus-only
 * semantic memory layer — embeddings are written async after the message is
 * appended so they never block the chat reply.
 */
export async function setMessageEmbedding(
  userId: string,
  threadId: string,
  timestamp: string,
  embedding: number[],
): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: getTableName(),
      Key: threadMessageKey(userId, threadId, timestamp),
      UpdateExpression: "SET #e = :e",
      ExpressionAttributeNames: { "#e": "embedding" },
      ExpressionAttributeValues: { ":e": embedding },
    }),
  );
}

/**
 * Returns recent user-role messages across all of the user's threads, newest
 * first. Used as the candidate pool for semantic-memory retrieval.
 */
export async function listRecentUserMessages(
  userId: string,
  limit = 200,
): Promise<ChatMessage[]> {
  // Pull a window of items under the THREAD# prefix (mixed thread metadata +
  // messages). Filter to user-role messages in code.
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": userScopePK(userId),
        ":prefix": "THREAD#",
      },
      ScanIndexForward: false,
      Limit: Math.min(1000, limit * 4),
    }),
  );
  const items = (res.Items ?? [])
    .filter((i) => (i.SK as string).includes("#MSG#"))
    .map((i) => stripKeys<ChatMessage>(i))
    .filter((m) => m.role === "user");
  return items.slice(0, limit);
}
