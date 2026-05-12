import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { ddb, getTableName } from "./client";
import { usageKey } from "./keys";

export class UsageLimitExceededError extends Error {
  constructor(public limit: number) {
    super(`Usage limit of ${limit} exceeded for today`);
    this.name = "UsageLimitExceededError";
  }
}

/**
 * Atomic increment-with-limit-check for daily counters (chat messages on the
 * free tier, etc.). Throws UsageLimitExceededError when the user is over.
 * TTL is set 48h out so the row auto-clears across timezones.
 */
export async function incrementDailyUsage(
  userId: string,
  date: string,
  limit: number,
): Promise<number> {
  const ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 48;
  try {
    const res = await ddb.send(
      new UpdateCommand({
        TableName: getTableName(),
        Key: usageKey(userId, date),
        UpdateExpression: "ADD #c :one SET #ttl = if_not_exists(#ttl, :ttl)",
        ConditionExpression: "attribute_not_exists(#c) OR #c < :max",
        ExpressionAttributeNames: { "#c": "count", "#ttl": "ttl" },
        ExpressionAttributeValues: { ":one": 1, ":max": limit, ":ttl": ttl },
        ReturnValues: "ALL_NEW",
      }),
    );
    return (res.Attributes?.count as number | undefined) ?? 1;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new UsageLimitExceededError(limit);
    }
    throw err;
  }
}

export async function getDailyUsage(userId: string, date: string): Promise<number> {
  const res = await ddb.send(
    new GetCommand({
      TableName: getTableName(),
      Key: usageKey(userId, date),
    }),
  );
  return (res.Item?.count as number | undefined) ?? 0;
}
