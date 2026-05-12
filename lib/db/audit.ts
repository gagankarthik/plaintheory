import { createHash, randomUUID } from "node:crypto";

import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { ddb, getTableName } from "./client";
import { auditKey, auditPrefix, userScopePK } from "./keys";

export type AuditAction = "read" | "write" | "delete";

export type AuditInput = {
  actorUserId: string;
  targetUserId: string;
  action: AuditAction;
  resource: string;
  ip?: string | null;
  userAgent?: string | null;
};

export type AuditEntry = {
  entryId: string;
  timestamp: string;
  actorUserId: string;
  targetUserId: string;
  action: AuditAction;
  resource: string;
  ipHash?: string;
  userAgent?: string;
  ttl: number;
};

const AUDIT_RETENTION_SECONDS = 60 * 60 * 24 * 365; // one year

function hashIp(ip: string): string {
  const pepper = process.env.AUDIT_IP_PEPPER ?? "plaintheory-default-pepper";
  return createHash("sha256").update(`${pepper}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Fire-and-forget audit. Never throws — failures log to stderr but don't
 * block the caller. Bypass this only when you have a very good reason.
 */
export async function audit(input: AuditInput): Promise<void> {
  const now = new Date();
  const timestamp = now.toISOString();
  const entryId = randomUUID();

  const entry: AuditEntry = {
    entryId,
    timestamp,
    actorUserId: input.actorUserId,
    targetUserId: input.targetUserId,
    action: input.action,
    resource: input.resource,
    ttl: Math.floor(now.getTime() / 1000) + AUDIT_RETENTION_SECONDS,
    ...(input.ip ? { ipHash: hashIp(input.ip) } : {}),
    ...(input.userAgent ? { userAgent: input.userAgent.slice(0, 200) } : {}),
  };

  try {
    await ddb.send(
      new PutCommand({
        TableName: getTableName(),
        Item: {
          ...auditKey(input.targetUserId, timestamp, entryId),
          ...entry,
        },
      }),
    );
  } catch (err) {
    console.error("[audit] write failed:", err, {
      action: input.action,
      resource: input.resource,
    });
  }
}

export async function listAuditEntries(userId: string, limit = 100): Promise<AuditEntry[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": userScopePK(userId),
        ":prefix": auditPrefix,
      },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return (res.Items ?? []).map(stripKeys);
}

function stripKeys(item: Record<string, unknown>): AuditEntry {
  const { PK: _pk, SK: _sk, ...rest } = item as { PK: string; SK: string } & AuditEntry;
  return rest as AuditEntry;
}
