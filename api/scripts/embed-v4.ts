/**
 * Embed v4 legal chunks using Gemini gemini-embedding-001
 * Source: api/legal-systems/v4-chunks.json (1934 chunks, 7 laws)
 * Output: api/legal-systems/embeddings-cache-v4.json
 * Run: GEMINI_API_KEY=xxx npx tsx api/scripts/embed-v4.ts
 */

import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CHUNKS_PATH = path.resolve("api/legal-systems/v4-chunks.json");
const CACHE_PATH  = path.resolve("api/legal-systems/embeddings-cache-v4.json");
const MODEL       = "gemini-embedding-001";
const DELAY_MS    = 680; // ~88 req/min — safe under 100 limit

interface V4Chunk {
  id: string;
  article_id: string;
  law_name: string;
  domain: string;
  chunk_type: "official_text" | "enriched";
  content: string;
}

export interface EmbeddedV4Chunk extends V4Chunk {
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
        const waitMs = Math.min(15_000 * Math.pow(2, attempt), 120_000);
        process.stdout.write(` [rate limit — wait ${waitMs / 1000}s]`);
        await new Promise((r) => setTimeout(r, waitMs));
      } else {
        process.stderr.write(`\n[error] ${e.message}\n`);
        return null;
      }
    }
  }
  process.stderr.write(`\n[skipped] max retries for chunk\n`);
  return null;
}

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const chunks: V4Chunk[] = JSON.parse(fs.readFileSync(CHUNKS_PATH, "utf-8"));

  let existing: EmbeddedV4Chunk[] = [];
  if (fs.existsSync(CACHE_PATH)) {
    existing = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    console.log(`Resuming — ${existing.length} / ${chunks.length} done`);
  }

  const existingIds = new Set(existing.map((c) => c.id));
  const pending = chunks.filter((c) => !existingIds.has(c.id));

  if (pending.length === 0) {
    console.log("✓ All chunks already embedded.");
    return;
  }

  console.log(`Pending: ${pending.length} chunks (~${Math.ceil(pending.length * DELAY_MS / 60000)} min)`);

  const results: EmbeddedV4Chunk[] = [...existing];
  let skipped = 0;

  for (let i = 0; i < pending.length; i++) {
    const chunk = pending[i];
    process.stdout.write(`[${existing.length + i + 1}/${chunks.length}] ${chunk.id.slice(0, 40)}`);

    const embedding = await embedWithRetry(model, chunk.content);

    if (embedding !== null) {
      results.push({ ...chunk, embedding });
      process.stdout.write(" ✓\n");
    } else {
      skipped++;
      process.stdout.write(" ✗ skipped\n");
    }

    // Save every 30 chunks
    if ((i + 1) % 30 === 0) {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(results));
      process.stdout.write(`  [saved ${results.length} chunks]\n`);
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(results));
  console.log(`\n✓ Done. Embedded: ${results.length}, Skipped: ${skipped}`);
}

main().catch(console.error);
