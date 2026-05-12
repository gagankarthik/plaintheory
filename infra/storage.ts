/// <reference path="../.sst/platform/config.d.ts" />

const stage = $app.stage;

/**
 * Customer-managed KMS key. Encrypts DynamoDB at rest, S3 objects, and any
 * future Secrets Manager entries. Migrating away from a CMK later means
 * re-encrypting everything — that's why we provision it from day one.
 */
export const kmsKey = new aws.kms.Key("Key", {
  description: `PlainTheory data encryption (${stage})`,
  enableKeyRotation: true,
  deletionWindowInDays: 30,
});

export const kmsKeyAlias = new aws.kms.Alias("KeyAlias", {
  name: `alias/plaintheory-${stage}`,
  targetKeyId: kmsKey.id,
});

/**
 * DynamoDB single table. Full schema and access-pattern catalog live in
 * docs/data-model.md (filled in during Phase 3). The table itself is created
 * now so auth in Phase 2 has somewhere to write user profiles on signup.
 *
 * - PK / SK: primary composite key (string)
 * - GSI1PK / GSI1SK: secondary access patterns (time-range queries)
 * - ttl: TTL attribute for daily usage counters etc.
 * - Streams: enabled so we can derive audit events later if useful.
 */
export const table = new sst.aws.Dynamo("Table", {
  fields: {
    PK: "string",
    SK: "string",
    GSI1PK: "string",
    GSI1SK: "string",
  },
  primaryIndex: { hashKey: "PK", rangeKey: "SK" },
  globalIndexes: {
    GSI1: { hashKey: "GSI1PK", rangeKey: "GSI1SK" },
  },
  ttl: "ttl",
  stream: "new-and-old-images",
  transform: {
    table: {
      pointInTimeRecovery: { enabled: true },
      serverSideEncryption: {
        enabled: true,
        kmsKeyArn: kmsKey.arn,
      },
      deletionProtectionEnabled: stage === "production",
    },
  },
});

/**
 * User-uploaded content: profile photos, exported doctor PDFs, future voice
 * notes. Always private — every read is via presigned URL with short expiry.
 * Doctor PDFs are deleted after 30 days via lifecycle rule.
 */
export const bucket = new sst.aws.Bucket("UserContent", {
  transform: {
    bucket: {
      serverSideEncryptionConfiguration: {
        rule: {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: "aws:kms",
            kmsMasterKeyId: kmsKey.arn,
          },
          bucketKeyEnabled: true,
        },
      },
      lifecycleRules: [
        {
          id: "doctor-pdf-expiry",
          enabled: true,
          prefix: "doctor-pdfs/",
          expiration: { days: 30 },
        },
      ],
      versioning: {
        enabled: stage === "production",
      },
    },
  },
});
