import { getDb } from "../api/queries/connection";
import { legalChunks } from "./schema";
import legalKb from "../api/legal-systems/legal-kb.json";

async function seedLegalChunks() {
  const db = getDb();

  // Check if already seeded
  const existing = await db.select({ count: legalChunks.id }).from(legalChunks);
  if (existing.length > 0) {
    console.log(`Legal KB already seeded with ${existing.length} chunks. Skipping...`);
    return;
  }

  console.log(`Seeding ${legalKb.chunks.length} legal chunks...`);

  const chunks = legalKb.chunks.map((chunk: any) => ({
    lawName: chunk.law_name,
    chapter: chunk.chapter,
    articleNumber: chunk.article_number,
    articleText: chunk.article_text,
    tags: chunk.tags,
    category: chunk.category,
  }));

  // Insert in batches of 20
  for (let i = 0; i < chunks.length; i += 20) {
    const batch = chunks.slice(i, i + 20);
    await db.insert(legalChunks).values(batch);
    console.log(`  Inserted batch ${i / 20 + 1} (${batch.length} chunks)`);
  }

  console.log(`Done! Seeded ${chunks.length} legal chunks.`);
}

seedLegalChunks().catch(console.error);
