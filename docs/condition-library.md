# Condition Library

> Filled in during Phase 3 (Data layer & condition library). This file documents the structured knowledge files that ground all AI generation for each supported condition.

## Launch conditions (v1)

### Cluster A: hormonal / metabolic

- PCOS (Polycystic Ovary Syndrome)
- Insulin resistance
- Hormonal imbalance (general)

### Cluster B: cognition / mood / sleep

- Anxiety (non-clinical / clinical lifestyle support)
- Sleep issues (insomnia, fragmented sleep)
- ADHD-related focus challenges

### Cluster C: digestive / energy

- IBS (Irritable Bowel Syndrome)
- Food sensitivities (gluten, dairy, FODMAP)
- Chronic fatigue (general lifestyle support)

## File format (`lib/conditions/<slug>.ts`)

Each file exports a typed object:

```ts
export const pcos: Condition = {
  slug: "pcos",
  name: "PCOS",
  cluster: "hormonal-metabolic",
  description: "...",
  lifestyleInterventions: [...],     // evidence-informed
  commonSymptomPatterns: [...],
  redFlagSymptoms: [...],             // trigger "see your doctor"
  recommendedDailyHabits: [...],
  generallyHelpful: { foods: [...], activities: [...] },
  generallyHarmful: { foods: [...], activities: [...] },
  sources: [...],                     // Mayo Clinic, NIH, peer-reviewed
};
```

Full type definition and content for each condition: **TBD in Phase 3**.

## Sources

All medical content must cite Mayo Clinic, NIH/NIDDK/NIMH, NHS, or peer-reviewed sources. No content from blogs, supplement marketers, or non-clinical influencers.

## Excluded in v1

- **Pregnancy / fertility** — requires OB/GYN advisor input; defer to v2. PCOS users will ask; the safety classifier routes pregnancy questions to "consult your doctor."
- **Pediatric** — app is 18+ only.
- **Conditions outside the three clusters** — chat will gently redirect.

## Update protocol

Knowledge files are versioned via git. Any clinical content change requires:

1. Source citation added to `sources[]`
2. PR reviewed by someone with clinical literacy (or external advisor when available)
3. Date-stamped changelog entry
