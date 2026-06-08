import { randomUUID } from "node:crypto";

import { DeleteCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { ddb, getTableName } from "./client";
import { financeKey, financePrefix, userScopePK } from "./keys";

export type FinanceKind = "expense" | "earning" | "savings";

export type FinanceEntry = {
  userId: string;
  entryId: string;
  kind: FinanceKind;
  /** Amount in major currency units (e.g. dollars), always positive. */
  amount: number;
  /** What was bought, the income source, or where the savings went. */
  reason: string;
  /** Bank / account the money moved through. */
  bank?: string;
  /** Free-form bucket — "Groceries", "Salary", "Rent", etc. */
  category?: string;
  /** Date the money actually moved, YYYY-MM-DD. */
  occurredOn: string;
  createdAt: string;
};

export async function createFinanceEntry(
  input: Omit<FinanceEntry, "entryId" | "createdAt">,
): Promise<FinanceEntry> {
  const entryId = randomUUID();
  const entry: FinanceEntry = { ...input, entryId, createdAt: new Date().toISOString() };
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: { ...financeKey(input.userId, entry.createdAt, entryId), ...entry },
    }),
  );
  return entry;
}

export async function listFinanceEntries(
  userId: string,
  options: { limit?: number } = {},
): Promise<FinanceEntry[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": userScopePK(userId),
        ":prefix": financePrefix,
      },
      // Newest first — SK embeds the createdAt timestamp.
      ScanIndexForward: false,
      ...(options.limit ? { Limit: options.limit } : {}),
    }),
  );
  return (res.Items ?? []).map((i) => stripKeys<FinanceEntry>(i));
}

export async function deleteFinanceEntry(
  userId: string,
  createdAt: string,
  entryId: string,
): Promise<void> {
  await ddb.send(
    new DeleteCommand({
      TableName: getTableName(),
      Key: financeKey(userId, createdAt, entryId),
    }),
  );
}

function stripKeys<T>(item: Record<string, unknown>): T {
  const { PK: _pk, SK: _sk, ...rest } = item as { PK: string; SK: string } & T;
  return rest as T;
}
