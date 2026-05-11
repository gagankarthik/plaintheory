Project Overview
Build PlainTheory, a production-grade SaaS web application that provides AI-powered daily planning and coaching for users managing one or more chronic (non-emergency) health conditions. The product is not medical advice — it is an evidence-informed lifestyle, habit, and pattern-tracking companion. Every AI-generated output must reflect this positioning, and serious medical questions must be routed to "consult your doctor."
The product must feel like an enterprise-grade health-tech product (think Calm, Headspace, Whoop, One Medical) — not a hackathon project. Visual polish, micro-interactions, performance, and accessibility are non-negotiable.
Tech Stack (fixed — do not substitute)
Frontend

Next.js 14+ with App Router, TypeScript strict mode
Tailwind CSS + shadcn/ui component library
Framer Motion for animations
TanStack Query for server state
Zustand for client state
React Hook Form + Zod for forms and validation
PWA-enabled with offline support for core read flows

Backend

Next.js API routes + tRPC for type-safe APIs
AWS Lambda for any long-running or scheduled jobs (via serverless framework or SST)
Node.js 20 LTS

Auth

AWS Cognito User Pools (email + Google + Apple OAuth)
Cognito Hosted UI is NOT acceptable — build a custom branded auth UI that uses Amplify Auth library or amazon-cognito-identity-js
MFA optional but available
Session management via secure httpOnly cookies + refresh token rotation

Data

AWS DynamoDB (single-table design preferred; multi-table acceptable if clearly justified)
All PII and health data must be encrypted at rest using AWS KMS customer-managed keys
Provide a clear data model schema in /docs/data-model.md

Storage

AWS S3 for user-generated content (profile photos, exported PDFs, voice notes if implemented)
S3 buckets must be private with presigned URL access only
Server-side encryption with KMS

AI

OpenAI API (use gpt-4o for main reasoning, gpt-4o-mini for cheaper classification/routing tasks)
Implement a clean abstraction layer at /lib/ai/ so the underlying model can be swapped (Anthropic Claude, etc.) without rewriting business logic
Streaming responses for the daily plan and chat features
Use function calling / structured outputs for all data-extraction tasks (symptom logging, plan generation)
All prompts live in /lib/ai/prompts/ as versioned files, not inline strings

Infra & DevEx

AWS deployment via SST (Serverless Stack) or AWS Amplify
CloudFront for CDN
Environment configs for dev / staging / prod
GitHub Actions CI: lint, typecheck, unit tests, e2e tests
Sentry for error monitoring, PostHog for product analytics (privacy-aware)
Stripe for billing (subscriptions, not events) — webhook handling robust

Core Features (build in this order)
1. Auth & Onboarding

Custom-branded sign-up / sign-in / forgot-password flows backed by Cognito
Multi-step onboarding wizard (5–7 screens):

Welcome + value prop
Select health conditions (multi-select from curated list — see Condition Library below)
Current medications (free text, optional)
Daily routine basics (wake/sleep time, work schedule)
Goals (multi-select: better sleep, fewer symptoms, stable energy, weight management, mood, fitness)
Notification preferences
Mandatory disclaimer acceptance — user must check a box: "I understand PlainTheory does not provide medical advice and does not replace consultation with a qualified healthcare professional."


Save state at every step so users can resume
Smooth animated transitions between steps

2. Condition Library (launch with these 3 condition clusters)

Cluster A: PCOS, insulin resistance, hormonal imbalance
Cluster B: Anxiety, sleep issues, ADHD-related focus challenges
Cluster C: IBS, food sensitivities, chronic fatigue

Each condition has a structured knowledge file at /lib/conditions/{condition_slug}.ts containing:

Evidence-informed lifestyle interventions
Common symptom patterns
Red-flag symptoms that trigger "see your doctor" routing
Recommended daily habits
Foods/activities generally helpful or harmful
Sources cited (Mayo Clinic, NIH, peer-reviewed where possible)

The AI must only generate guidance grounded in these knowledge files for the user's selected conditions. Do not let the model freestyle medical content.
3. Daily Plan Generation

