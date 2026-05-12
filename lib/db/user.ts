import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import type { OnboardingState } from "@/lib/onboarding/state";

import { ddb, getTableName } from "./client";
import { stripeCustomerGsiKey, userKey } from "./keys";

export type SubscriptionPlan = "plusMonthly" | "plusYearly";

export type UserRecord = {
  userId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  onboarding: OnboardingState;
  deletedAt?: string;
  stripeCustomerId?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: string;
  GSI1PK?: string;
  GSI1SK?: string;
};

function toItem(user: UserRecord) {
  const base = { ...userKey(user.userId), ...user };
  if (user.stripeCustomerId) {
    return { ...base, ...stripeCustomerGsiKey(user.stripeCustomerId) };
  }
  return base;
}

function fromItem(item: Record<string, unknown>): UserRecord {
  const {
    PK: _pk,
    SK: _sk,
    GSI1PK: _gsi1pk,
    GSI1SK: _gsi1sk,
    ...rest
  } = item as Record<string, unknown>;
  return rest as UserRecord;
}

export async function getUser(userId: string): Promise<UserRecord | null> {
  const res = await ddb.send(new GetCommand({ TableName: getTableName(), Key: userKey(userId) }));
  if (!res.Item) return null;
  return fromItem(res.Item);
}

/**
 * Idempotently creates a user row on first sign-in. Returns the current
 * record (existing or freshly created). Never overwrites.
 */
export async function ensureUser(userId: string, email: string): Promise<UserRecord> {
  const existing = await getUser(userId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const user: UserRecord = {
    userId,
    email,
    createdAt: now,
    updatedAt: now,
    onboarding: { step: "about-you" },
  };
  await ddb.send(
    new PutCommand({
      TableName: getTableName(),
      Item: toItem(user),
      ConditionExpression: "attribute_not_exists(PK)",
    }),
  );
  return user;
}

export async function updateOnboarding(
  userId: string,
  patch: Partial<OnboardingState>,
): Promise<UserRecord> {
  const current = await getUser(userId);
  if (!current) {
    throw new Error("User record not found");
  }
  const updated: UserRecord = {
    ...current,
    onboarding: { ...current.onboarding, ...patch },
    updatedAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: getTableName(), Item: toItem(updated) }));
  return updated;
}

export async function setStripeCustomerId(
  userId: string,
  stripeCustomerId: string,
): Promise<UserRecord> {
  const current = await getUser(userId);
  if (!current) {
    throw new Error("User record not found");
  }
  const updated: UserRecord = {
    ...current,
    stripeCustomerId,
    updatedAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: getTableName(), Item: toItem(updated) }));
  return updated;
}

export async function findByStripeCustomerId(stripeCustomerId: string): Promise<UserRecord | null> {
  const { GSI1PK, GSI1SK } = stripeCustomerGsiKey(stripeCustomerId);
  const res = await ddb.send(
    new QueryCommand({
      TableName: getTableName(),
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk AND GSI1SK = :sk",
      ExpressionAttributeValues: { ":pk": GSI1PK, ":sk": GSI1SK },
      Limit: 1,
    }),
  );
  const item = res.Items?.[0];
  return item ? fromItem(item) : null;
}

export async function updateSubscription(
  userId: string,
  plan: SubscriptionPlan | undefined,
  status: string,
): Promise<UserRecord> {
  const current = await getUser(userId);
  if (!current) throw new Error("User record not found");
  const updated: UserRecord = {
    ...current,
    subscriptionPlan: plan,
    subscriptionStatus: status,
    updatedAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: getTableName(), Item: toItem(updated) }));
  return updated;
}

/** Returns true only for users with an active (non-canceled) paid subscription. */
export function isPlusUser(user: UserRecord): boolean {
  return user.subscriptionPlan != null && user.subscriptionStatus !== "canceled";
}

export async function markUserDeleted(userId: string): Promise<void> {
  const current = await getUser(userId);
  if (!current) return;
  const updated: UserRecord = {
    ...current,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: getTableName(), Item: toItem(updated) }));
}
