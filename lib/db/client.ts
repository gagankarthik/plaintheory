import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION ?? "us-east-2";

declare global {
  // Cached across HMR reloads in dev. Production builds initialize fresh.
  var __plaintheory_ddb: DynamoDBDocumentClient | undefined;
}

function build(): DynamoDBDocumentClient {
  const baseClient = new DynamoDBClient({ region });
  return DynamoDBDocumentClient.from(baseClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });
}

export const ddb = globalThis.__plaintheory_ddb ?? build();
if (process.env.NODE_ENV !== "production") {
  globalThis.__plaintheory_ddb = ddb;
}

export function getTableName(): string {
  const name = process.env.DYNAMODB_TABLE_NAME;
  if (!name) {
    throw new Error("Missing DYNAMODB_TABLE_NAME env var");
  }
  return name;
}