Generated automatically each morning at the user's wake time (cron job via Lambda + EventBridge)
Structure (returned as structured JSON, then rendered):

Morning briefing (60–90 word warm summary)
3–5 focus actions for today (food, movement, hydration, medication reminder, stress regulation)
1 thing to watch for (pattern-based, e.g., "afternoon energy crash likely")
Evening reflection prompt (3 short questions)


All actions tied back to user's conditions and yesterday's check-in data
Streaming UI: text fades in as it's generated, like Claude.ai's interface

4. AI Chat (Companion)

Always-available chat tab — user can ask anything
System prompt includes user's conditions, recent symptoms, recent log data, today's plan
Hard guardrails (implemented as a pre-flight classifier using gpt-4o-mini):

Any message containing emergency indicators ("chest pain," "can't breathe," "thoughts of self-harm," "suicide," "overdose") → IMMEDIATELY display crisis resources (988, local emergency services) and refuse to continue normal chat
Any message asking for prescription changes, dosage advice, diagnosis → respond with "I can't help with that — please contact your doctor or pharmacist. I can help you prepare questions for them."
Any message about symptoms outside the user's logged conditions → gentle redirect + suggestion to discuss with their doctor


All chat is logged with timestamp, user ID (hashed for analytics), and full transcript stored encrypted in DynamoDB
Streaming responses

5. Symptom & Habit Logging

One-tap quick log buttons on home screen (mood, energy, headache, anxiety, GI symptoms — dynamic based on conditions)
Detailed log: severity 1-10, time, notes, what preceded it
All logs stored in DynamoDB with time-series indexing
Background pattern detection (weekly batch job): correlations between sleep, food, exercise, stress and symptoms

6. Weekly Insights

Sunday auto-generated 1-page summary
Charts: sleep average, symptom frequency, mood trend, habit completion rate
3 AI-generated insights based on actual data ("you slept better on days you walked after dinner")
3 suggested experiments for the coming week

7. Doctor Report Generator

Killer feature: user clicks "Prep for my appointment" → AI generates a 1-page PDF
Contains: 30-day symptom summary, medication log, patterns detected, top 5 questions to ask the doctor based on what's been logged
PDF generated via serverless function, stored in S3, delivered via presigned URL
Use @react-pdf/renderer or pdfkit

8. Billing

Free tier: 1 condition, basic morning plan, 5 chat messages/day, no PDF export
PlainTheory Plus ($19/mo or $179/yr): unlimited conditions, unlimited chat, weekly insights, doctor PDFs
PlainTheory Premium ($39/mo): everything in Plus + voice mode (future), Apple Health / Google Fit sync, family sharing
Stripe Checkout for upgrade flow
Stripe Customer Portal for cancellation / plan changes
Robust webhook handling: subscription created / updated / deleted / payment failed
Grace period of 7 days on payment failure before downgrading to free

UI / UX Requirements (this is where "enterprise level" lives)
Design system

Build a proper design system, not ad-hoc styles
Tokens for color, spacing, typography, radii, shadows in a single config file
Primary palette: soft, calming, health-tech (think sage green, warm cream, soft charcoal — not aggressive blues or purples). Define semantic colors (success, warning, danger, info)
Typography: a serif for headings (e.g., Fraunces or Sentinel), a clean geometric sans for body (e.g., Inter or General Sans)
Generous whitespace, never feels cramped
Smooth micro-interactions on every meaningful action (button press, log submission, plan reveal)

Components

All shadcn/ui components customized to the brand
Custom: AnimatedCheckmark, SymptomLogger, MoodRing, DailyPlanCard, ConditionPill, InsightCard, ChatBubble (with streaming text effect), OnboardingProgress
All interactive elements: hover state, focus state, active state, disabled state, loading state

Pages

Marketing landing page (separate route group) with hero, features, pricing, FAQ, testimonials (use placeholders), footer
App shell: left sidebar nav (Home, Plan, Chat, Insights, Log, Settings), top bar with user avatar
Responsive: works perfectly on 375px mobile up to 1920px desktop
Dark mode + light mode, persisted per user

