# AI Safety

> Filled in across Phases 4 (daily plan) and 5 (chat). This file documents every guardrail, classifier, prompt, and post-processing rule that gates AI output to users.

## Positioning (non-negotiable)

PlainTheory is **not** medical advice. Every AI-generated user-facing string reflects this. Serious medical questions route to "consult your doctor or pharmacist."

## Guardrail layers

1. **Pre-flight classifier** — runs on every user-supplied input (chat message, journal entry)
   - Emergency keywords → crisis-resource modal, refuse normal chat
   - Prescription / dosage / diagnosis requests → "consult your doctor" reply
   - Out-of-condition-scope symptoms → gentle redirect
   - **Model:** configurable via `OPENAI_MODEL_CLASSIFIER` (default `gpt-4o-mini`)
   - **Prompt:** `lib/ai/prompts/classifier.preflight.v1.ts` (Phase 4/5)

2. **Grounded generation** — main reasoning model only sees:
   - User profile (conditions, goals, region)
   - Condition knowledge files (`lib/conditions/*.ts`)
   - Recent logs (anonymized to model)
   - Today's plan + system prompt
   - **No** freestyle medical generation outside the knowledge files

3. **Post-processor** — runs on every model output before user display
   - Detects + replaces specific dosage recommendations
   - Detects + replaces diagnostic language
   - Detects + replaces specific medication suggestions
   - **Implementation:** second-pass classifier (not regex); test set seeded with borderline cases
   - **Prompt:** `lib/ai/prompts/classifier.postprocess.v1.ts` (Phase 4/5)

4. **Audit log** — every generation logs prompt, model, response, guardrail triggers, timestamp, user id

## Crisis resources (region-aware, self-declared during onboarding)

- US: 988 Suicide & Crisis Lifeline
- UK: Samaritans 116 123
- Canada: 988 (Talk Suicide Canada)
- Australia: Lifeline 13 11 14
- India: iCall +91 9152987821

Full list + UI: **TBD in Phase 5**

## Out-of-scope topics (route to doctor, do not engage)

- Prescription / dosage advice
- Diagnostic questions ("do I have X?")
- Pregnancy / fertility (excluded from condition library v1; PCOS users will ask — explicit routing required)
- Pediatric questions (18+ only)
- Mental health crises (handled by emergency layer)

## Test set

Borderline-case prompts and expected guardrail behavior: **TBD in Phase 4/5**.
