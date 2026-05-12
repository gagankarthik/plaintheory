import type { RegionId } from "@/lib/onboarding/options";

/**
 * Region-aware crisis resources. Shown when a user message triggers the
 * emergency keyword filter — generic, not framed as the product's job to
 * intervene. Always make space for "talk to a real human."
 */
export type CrisisResource = {
  name: string;
  contact: string;
  description: string;
};

const RESOURCES: Record<RegionId, CrisisResource[]> = {
  US: [
    {
      name: "988 Suicide & Crisis Lifeline",
      contact: "Call or text 988",
      description: "Free, confidential, 24/7.",
    },
    {
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "Free crisis support via text.",
    },
  ],
  UK: [
    { name: "Samaritans", contact: "Call 116 123", description: "Free, confidential, 24/7." },
    { name: "Shout", contact: "Text SHOUT to 85258", description: "Free 24/7 text support." },
  ],
  CA: [
    {
      name: "988 Suicide Crisis Helpline",
      contact: "Call or text 988",
      description: "Free, confidential, 24/7.",
    },
    { name: "Talk Suicide Canada", contact: "Call 1-833-456-4566", description: "24/7 support." },
  ],
  AU: [
    { name: "Lifeline", contact: "Call 13 11 14", description: "Free, confidential, 24/7." },
    { name: "Beyond Blue", contact: "Call 1300 22 4636", description: "24/7 support." },
  ],
  IN: [
    { name: "iCall", contact: "Call +91 9152987821", description: "Mon–Sat, 8am–10pm." },
    { name: "Vandrevala Foundation", contact: "Call 1860-2662-345", description: "24/7 helpline." },
  ],
};

const FALLBACK: CrisisResource[] = [
  {
    name: "International Association for Suicide Prevention",
    contact: "iasp.info/resources/Crisis_Centres",
    description: "Find a crisis line in your country.",
  },
];

export function getCrisisResources(region?: RegionId | null): CrisisResource[] {
  return (region && RESOURCES[region]) ?? FALLBACK;
}

/**
 * Cheap keyword screen — catches obvious emergencies before any model call.
 * False positives are acceptable (we just show resources); false negatives
 * are caught by the system prompt + post-processing.
 */
const EMERGENCY_PATTERNS = [
  /\b(suicid|self[\s-]?harm|kill\s+myself|end\s+my\s+life|overdose|od\b)/i,
  /\b(chest\s+pain|can'?t\s+breathe|stroke\b|heart\s+attack)/i,
  /\b(abuse|domestic\s+violence|hurt\s+by\s+(my|him|her|them))/i,
];

export function looksEmergency(text: string): boolean {
  return EMERGENCY_PATTERNS.some((re) => re.test(text));
}