Accessibility (non-negotiable)

WCAG 2.1 AA minimum
All interactive elements keyboard-navigable
Proper ARIA labels
Color contrast ratios checked
Reduced-motion support

Performance

Lighthouse score target: 90+ on Performance, 100 on Accessibility
Critical path under 1.5s on 4G
Image optimization via Next.js Image with proper srcset
Lazy load below-the-fold content
Edge caching where appropriate

Security & Compliance Requirements

HIPAA-aware design: even though we won't claim HIPAA compliance in v1, build with patterns that allow us to achieve it later
All health data encrypted at rest (KMS) and in transit (TLS 1.3)
No PII in logs, analytics events, or error reports — strip before sending to PostHog / Sentry
User can export all their data (JSON download)
User can delete their account → 30-day soft delete, then hard delete with audit log
Audit log table in DynamoDB: every read/write to user health data records actor, action, timestamp, IP (hashed)
Rate limiting on all API routes (especially AI endpoints) — use AWS WAF or simple Redis-backed limiter
CORS locked down
CSP headers configured
Secrets in AWS Secrets Manager, never in code
OWASP Top 10 reviewed
SQL/NoSQL injection prevention via parameterized queries and Zod validation on every input

Legal & Safety Restrictions (enforce at code level, not just policy)

Disclaimer banner visible on every page involving health content
Modal acceptance of medical disclaimer on signup, blocking until accepted
AI output filter: every LLM response passes through a post-processing layer that:

Detects and removes specific dosage recommendations
Detects and removes diagnostic language ("you have X")
Detects and removes specific medication suggestions
If any of these appear, replaces with "Please discuss with your doctor or pharmacist."


Emergency keyword classifier (gpt-4o-mini): pre-flight check on every user message. Triggers crisis-resource modal for self-harm/emergency indicators.
Logging: every AI generation logs the full prompt, model, response, and any guardrails triggered for later audit
Age gate: 18+ only on signup. Pregnancy is excluded from the condition library in v1 (defer until you have OB/GYN advisor).
Geographic gate: launch in US, UK, Canada, Australia, India initially. ToS and privacy policy must reflect this.
Region-aware crisis resources: US shows 988, UK shows Samaritans, India shows iCall, etc.

Repository Structure
plaintheory/
├── apps/
│   └── web/                 # Next.js app
├── packages/
│   ├── ui/                  # Shared component library
│   ├── ai/                  # OpenAI abstraction + prompts + guardrails
│   ├── db/                  # DynamoDB schemas + repositories
│   └── shared/              # Types, constants, utilities
├── infra/                   # SST or CDK infrastructure code
├── docs/
│   ├── data-model.md
│   ├── ai-safety.md
│   ├── deployment.md
│   └── condition-library.md
└── README.md
What I want you to do, step by step

Confirm the stack and scope — flag anything you'd push back on (over-engineering, missing pieces, simpler alternatives) before writing code
Generate the repo structure with proper monorepo config (Turborepo or pnpm workspaces)
Set up the design system first — tokens, typography, base components, before any feature work
Build auth + onboarding end-to-end before anything else
Build the daily plan generation flow as the first AI feature, since it's the core value loop
Then add chat, logging, insights, billing in that order
At every step, write tests (unit for utilities, integration for API routes, e2e for critical flows with Playwright)
Document everything: every prompt, every guardrail decision, every data model choice goes in /docs/

Style / approach

Type-safety end-to-end. No any. No unchecked API responses.
Server components by default; client components only where interactivity demands it
Optimistic UI for logging actions
Loading skeletons, never spinners
Error states that are friendly and actionable
Empty states designed thoughtfully — first-time users should see a welcoming guide, not a blank screen
Code comments only where the why is non-obvious; the what should be self-evident from naming

Out of scope for v1 (do not build, but design data model to allow later)

Voice mode
Native mobile apps
Apple Health / Google Fit sync
Provider portal (where actual clinicians review user data)
Wearable integrations
Multi-language


Begin by confirming what you understand, flagging concerns, and proposing a build plan with timeline estimates per phase. Do not write code until I approve the plan.