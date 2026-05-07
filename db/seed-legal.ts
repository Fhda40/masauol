import { getDb } from "../api/queries/connection";
import { legalChunks } from "./schema";
import enforcementKb from "../api/legal-systems/enforcement-chunks.json";
import cybercrimeKb from "../api/legal-systems/cybercrime-chunks.json";
import drugsKb from "../api/legal-systems/drugs-chunks.json";
import laborKb from "../api/legal-systems/labor-chunks.json";
import civilProcedureKb from "../api/legal-systems/civil-procedure-chunks.json";
import criminalProcedureKb from "../api/legal-systems/criminal-procedure-chunks.json";
import companiesKb from "../api/legal-systems/companies-chunks.json";
import personalStatusKb from "../api/legal-systems/personal-status-chunks.json";

const allKbs = [
  enforcementKb,
  cybercrimeKb,
  drugsKb,
  laborKb,
  civilProcedureKb,
  criminalProcedureKb,
  companiesKb,
  personalStatusKb,
];

async function seedLegalChunks() {
  const db = getDb();

  // Check if already seeded
  const existing = await db.select({ count: legalChunks.id }).from(legalChunks);
  if (existing.length > 0) {
    console.log(`Legal KB already seeded with ${existing.length} chunks. Skipping...`);
    return;
  }

  let totalChunks = 0;
  const allChunks: any[] = [];

  for (const kb of allKbs) {
    totalChunks += kb.chunks.length;
    for (const chunk of kb.chunks) {
      allChunks.push({
        lawName: chunk.law_name,
        chapter: chunk.chapter,
        articleNumber: chunk.article_number,
        articleText: chunk.article_text,
        tags: chunk.tags,
        category: chunk.category,
      });
    }
  }

  console.log(`Seeding ${totalChunks} legal chunks from ${allKbs.length} laws...`);

  // Insert in batches of 20
  for (let i = 0; i < allChunks.length; i += 20) {
    const batch = allChunks.slice(i, i + 20);
    await db.insert(legalChunks).values(batch);
    console.log(`  Inserted batch ${i / 20 + 1} (${batch.length} chunks)`);
  }

  console.log(`Done! Seeded ${allChunks.length} legal chunks.`);
}

seedLegalChunks().catch(console.error);
