import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { ddb, getTableName } from "./client";
import { planKey, planPrefix, userScopePK } from "./keys";

export type FocusAction = {
  id: string;
  category: "food" | "movement" | "hydration" | "medication" | "stress" | "sleep";
  text: string;
};

export type DailyRoutine = {
  title: string;
  time?: string;
  steps: string[];
};

export type DailyMeal = {
  /** Breakfast, Lunch, Dinner, Snack, etc. */
  name: string;
  /** Suggested time in HH:MM, or undefined if flexible. */
  time?: string;
  /** Concrete food items, e.g. "scrambled eggs", "spinach", "oat milk". */
  foods: string[];
  /** What these foods give the body, e.g. "protein for muscle", "B vitamins for energy". */
  nutrients: string[];
};

export type DailyPlan = {
  userId: string;
  date: string;
  generatedAt: string;
  model: string;
  promptVersion: string;
  morningBriefing: string;
  focusActions: FocusAction[];
  routines?: DailyRoutine[];
  meals?: DailyMeal[];
  watchFor: string;
  reflectionPrompts: string[];
  guardrailsTriggered?: string[];
  completedActionIds?: string[];
};

export async function setActionCompleted(
  userId: string,
  date: string,
  actionId: string,
  done: boolean,
): Promise<DailyPlan | null> {
  const plan = await getPlan(userId, date);
  if (!plan) return null;
  const current = new Set(plan.completedActionIds ?? []);
  if (done) current.add(actionId);
  else current.delete(actionId);
  const updated: DailyPlan = { ...plan, completedActionIds: Array.from(current) };
  await savePlan(updated);
  return updated;
}

export async function getPlan(userId: string, date: string): Promise<DailyPlan | null> {
  const res = await ddb.send(
    new GetCommand({
      TableName: getTableName(),
      Key: planKey(userId, date),
    }),
  );
  if (!res.Item) return null;
  return stripKeys(res.Item);
}

export async function savePlan(plan: DailyPlan): Promise<DailyPlan> {
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: { ...planKey(plan.userId, plan.date), ...plan },
    }),
  );
  return plan;
}

export async function listPlans(
  userId: string,
  options: { from?: string; to?: string; limit?: number } = {},
): Promise<DailyPlan[]> {
  const { from, to, limit = 30 } = options;
  const exprValues: Record<string, string> = { ":pk": userScopePK(userId) };
  let keyExpr: string;
  if (from && to) {
    keyExpr = "PK = :pk AND SK BETWEEN :from AND :to";
    exprValues[":from"] = `${planPrefix}${from}`;
    exprValues[":to"] = `${planPrefix}${to}￿`;
  } else {
    keyExpr = "PK = :pk AND begins_with(SK, :prefix)";
    exprValues[":prefix"] = planPrefix;
  }
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: keyExpr,
      ExpressionAttributeValues: exprValues,
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return (res.Items ?? []).map(stripKeys);
}

function stripKeys(item: Record<string, unknown>): DailyPlan {
  const { PK: _pk, SK: _sk, ...rest } = item as { PK: string; SK: string } & DailyPlan;
  return rest as DailyPlan;
}
