 Stripe Setup — PlainTheory

  1. Create a Stripe account

  Go to https://dashboard.stripe.com and create an account. Keep test mode on until you're ready to go live.

  ---
  2. Create your products and prices

  In the Stripe Dashboard → Product catalog → Add product.

  Plus Monthly

  - Name: Plus Monthly
  - Pricing model: Standard pricing
  - Price: $19.00 / month (recurring)
  - Copy the Price ID (starts with price_, NOT prod_)
  - Set in env: STRIPE_PRICE_PLUS_MONTHLY=price_xxxx

  Plus Yearly

  - Name: Plus Yearly
  - Price: $179.00 / year (recurring)
  - Copy the Price ID
  - Set in env: STRIPE_PRICE_PLUS_YEARLY=price_xxxx

  ▎ Critical: The app validates that price IDs start with price_. If you paste a product ID (prod_...) the checkout will return a 400 error.

  ---
  3. Get your API keys

  Dashboard → Developers → API keys

  STRIPE_SECRET_KEY=sk_test_...          # Never expose this
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Safe to expose

  Switch to sk_live_ / pk_live_ keys when going to production.

  ---
  4. Configure the Billing Portal

  Dashboard → Settings → Billing → Customer portal

  Enable the portal and configure:
  - Allow customers to cancel subscriptions ✓
  - Allow customers to update payment methods ✓
  - Show invoice history ✓

  The app redirects users here from the "Manage subscription" button and the payment-failed banner. The return URL is set to {NEXT_PUBLIC_APP_URL}/app/settings automatically in
  app/api/billing/portal/route.ts.

  ---
  5. Set up webhooks

  Webhooks are how Stripe tells your app about payment events. You need two webhook endpoints — one for local dev, one for production.

  Local dev (Stripe CLI)

  Install the CLI: https://stripe.com/docs/stripe-cli

  stripe login
  stripe listen --forward-to localhost:3030/api/billing/webhook

  The CLI prints a webhook signing secret like whsec_.... Copy it:

  STRIPE_WEBHOOK_SECRET=whsec_...

  Keep the stripe listen process running while developing.

  Production (Stripe Dashboard)

  Dashboard → Developers → Webhooks → Add endpoint

  - Endpoint URL: https://yourdomain.com/api/billing/webhook
  - API version: 2026-04-22.dahlia (must match lib/billing/stripe.ts)
  - Events to listen to — select these exactly:

  ┌───────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────┐
  │             Event             │                             What it does in PlainTheory                              │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ checkout.session.completed    │ Links the Stripe customer to the user record; syncs the new subscription to DynamoDB │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ customer.subscription.created │ Sets subscriptionPlan and subscriptionStatus in DynamoDB                             │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ customer.subscription.updated │ Updates plan/status on every billing cycle, upgrade, or cancellation                 │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ customer.subscription.deleted │ Clears subscriptionPlan, sets status to canceled                                     │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ invoice.paid                  │ Re-syncs subscription after a successful renewal — ensures status stays active       │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ invoice.payment_failed        │ Sets subscriptionStatus to past_due; triggers the in-app payment banner              │
  └───────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────┘

  After saving, click Reveal to copy the signing secret for this endpoint:

  STRIPE_WEBHOOK_SECRET=whsec_...   # Different from your local dev secret

  ▎ Use separate STRIPE_WEBHOOK_SECRET values per environment. Vercel's environment variable panel lets you set per-environment values.

  ---
  6. Complete .env.local

  # App URL — no trailing slash
  NEXT_PUBLIC_APP_URL=http://localhost:3030

  # Stripe
  STRIPE_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...          # From stripe listen output (local)

  # Price IDs (copy price_ IDs from each product's Pricing section)
  STRIPE_PRICE_PLUS_MONTHLY=price_...
  STRIPE_PRICE_PLUS_YEARLY=price_...
  STRIPE_PRICE_PREMIUM_MONTHLY=price_...   # Leave blank if not used yet

  ---
  7. End-to-end billing flow

  Understanding the full flow helps debug issues:

  User clicks "Upgrade"
    → POST /api/billing/checkout  (creates Stripe customer if needed, saves stripeCustomerId to DDB)
    → Redirects to Stripe Checkout
    → User pays
    → Stripe redirects to /app/settings?checkout=success
    → SyncOnSuccess client component fires
    → POST /api/billing/sync  (fetches active subscription, writes plan+status to DDB)
    → UI refreshes to show Plus plan

  Simultaneously (async, via webhook):
    → checkout.session.completed  → handleCheckoutCompleted → handleSubscription
    → customer.subscription.created → handleSubscription → writes plan+status to DDB

  Every billing cycle:
    → invoice.paid → retrieves subscription → handleSubscription → keeps DDB in sync

  Payment failure:
    → invoice.payment_failed → sets subscriptionStatus = "past_due" in DDB
    → PaymentFailedBanner appears on every app page
    → User clicks "Update card →" → /api/billing/portal → Stripe Billing Portal
    → User updates card → Stripe retries charge (Smart Retries)
    → invoice.paid fires → status goes back to "active" → banner disappears

  Cancellation:
    → User clicks "Cancel subscription" → confirmation dialog
    → POST /api/billing/cancel → stripe.subscriptions.update({ cancel_at_period_end: true })
    → DDB subscriptionStatus = "canceling"
    → At period end: customer.subscription.deleted fires
    → DDB subscriptionPlan = null, subscriptionStatus = "canceled"
    → isPlusUser() returns false → user sees Free plan

  ---
  8. Verify your setup

  Run through this checklist in test mode before going live:

  Checkout
  - Click "Upgrade to Plus · Monthly" on /app/settings
  - Stripe Checkout opens with the right price
  - Use card 4242 4242 4242 4242, any future date, any CVC
  - Redirects to /app/settings?checkout=success
  - Settings page shows "Plus · Monthly" badge immediately

  Webhook delivery
  - Check Stripe Dashboard → Developers → Webhooks → your endpoint → recent deliveries
  - checkout.session.completed shows 200
  - customer.subscription.created shows 200

  Payment failure
  - Use card 4000 0000 0000 0341 (always fails) during checkout to test invoice.payment_failed
  - Check DynamoDB — subscriptionStatus should be past_due
  - Banner appears on all /app/* pages

  Cancellation
  - Click "Cancel subscription" → confirm
  - Settings shows "Canceling at period end" badge
  - In Stripe Dashboard → Customers → find user → subscription shows cancel_at_period_end: true

  Billing portal
  - Click "Manage subscription" — Stripe portal opens
  - Returning from portal lands on /app/settings

  ---
  9. Going live checklist

  1. Create new products and prices in live mode (test prices don't carry over)
  2. Update env vars to sk_live_ / pk_live_ keys
  3. Add a new live webhook endpoint in the Dashboard and set its STRIPE_WEBHOOK_SECRET
  4. Update NEXT_PUBLIC_APP_URL to your production domain
  5. Confirm the Billing Portal is configured in live mode too (it's a separate setting)
  6. Set STRIPE_PRICE_PLUS_MONTHLY / STRIPE_PRICE_PLUS_YEARLY to the live price IDs
