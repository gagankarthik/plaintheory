import OpenAI from "openai";

import type { AiMessage, AiProvider, GenerateJsonOptions, GenerateOptions } from "./provider";

const DEFAULT_REASONING = "gpt-4o";
const DEFAULT_CLASSIFIER = "gpt-4o-mini";
const TIMEOUT_MS = 30_000;

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

export const openaiProvider: AiProvider = {
  async generateText(messages: AiMessage[], options: GenerateOptions = {}): Promise<string> {
    const res = await client().chat.completions.create(
      {
        model: options.model ?? process.env.OPENAI_MODEL_REASONING ?? DEFAULT_REASONING,
        messages,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 800,
      },
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    return res.choices[0]?.message?.content ?? "";
  },

  async generateJson<T>(messages: AiMessage[], options: GenerateJsonOptions): Promise<T> {
    const res = await client().chat.completions.create(
      {
        model: options.model ?? process.env.OPENAI_MODEL_REASONING ?? DEFAULT_REASONING,
        messages,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 1200,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: options.schemaName,
            strict: true,
            schema: options.jsonSchema,
          },
        },
      },
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    const raw = res.choices[0]?.message?.content;
    if (!raw) throw new Error("AI returned an empty response");
    return JSON.parse(raw) as T;
  },
};

export const CLASSIFIER_MODEL = process.env.OPENAI_MODEL_CLASSIFIER ?? DEFAULT_CLASSIFIER;
