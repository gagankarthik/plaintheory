/**
 * AI provider abstraction. Lets us swap OpenAI for Anthropic or others
 * without rewriting business logic. Every prompt lives in lib/ai/prompts/
 * as a versioned file — never inline strings.
 */

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GenerateOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type GenerateJsonOptions = GenerateOptions & {
  jsonSchema: Record<string, unknown>;
  schemaName: string;
};

export interface AiProvider {
  generateText(messages: AiMessage[], options?: GenerateOptions): Promise<string>;
  generateJson<T>(messages: AiMessage[], options: GenerateJsonOptions): Promise<T>;
}
