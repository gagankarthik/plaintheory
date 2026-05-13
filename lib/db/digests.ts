import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { ddb, getTableName } from "./client";
import { digestKey } from "./keys";

export type WeeklyDigest = {
  userId: string;
  /** ISO date (YYYY-MM-DD) for the Monday that begins the digest's week. */
  weekStart: string;
  generatedAt: string;
  model: string;
  /** One short paragraph: how the week felt as a whole. */
  summary: string;
  /** One paragraph: patterns that seemed to work for the user. */
  workingWell: string;
  /** One paragraph: a single concrete thing to try the coming week. */
  tryThis: string;
  /** Snapshot of the numbers the digest is based on. */
  stats: {
    checkInDays: number;
    moodAvg?: number;
    energyAvg?: number;
    focusAvg?: number;
    plansCompleted: number;
    waterTotal: number;
  };
};

export async function getDigest(
  userId: string,
  weekStart: string,
): Promise<WeeklyDigest | null> {
  const res = await ddb.send(
    new GetCommand({
      TableName: getTableName(),
      Key: digestKey(userId, weekStart),
    }),
  );
  if (!res.Item) return null;
  const { PK: _pk, SK: _sk, ...rest } = res.Item as { PK: string; SK: string } & WeeklyDigest;
  return rest as WeeklyDigest;
}

export async function saveDigest(digest: WeeklyDigest): Promise<WeeklyDigest> {
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: { ...digestKey(digest.userId, digest.weekStart), ...digest },
    }),
  );
  return digest;
}

/**
 * The Monday (UTC) of the current week, in YYYY-MM-DD. We key digests by week
 * so the same digest is served all week long once generated.
 */
export function getCurrentWeekStart(now = new Date()): string {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0 = Sunday … 6 = Saturday
  const offsetToMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - offsetToMonday);
  return d.toISOString().slice(0, 10);
}
