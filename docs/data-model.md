# Data Model

PlainTheory uses a single DynamoDB table. Schema-on-read keeps the table flexible; access patterns dictate key design.

- **Table:** `plaintheory-<stage>` (provisioned by SST in `infra/storage.ts`)
- **Region:** `us-east-2`
- **Billing:** PAY_PER_REQUEST
- **Encryption:** SSE with customer-managed KMS key `alias/plaintheory-<stage>`
- **Point-in-time recovery:** enabled
- **Streams:** `new-and-old-images` (reserved for future audit derivation)
- **TTL attribute:** `ttl` (Unix seconds) — used by usage counters

## Keys

| Attribute | Type   | Purpose                                       |
| --------- | ------ | --------------------------------------------- |
| `PK`      | string | Partition key — almost always `USER#<userId>` |
| `SK`      | string | Sort key — entity-typed prefix                |
| `GSI1PK`  | string | Sparse cross-user lookup partition            |
| `GSI1SK`  | string | Sparse cross-user lookup sort                 |

## Entity SK conventions

All user-owned data shares the same `PK = USER#<userId>` so a single Query can fetch everything for export or deletion. Per-entity `SK` prefixes:

| Entity              | SK pattern                             | Notes                                                                                            |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Profile             | `PROFILE`                              | One per user. Includes email, createdAt, onboarding state, notification prefs, stripeCustomerId. |
| Symptom log         | `SYMPTOM#<isoTimestamp>#<logId>`       | Time-series. ISO sorts lex correctly. Range queries by date.                                     |
| Habit               | `HABIT#<habitId>`                      | Habit definition (name, schedule, target).                                                       |
| Habit completion    | `HABITDONE#<YYYY-MM-DD>#<habitId>`     | One per habit per day.                                                                           |
| Daily plan          | `PLAN#<YYYY-MM-DD>`                    | One per user per day.                                                                            |
| Chat thread         | `THREAD#<threadId>`                    | Thread metadata.                                                                                 |
| Chat message        | `THREAD#<threadId>#MSG#<isoTimestamp>` | Messages stored under the thread prefix so we can Query a single thread.                         |
| Audit log           | `AUDIT#<isoTimestamp>#<entryId>`       | Append-only. Retention 1 year via TTL.                                                           |
| Daily usage counter | `USAGE#<YYYY-MM-DD>`                   | Chat rate-limit counter. TTL 48h.                                                                |
| Finance entry       | `FINANCE#<isoTimestamp>#<entryId>`     | Personal finance ledger row (expense/earning/savings). ISO sorts lex; newest-first via ScanIndexForward=false. |

## GSI1 access patterns (sparse)

| Use case                    | GSI1PK                         | GSI1SK |
| --------------------------- | ------------------------------ | ------ |
| Stripe customer → user      | `STRIPECUS#<stripeCustomerId>` | `USER` |
| (Future) admin email lookup | `EMAIL#<lowercased-email>`     | `USER` |

GSI1 is sparse — items only appear if they set `GSI1PK`/`GSI1SK`. The User profile is the only writer of GSI1 entries today.

## Access patterns catalog

The full list of every read/write the app does. Each maps to a single-table operation.

### User profile

| #   | Pattern                                | Operation                                                    |
| --- | -------------------------------------- | ------------------------------------------------------------ |
| 1   | Get user by id                         | `GetItem(PK=USER#id, SK=PROFILE)`                            |
| 2   | Create user (first sign-in)            | `PutItem` w/ `ConditionExpression: attribute_not_exists(PK)` |
| 3   | Update onboarding / preferences        | `PutItem` (get-merge-put)                                    |
| 4   | Find user by Stripe customer id        | `Query(GSI1, GSI1PK=STRIPECUS#id)`                           |
| 5   | Soft-delete user (mark `deletedAt`)    | `UpdateItem`                                                 |
| 6   | Hard-delete all user data (compliance) | `Query(PK=USER#id) → BatchWrite`                             |

### Symptom logs

| #   | Pattern                     | Operation                                                                     |
| --- | --------------------------- | ----------------------------------------------------------------------------- |
| 7   | Append symptom log          | `PutItem`                                                                     |
| 8   | List symptoms in date range | `Query(PK=USER#id, SK BETWEEN SYMPTOM#<from> AND SYMPTOM#<to>)`               |
| 9   | Get latest N symptoms       | `Query(PK=USER#id, SK begins_with SYMPTOM#, ScanIndexForward=false, Limit=N)` |

### Habits

| #   | Pattern                                   | Operation                                                           |
| --- | ----------------------------------------- | ------------------------------------------------------------------- |
| 10  | List user's habits                        | `Query(PK=USER#id, SK begins_with HABIT#)`                          |
| 11  | Create / update habit                     | `PutItem`                                                           |
| 12  | Mark habit complete                       | `PutItem(SK=HABITDONE#date#habitId)`                                |
| 13  | List completions in date range            | `Query(PK=USER#id, SK BETWEEN HABITDONE#<from> AND HABITDONE#<to>)` |
| 14  | Get streak (consecutive days for a habit) | derived from #13 client-side                                        |

