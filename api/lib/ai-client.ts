/**
 * AI client with automatic fallback: OpenAI (primary) → Gemini (fallback).
 * If one provider fails (quota, timeout, error), the other takes over silently.
 */

import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import type { z } from "zod";

// Primary: gpt-4o-mini | Fallback: gemini-2.0-flash
const PRIMARY_MODEL   = () => openai("gpt-4o-mini");
const FALLBACK_MODEL  = () => google("gemini-2.0-flash");

type Message = { role: "system" | "user" | "assistant"; content: string };
type GenerateObjectParams<T extends z.ZodType> = {
  schema: T;
  messages: Message[];
  temperature?: number;
};

/**
 * Gemini only allows system messages at position 0.
 * Merge any mid-conversation system messages into the preceding user message.
 */
function normalizeForGemini(messages: Message[]): Message[] {
  const out: Message[] = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === "system" && i > 0) {
      // Append to last user message, or create one
      const last = out[out.length - 1];
      if (last?.role === "user") {
        out[out.length - 1] = { ...last, content: last.content + "\n\n" + m.content };
      } else {
        out.push({ role: "user", content: m.content });
      }
    } else {
      out.push(m);
    }
  }
  return out;
}

// Errors that indicate the provider is unavailable (not a prompt/schema error)
function isProviderError(e: unknown): boolean {
  const msg = String((e as any)?.message ?? "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("overloaded") ||
    msg.includes("capacity") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("timeout") ||
    msg.includes("econnreset") ||
    msg.includes("network") ||
    (e as any)?.status === 429 ||
    (e as any)?.status === 503 ||
    (e as any)?.status === 502
  );
}

export async function generateObjectWithFallback<T extends z.ZodType>(
  params: GenerateObjectParams<T>
): Promise<{ object: z.infer<T>; provider: "openai" | "gemini" }> {
  // Try OpenAI first
  try {
    const result = await generateObject({
      model: PRIMARY_MODEL(),
      schema: params.schema,
      messages: params.messages,
      temperature: params.temperature,
    });
    return { object: result.object, provider: "openai" };
  } catch (e) {
    if (!isProviderError(e)) throw e; // Not a provider issue — rethrow
    console.warn("[ai-client] OpenAI unavailable, falling back to Gemini:", (e as any)?.message?.slice(0, 80));
  }

  // Fallback: Gemini — normalize messages first
  const result = await generateObject({
    model: FALLBACK_MODEL(),
    schema: params.schema,
    messages: normalizeForGemini(params.messages),
    temperature: params.temperature,
    mode: "json",
  });
  return { object: result.object, provider: "gemini" };
}
