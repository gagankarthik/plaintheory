/**
 * Centralized key builders for the single DynamoDB table. Every repository
 * goes through these — keeps key conventions invariant.
 *
 * Full schema and access-pattern catalog: docs/data-model.md
 */

export const PROFILE_SK = "PROFILE";
export const STRIPE_GSI1SK = "USER";

const userPK = (userId: string) => `USER#${userId}`;

export const userKey = (userId: string) => ({
  PK: userPK(userId),
  SK: PROFILE_SK,
});

export const symptomLogKey = (userId: string, timestamp: string, logId: string) => ({
  PK: userPK(userId),
  SK: `SYMPTOM#${timestamp}#${logId}`,
});

export const symptomLogPrefix = "SYMPTOM#";

export const habitKey = (userId: string, habitId: string) => ({
  PK: userPK(userId),
  SK: `HABIT#${habitId}`,
});

export const habitPrefix = "HABIT#";

export const habitCompletionKey = (userId: string, date: string, habitId: string) => ({
  PK: userPK(userId),
  SK: `HABITDONE#${date}#${habitId}`,
});

export const habitCompletionPrefix = "HABITDONE#";

export const planKey = (userId: string, date: string) => ({
  PK: userPK(userId),
  SK: `PLAN#${date}`,
});

export const planPrefix = "PLAN#";

export const threadKey = (userId: string, threadId: string) => ({
  PK: userPK(userId),
  SK: `THREAD#${threadId}`,
});

export const threadMessageKey = (userId: string, threadId: string, timestamp: string) => ({
  PK: userPK(userId),
  SK: `THREAD#${threadId}#MSG#${timestamp}`,
});

export const threadMessagePrefix = (threadId: string) => `THREAD#${threadId}#MSG#`;

export const auditKey = (userId: string, timestamp: string, entryId: string) => ({
  PK: userPK(userId),
  SK: `AUDIT#${timestamp}#${entryId}`,
});

export const auditPrefix = "AUDIT#";

export const usageKey = (userId: string, date: string) => ({
  PK: userPK(userId),
  SK: `USAGE#${date}`,
});

export const stripeCustomerGsiKey = (stripeCustomerId: string) => ({
  GSI1PK: `STRIPECUS#${stripeCustomerId}`,
  GSI1SK: STRIPE_GSI1SK,
});

/**
 * Tag attached to all user-owned items — lets us scope `Query(PK=USER#id)`
 * (data export, account deletion) without having to know every SK prefix.
 */
export const userScopePK = userPK;
