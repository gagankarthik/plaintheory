/// <reference path="./.sst/platform/config.d.ts" />

/**
 * PlainTheory infrastructure.
 *
 * Vercel hosts the Next.js app; SST manages the AWS side only — Cognito (auth),
 * DynamoDB (data), S3 (user content), KMS (encryption), and future Lambdas
 * (PDF generation, weekly batch jobs).
 *
 * Stages: dev / staging / production. Region: us-east-2.
 *
 * Resource definitions live in `infra/`. After `sst deploy`, copy the outputs
 * into Vercel project env vars (see docs/deployment.md).
 */
export default $config({
  app(input) {
    return {
      name: "plaintheory",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
      providers: {
        aws: { region: "us-east-2" },
      },
    };
  },
  async run() {
    const storage = await import("./infra/storage");
    const auth = await import("./infra/auth");

    return {
      Region: "us-east-2",
      KmsKeyArn: storage.kmsKey.arn,
      KmsKeyAlias: storage.kmsKeyAlias.name,
      TableName: storage.table.name,
      BucketName: storage.bucket.name,
      UserPoolId: auth.userPool.id,
      UserPoolClientId: auth.userPoolClient.id,
      UserPoolDomain: auth.userPoolDomain.domain,
    };
  },
});
