# Deployment

## Hosting split

- **Next.js app** → **Vercel** (production, preview branches, edge CDN)
- **AWS-side resources** → **SST v3 (Ion)** managed from this repo, deployed to **`us-east-2`**
  - Cognito user pool + client (auth)
  - KMS customer-managed key (encryption at rest)
  - DynamoDB single table (data)
  - S3 user-content bucket (profile photos, doctor PDFs)
  - Future Lambdas: PDF generation, weekly batch insights

SST runs in this repo (config at `sst.config.ts` per SST convention; resource definitions in `infra/`). Vercel only deploys the Next.js app — it does not see or run SST.

## First-time setup

### 1. AWS credentials

Configure an AWS profile with admin (or at least Cognito + DynamoDB + S3 + KMS + IAM + Secrets Manager) permissions for `us-east-2`:

```bash
aws configure --profile plaintheory
# AWS Access Key ID:     ********
# AWS Secret Access Key: ********
# Default region name:   us-east-2
# Default output format: json
```

Set `AWS_PROFILE=plaintheory` in your shell, or export the access keys directly.

### 2. Install SST platform files

SST generates `.sst/platform/` on first install. This is gitignored — every dev runs it once:

```bash
npm run sst:install
```

This downloads the Pulumi engine and generates type definitions for `sst.config.ts`.

### 3. Deploy the stack

```bash
# Dev stage (your personal sandbox)
npm run sst:deploy -- --stage dev

# Staging (preview environment, optional)
npm run sst:deploy -- --stage staging

# Production
npm run sst:deploy -- --stage production
```

`sst deploy` prints the outputs at the end. Copy them into the corresponding Vercel project env vars (Settings → Environment Variables):

| SST output         | Vercel env var                |
| ------------------ | ----------------------------- |
| `UserPoolId`       | `COGNITO_USER_POOL_ID`        |
| `UserPoolClientId` | `COGNITO_USER_POOL_CLIENT_ID` |
| `UserPoolDomain`   | `COGNITO_OAUTH_DOMAIN`        |
| `TableName`        | `DYNAMODB_TABLE_NAME`         |
| `BucketName`       | `S3_BUCKET_NAME`              |
| `KmsKeyArn`        | `KMS_KEY_ID`                  |

For each Vercel environment (Development / Preview / Production), point at the matching SST stage.

### 4. Generate `SESSION_COOKIE_SECRET`

```bash
openssl rand -base64 32
```

Add to `.env.local` and to Vercel env vars per environment. Rotate annually.

### 5. Create the Vercel-side IAM user (one-time)

SST creates AWS resources but does not provision an IAM user for the Vercel runtime — Vercel runs outside this AWS account. After first deploy, create an IAM user `plaintheory-web-<stage>` in the AWS console with the policy below (replace ARNs with deploy outputs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:ConditionCheckItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-2:<account-id>:table/<TableName>",
        "arn:aws:dynamodb:us-east-2:<account-id>:table/<TableName>/index/*"
      ]
    },
    {
      "Sid": "S3UserContent",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::<BucketName>/*"
    },
    {
      "Sid": "KmsUse",
      "Effect": "Allow",
      "Action": ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
      "Resource": "<KmsKeyArn>"
    },
    {
      "Sid": "CognitoAdmin",
      "Effect": "Allow",
      "Action": ["cognito-idp:AdminGetUser", "cognito-idp:ListUsers"],
      "Resource": "arn:aws:cognito-idp:us-east-2:<account-id>:userpool/<UserPoolId>"
    }
  ]
}
```

Generate an access key pair for the user and store as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` in Vercel env vars.

## Resource inventory (what SST creates)

All resources in **`us-east-2`**.

### KMS

- `Key` — customer-managed key, annual rotation, 30-day deletion window
- `KeyAlias` — `alias/plaintheory-<stage>`

### DynamoDB (`Table`)

- Single table, schema in [`data-model.md`](./data-model.md)
- Keys: `PK` / `SK` primary, `GSI1PK` / `GSI1SK` global index
- `ttl` attribute for daily usage counters
- Streams: `new-and-old-images`
- KMS SSE with the CMK above
- Point-in-time recovery: enabled
- Deletion protection: enabled in production

### S3 (`UserContent`)

- Block public access: enforced by SST defaults
- KMS SSE with the CMK above, bucket-key enabled
- Lifecycle: `doctor-pdfs/` prefix expires after 30 days
- Versioning: enabled in production

### Cognito (`UserPool` + `Web` client + `UserPoolDomain`)

- Username attribute: email (auto-verified)
- Password policy: 12+ chars, mixed case, number, symbol
- MFA: optional (user-controlled)
- Token validity: access 1h, id 1h, refresh 30d
- Auth flows: SRP + refresh + password
- Default Cognito email sender (50/day cap; upgrade to SES in Phase 9)
- Hosted-UI domain provisioned for OAuth federation only — the UI itself is custom-branded inside the app

### Not yet in the stack

- **OAuth identity providers (Google / Apple)** — added in Phase 2B once we have their credentials
- **Lambda triggers** (pre-signup age gate, post-confirmation profile write) — added in Phase 2B
- **Secrets Manager entries** — populated manually in the AWS console post-deploy; SST may pick them up in a future iteration

## Environments

- `dev` — local development; each dev runs their own SST stack named `dev` (or their initials)
- `staging` — preview environment; one shared stage
- `production` — main branch; protected, `removal: retain`, deletion protection on

## CI/CD

- GitHub Actions: lint + typecheck + format check on every PR (`.github/workflows/ci.yml`)
- Vercel: preview deploy per PR, prod deploy on `main` merge
- SST: manual `sst deploy --stage <stage>` for now. Wire to GitHub Actions in Phase 10 once we have stable IAM patterns.

## Local development

```bash
npm install
cp .env.example .env.local
# Populate .env.local from Vercel env vars (or SST outputs after sst:deploy)
npm run dev
```
