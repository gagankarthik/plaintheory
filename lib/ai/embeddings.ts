import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL_EMBED ?? "text-embedding-3-small";
const MAX_INPUT_CHARS = 8000;
const TIMEOUT_MS = 15_000;

let cached: OpenAI | null = null;

function client(): OpenAI {
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  cached = new OpenAI({ apiKey });
  return cached;
}

/**
 * Generates a single embedding vector for the given text. Returns an empty
 * array on any failure — callers fall back to "no memory" gracefully.
 */
export async function embed(text: string): Promise<number[]> {
  const input = text.trim().slice(0, MAX_INPUT_CHARS);
  if (!input) return [];
  try {
    const res = await client().embeddings.create(
      { model: MODEL, input },
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    return res.data[0]?.embedding ?? [];
  } catch (err) {
    console.warn("[embeddings] failed:", err);
    return [];
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export type MemoryHit = {
  content: string;
  threadId: string;
  timestamp: string;
  score: number;
};

/**
 * Picks the top-K most semantically similar items from a candidate pool.
 * Filters by minimum similarity so weak matches don't pollute the prompt.
 */
export function topKMemories(
  query: number[],
  candidates: Array<{ content: string; threadId: string; timestamp: string; embedding?: number[] }>,
  options: { k?: number; minScore?: number; excludeAfter?: string } = {},
): MemoryHit[] {
  const { k = 3, minScore = 0.45, excludeAfter } = options;
  if (query.length === 0) return [];
  const scored: MemoryHit[] = [];
  for (const c of candidates) {
    if (!c.embedding || c.embedding.length === 0) continue;
    // Skip messages from the current message onward (we don't want to retrieve
    // the message we're about to respond to).
    if (excludeAfter && c.timestamp >= excludeAfter) continue;
    const score = cosineSimilarity(query, c.embedding);
    if (score < minScore) continue;
    scored.push({ content: c.content, threadId: c.threadId, timestamp: c.timestamp, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
