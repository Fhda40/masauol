import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { legalChunks } from "./schema";
import { generateEmbeddings } from "../api/lib/embeddings";
import { eq } from "drizzle-orm";

async function seedEmbeddings() {
  const db = getDb();

  const all = await db.select().from(legalChunks);
  const needEmbedding = all.filter(
    (c) => !c.embedding || (c.embedding as number[]).length === 0
  );

  if (needEmbedding.length === 0) {
    console.log(`✓ All ${all.length} chunks already have embeddings.`);
    return;
  }

  console.log(
    `Generating embeddings for ${needEmbedding.length} / ${all.length} chunks...`
  );

  const BATCH = 20;
  for (let i = 0; i < needEmbedding.length; i += BATCH) {
    const batch = needEmbedding.slice(i, i + BATCH);

    const texts = batch.map(
      (c) =>
        `${c.lawName} — ${c.articleNumber}\n${c.articleText}\nالكلمات المفتاحية: ${(c.tags as string[]).join("، ")}`
    );

    const embeddings = await generateEmbeddings(texts);

    for (let j = 0; j < batch.length; j++) {
      await db
        .update(legalChunks)
        .set({ embedding: embeddings[j] })
        .where(eq(legalChunks.id, batch[j].id));
    }

    console.log(
      `  Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} chunks embedded`
    );
  }

  console.log(`\n✓ Done! Embeddings generated for ${needEmbedding.length} chunks.`);
}

seedEmbeddings().catch(console.error);
