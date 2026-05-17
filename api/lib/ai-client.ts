/**
 * AI client with automatic fallback: OpenAI → Claude → Gemini.
 * If one provider fails (quota, timeout, auth error), the next takes over silently.
 */

import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import type { z } from "zod";

type Message = { role: "system" | "user" | "assistant"; content: string };
type GenerateObjectParams<T extends z.ZodType> = {
  schema: T;
  messages: Message[];
  temperature?: number;
};

function normalizeForGemini(messages: Message[]): Message[] {
  const out: Message[] = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === "system" && i > 0) {
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

function isProviderError(e: unknown): boolean {
  const msg = String((e as any)?.message ?? "").toLowerCase();
  const status = (e as any)?.status ?? (e as any)?.statusCode;
  return (
    msg.includes("429") || msg.includes("quota") || msg.includes("rate limit") ||
    msg.includes("overloaded") || msg.includes("capacity") ||
    msg.includes("503") || msg.includes("502") || msg.includes("timeout") ||
    msg.includes("econnreset") || msg.includes("network") ||
    msg.includes("401") || msg.includes("403") ||
    msg.includes("api key") || msg.includes("authentication") || msg.includes("unauthorized") ||
    msg.includes("leaked") || msg.includes("invalid") ||
    status === 429 || status === 503 || status === 502 || status === 401 || status === 403
  );
}

export async function generateObjectWithFallback<T extends z.ZodType>(
  params: GenerateObjectParams<T>
): Promise<{ object: z.infer<T>; provider: "openai" | "claude" | "gemini" }> {

  // 1. Try OpenAI
  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: params.schema,
      messages: params.messages,
      temperature: params.temperature,
    });
    return { object: result.object, provider: "openai" };
  } catch (e) {
    if (!isProviderError(e)) throw e;
    console.warn("[ai-client] OpenAI failed, trying Claude:", String((e as any)?.message ?? "").slice(0, 80));
  }

  // 2. Try Claude (requires ANTHROPIC_API_KEY in .env)
  try {
    const result = await generateObject({
      model: anthropic("claude-haiku-4-5"),
      schema: params.schema,
      messages: params.messages,
      temperature: params.temperature,
    });
    return { object: result.object, provider: "claude" };
  } catch (e) {
    if (!isProviderError(e)) throw e;
    console.warn("[ai-client] Claude failed, trying Gemini:", String((e as any)?.message ?? "").slice(0, 80));
  }

  // 3. Gemini fallback
  const result = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: params.schema,
    messages: normalizeForGemini(params.messages),
    temperature: params.temperature,
    mode: "json",
  });
  return { object: result.object, provider: "gemini" };
}
