import { NextResponse } from "next/server";

import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { getCurrentUser } from "@/lib/auth/session";
import { ddb, getTableName } from "@/lib/db/client";
import { userScopePK } from "@/lib/db/keys";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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
    items.push(...(res.Items ?? []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return new NextResponse(JSON.stringify({ userId: session.userId, items }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="plaintheory-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
