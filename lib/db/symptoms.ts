import { randomUUID } from "node:crypto";

import { DeleteCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { ddb, getTableName } from "./client";
import { symptomLogKey, symptomLogPrefix, userScopePK } from "./keys";

export type SymptomLog = {
  userId: string;
  logId: string;
  timestamp: string;
  /** YYYY-MM-DD in the user's local timezone. Stored alongside the UTC timestamp
   *  so logs can be filtered by the user's local date regardless of UTC offset. */
  localDate?: string;
  symptomType: string;
  severity?: number;
  notes?: string;
  context?: string;
};

export async function appendSymptomLog(input: Omit<SymptomLog, "logId">): Promise<SymptomLog> {
  const logId = randomUUID();
  const log: SymptomLog = { ...input, logId };
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: { ...symptomLogKey(input.userId, input.timestamp, logId), ...log },
    }),
  );
  return log;
}

export async function listSymptomLogs(
  userId: string,
  options: { from?: string; to?: string; limit?: number; newestFirst?: boolean } = {},
): Promise<SymptomLog[]> {
  const { from, to, limit = 200, newestFirst = true } = options;

  const exprValues: Record<string, string> = { ":pk": userScopePK(userId) };
  let keyExpr: string;
  if (from && to) {
    keyExpr = "PK = :pk AND SK BETWEEN :from AND :to";
    exprValues[":from"] = `${symptomLogPrefix}${from}`;
    exprValues[":to"] = `${symptomLogPrefix}${to}￿`;
  } else {
    keyExpr = "PK = :pk AND begins_with(SK, :prefix)";
    exprValues[":prefix"] = symptomLogPrefix;
  }

  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: keyExpr,
      ExpressionAttributeValues: exprValues,
      ScanIndexForward: !newestFirst,
      Limit: limit,
    }),
  );
  return (res.Items ?? []).map(stripKeys);
}

function stripKeys(item: Record<string, unknown>): SymptomLog {
  const { PK: _pk, SK: _sk, ...rest } = item as { PK: string; SK: string } & SymptomLog;
  return rest as SymptomLog;
}

export async function deleteSymptomLog(
  userId: string,
  timestamp: string,
  logId: string,
): Promise<void> {
  await ddb.send(
    new DeleteCommand({
      TableName: getTableName(),
      Key: symptomLogKey(userId, timestamp, logId),
    }),
  );
}
