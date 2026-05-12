import { NextResponse } from "next/server";

import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { getCurrentUser } from "@/lib/auth/session";
import { ddb, getTableName } from "@/lib/db/client";
import { userScopePK } from "@/lib/db/keys";

export const runtime = "nodejs";

const INTERNAL_KEYS = new Set(["PK", "SK", "GSI1PK", "GSI1SK"]);

function stripInternalKeys(item: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(item).filter(([k]) => !INTERNAL_KEYS.has(k)),
  );
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const MAX_ITEMS = 10_000;
  const items: Array<Record<string, unknown>> = [];
  let lastKey: Record<string, unknown> | undefined;
  do {
    const res = await ddb.send(
      new QueryCommand({
        TableName: getTableName(),
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": userScopePK(session.userId) },
        ...(lastKey ? { ExclusiveStartKey: lastKey } : {}),
      }),
    );
    for (const item of res.Items ?? []) {
      items.push(stripInternalKeys(item));
    }
    lastKey = res.LastEvaluatedKey;
  } while (lastKey && items.length < MAX_ITEMS);

  return new NextResponse(JSON.stringify({ userId: session.userId, items }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="plaintheory-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
