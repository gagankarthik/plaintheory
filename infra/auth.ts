/// <reference path="../.sst/platform/config.d.ts" />

const stage = $app.stage;

/**
 * Cognito User Pool. Email + password is the v1 path; Google + Apple OAuth
 * federation gets wired in Phase 2B once their credentials are provisioned.
 *
 * Password policy mirrors NIST SP 800-63B Level 2: 12+ chars, mixed case,
 * number, symbol. MFA is optional (user-controlled in account settings).
 *
 * Email goes through Cognito's default sender at launch (50/day cap, fine for
 * early users). Switch to SES in Phase 9 hardening when volume warrants.
 */
export const userPool = new sst.aws.CognitoUserPool("UserPool", {
  usernames: ["email"],
  transform: {
    userPool: {
      name: `plaintheory-users-${stage}`,
      passwordPolicy: {
        minimumLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true,
        temporaryPasswordValidityDays: 7,
      },
      autoVerifiedAttributes: ["email"],
      accountRecoverySetting: {
        recoveryMechanisms: [{ name: "verified_email", priority: 1 }],
      },
      mfaConfiguration: "OPTIONAL",
      softwareTokenMfaConfiguration: { enabled: true },
      adminCreateUserConfig: { allowAdminCreateUserOnly: false },
      schemas: [
        {
          name: "email",
          attributeDataType: "String",
          required: true,
          mutable: true,
        },
      ],
      deletionProtection: stage === "production" ? "ACTIVE" : "INACTIVE",
    },
  },
});

/**
 * Public client (no secret) using PKCE for OAuth. The Next.js app on Vercel
 * uses this client. Server session lives in an httpOnly cookie; refresh
 * tokens rotate every 30 days.
 */
export const userPoolClient = userPool.addClient("Web", {
  transform: {
    client: {
      name: `plaintheory-web-${stage}`,
      generateSecret: false,
      preventUserExistenceErrors: "ENABLED",
      enableTokenRevocation: true,
      explicitAuthFlows: [
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_USER_PASSWORD_AUTH",
      ],
      accessTokenValidity: 1,
      idTokenValidity: 1,
      refreshTokenValidity: 30,
      tokenValidityUnits: {
        accessToken: "hours",
        idToken: "hours",
        refreshToken: "days",
      },
      readAttributes: ["email", "email_verified"],
      writeAttributes: ["email"],
      // OAuth callback / logout URLs populated when we wire Google + Apple
      // federation in Phase 2B. Hosted UI is NOT used — only the OAuth
      // endpoints behind the custom-branded UI.
    },
  },
});

/**
 * Cognito requires a hosted-UI domain for OAuth federation, even when we don't
 * use the hosted UI screens. We only need the domain for the /oauth2/authorize
 * and /oauth2/token endpoints during Google/Apple sign-in flows.
 */
export const userPoolDomain = new aws.cognito.UserPoolDomain("UserPoolDomain", {
  domain: `plaintheory-${stage}`,
  userPoolId: userPool.id,
});
