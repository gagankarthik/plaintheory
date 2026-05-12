import { randomUUID } from "node:crypto";

import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { ddb, getTableName } from "./client";
import {
  habitCompletionKey,
  habitCompletionPrefix,
  habitKey,
  habitPrefix,
  userScopePK,
} from "./keys";

export type Habit = {
  userId: string;
  habitId: string;
  name: string;
  cue?: string;
  targetDaysOfWeek?: number[];
  createdAt: string;
  archivedAt?: string;
};

export type HabitCompletion = {
  userId: string;
  habitId: string;
  date: string;
  completedAt: string;
  notes?: string;
};

export async function createHabit(input: Omit<Habit, "habitId" | "createdAt">): Promise<Habit> {
  const habitId = randomUUID();
  const habit: Habit = { ...input, habitId, createdAt: new Date().toISOString() };
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: { ...habitKey(input.userId, habitId), ...habit },
    }),
  );
  return habit;
}

export async function listHabits(userId: string): Promise<Habit[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      FilterExpression: "attribute_not_exists(archivedAt)",
      ExpressionAttributeValues: {
        ":pk": userScopePK(userId),
        ":prefix": habitPrefix,
      },
    }),
  );
  return (res.Items ?? []).map((i) => stripKeys<Habit>(i));
}

export async function archiveHabit(userId: string, habitId: string): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: getTableName(),
      Key: habitKey(userId, habitId),
      UpdateExpression: "SET archivedAt = :now",
      ExpressionAttributeValues: { ":now": new Date().toISOString() },
    }),
  );
}

export async function markHabitComplete(input: HabitCompletion): Promise<HabitCompletion> {
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: { ...habitCompletionKey(input.userId, input.date, input.habitId), ...input },
    }),
  );
  return input;
}

export async function listHabitCompletions(
  userId: string,
  options: { from?: string; to?: string } = {},
): Promise<HabitCompletion[]> {
  const { from, to } = options;
  const exprValues: Record<string, string> = { ":pk": userScopePK(userId) };
  let keyExpr: string;
  if (from && to) {
    keyExpr = "PK = :pk AND SK BETWEEN :from AND :to";
    exprValues[":from"] = `${habitCompletionPrefix}${from}`;
    exprValues[":to"] = `${habitCompletionPrefix}${to}￿`;
  } else {
    keyExpr = "PK = :pk AND begins_with(SK, :prefix)";
    exprValues[":prefix"] = habitCompletionPrefix;
  }
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: keyExpr,
      ExpressionAttributeValues: exprValues,
    }),
  );
  return (res.Items ?? []).map((i) => stripKeys<HabitCompletion>(i));
}

function stripKeys<T>(item: Record<string, unknown>): T {
  const { PK: _pk, SK: _sk, ...rest } = item as { PK: string; SK: string } & T;
  return rest as T;
}
