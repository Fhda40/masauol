/**
 * One-time script: embed all legal chunks using Gemini gemini-embedding-001
 * Handles rate limits (100 req/min free tier) with auto-retry.
 * Run: GEMINI_API_KEY=xxx npx tsx api/scripts/embed-legal.ts
 */

import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CHUNKS_PATH = path.resolve("api/legal-systems/extracted-temp/legal-rag-masaoul/output/chunks.json");
const CACHE_PATH = path.resolve("api/legal-systems/embeddings-cache.json");
const MODEL = "gemini-embedding-001";
const DELAY_MS = 800; // ~75 req/min — safe buffer under 100 limit

export interface EmbeddedChunk {
  id: string;
  law_name: string;
  domain: string;
  article_number: string;
  chapter: string;
  content: string;
  embedding: number[];
}

async function embedWithRetry(model: any, content: string, retries = 10): Promise<number[] | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await model.embedContent(content);
      return res.embedding.values;
    } catch (e: any) {
      const is429 = e.status === 429 || e?.message?.includes("429") || e?.message?.includes("quota");
      if (is429) {
        // Exponential backoff: 15s, 30s, 60s, 120s …
        const waitMs = Math.min(15_000 * Math.pow(2, attempt), 120_000);
        process.stdout.write(` [rate limit, waiting ${waitMs / 1000}s]`);
        await new Promise((r) => setTimeout(r, waitMs));
      } else {
        process.stderr.write(`\n[non-429 error] ${e.message}\n`);
        return null; // skip chunk on unexpected errors
      }
    }
  }
  process.stderr.write(`\n[skipped] max retries reached for a chunk\n`);
  return null; // skip rather than crash
}

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const raw = fs.readFileSync(CHUNKS_PATH, "utf-8");
  const chunks: any[] = JSON.parse(raw);

  let existing: EmbeddedChunk[] = [];
  if (fs.existsSync(CACHE_PATH)) {
    existing = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    console.log(`Resuming — ${existing.length} / ${chunks.length} already done`);
  }

  const existingIds = new Set(existing.map((c) => c.id));
  const pending = chunks.filter((c) => !existingIds.has(c.id));

  if (pending.length === 0) {
    console.log("All chunks already embedded.");
    return;
  }

  console.log(`Pending: ${pending.length} chunks (~${Math.ceil(pending.length * DELAY_MS / 60000)} min)`);

  const results: EmbeddedChunk[] = [...existing];

  let skipped = 0;
  for (let i = 0; i < pending.length; i++) {
    const chunk = pending[i];
    const embedding = await embedWithRetry(model, chunk.content);

    if (embedding !== null) {
      results.push({
        id: chunk.id,
        law_name: chunk.law_name,
        domain: chunk.domain,
        article_number: chunk.article_number,
        chapter: chunk.chapter ?? "",
        content: chunk.content,
        embedding,
      });
    } else {
      skipped++;
    }

    // Save every 20 chunks to minimize data loss on crash
    if ((i + 1) % 20 === 0 || i === pending.length - 1) {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(results));
    }

    process.stdout.write(`\r✓ ${results.length} / ${chunks.length}${skipped ? ` (تخطي: ${skipped})` : ""}`);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`\nDone — ${results.length} chunks → ${CACHE_PATH}${skipped ? ` (تخطي ${skipped})` : ""}`);
}

main().catch((e) => { console.error("\n", e.message); process.exit(1); });