### Finance entries

| #   | Pattern                          | Operation                                                                       |
| --- | -------------------------------- | ------------------------------------------------------------------------------- |
| 14a | Add finance entry                | `PutItem(SK=FINANCE#<isoTimestamp>#<entryId>)`                                   |
| 14b | List entries (newest first)      | `Query(PK=USER#id, SK begins_with FINANCE#, ScanIndexForward=false, Limit=N)`    |
| 14c | Delete an entry                  | `DeleteItem(SK=FINANCE#<createdAt>#<entryId>)` — createdAt passed alongside id   |
| 14d | Totals / by-category / by-bank   | derived from 14b client-side                                                     |

### Daily plans

| #   | Pattern                   | Operation                                                 |
| --- | ------------------------- | --------------------------------------------------------- |
| 15  | Get today's plan          | `GetItem(SK=PLAN#date)`                                   |
| 16  | Save generated plan       | `PutItem`                                                 |
| 17  | List plans for date range | `Query(PK=USER#id, SK BETWEEN PLAN#<from> AND PLAN#<to>)` |

### Chat

| #   | Pattern                   | Operation                                                                        |
| --- | ------------------------- | -------------------------------------------------------------------------------- |
| 18  | Create thread             | `PutItem(SK=THREAD#<id>)`                                                        |
| 19  | List user's threads       | `Query(PK=USER#id, SK begins_with THREAD#, then filter SK NOT contains "#MSG#")` |
| 20  | Append message            | `PutItem(SK=THREAD#<id>#MSG#<ts>)`                                               |
| 21  | List messages in a thread | `Query(PK=USER#id, SK begins_with THREAD#<id>#MSG#)`                             |

> Pattern 19's filter is annoying. Alternative: use a separate SK prefix `THREADMETA#` so the prefix `THREAD#` only matches messages. Deferred until chat volume justifies the refactor.

### Audit log

| #   | Pattern                 | Operation                                  |
| --- | ----------------------- | ------------------------------------------ |
| 22  | Append audit entry      | `PutItem(SK=AUDIT#<ts>#<id>)`              |
| 23  | List entries for a user | `Query(PK=USER#id, SK begins_with AUDIT#)` |

Retention: 365 days via TTL (`ttl = unixSecondsFromNow(365 days)`).

### Daily usage counter (free-tier rate limit)

| #   | Pattern                    | Operation                                                                             |
| --- | -------------------------- | ------------------------------------------------------------------------------------- |
| 24  | Increment with limit check | `UpdateCommand` w/ `ConditionExpression: attribute_not_exists(count) OR count < :max` |
| 25  | Read current count         | `GetItem`                                                                             |

TTL: 48 hours after creation.

## Zod validation boundary

- **Inbound HTTP requests** validate every body with a Zod schema before any DDB call.
- **Inbound DDB reads** use TypeScript types; no runtime parse on hot paths.
- **Outbound DDB writes** are typed; the Zod schema lives next to the API route that produces the data.

This keeps the trust boundary at the network edge, not the storage edge.

## Audit logging policy

Every **read or write of health-related data** writes an audit entry. Not audited:

- Auth session establishment / JWT verification
- Public marketing reads
- Static asset requests

Audit entry fields:

- `actorUserId` — who took the action (almost always the same as target in v1)
- `targetUserId` — whose data
- `action` — `"read" | "write" | "delete"`
- `resource` — short string identifying what was touched (`"user:profile"`, `"symptoms"`, `"plan:2026-05-11"`, etc.)
- `timestamp` — ISO
- `entryId` — opaque uuid
- `ipHash` — SHA-256 of source IP + a server-side pepper (never raw IP)
- `userAgent` — request UA, truncated to 200 chars

Audit writes are **fire-and-forget**: they don't block the user's response. Failures log to console; we revisit if we need stronger guarantees.

## Soft-delete and hard-delete

When a user requests account deletion:

1. Set `deletedAt` on the profile, write audit entry
2. After 30 days, a Lambda batch job runs:
   - Queries `PK=USER#<id>` for all items
   - Issues BatchWriteItem deletes in chunks of 25
   - Writes a final audit entry (preserved past user deletion for compliance)

Audit log entries retain `targetUserId` even after the user is gone. The `targetUserId` is treated as an opaque ID for compliance reads.

## Export

`GET /api/me/export` (Phase 10) issues a single `Query(PK=USER#<id>)` to fetch everything, formats as JSON, returns as download. No DynamoDB scan — all under one partition.

## Cost ceiling

PAY_PER_REQUEST at v1 traffic should be well under $10/month. Switch to provisioned capacity only if predictable, sustained QPS warrants it — typically not until thousands of DAU.
