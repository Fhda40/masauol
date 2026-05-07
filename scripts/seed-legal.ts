/**
 * seed-legal.ts
 * يقرأ جميع ملفات JSON من data/legal/ ويحملها إلى قاعدة البيانات
 * الاستخدام: npx tsx scripts/seed-legal.ts
 * أو: npm run seed:legal
 */
import "dotenv/config";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getDb } from "../api/queries/connection";
import { legalChunks } from "../db/schema";
import { eq, and } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../data/legal");

interface LegalArticle {
  article: string;
  text: string;
  tags: string[];
}

interface LegalFile {
  law: string;
  category: string;
  chapter?: string;
  articles: LegalArticle[];
}

async function loadFile(filePath: string): Promise<LegalFile> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function seedCategory(category: string) {
  const dir = join(DATA_DIR, category);
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    console.log(`  ⏭  ${category} — لا يوجد ملفات`);
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const file of files) {
    const data = await loadFile(join(dir, file));
    for (const art of data.articles) {
      // Skip if already exists (idempotent)
      const existing = await getDb()
        .select({ id: legalChunks.id })
        .from(legalChunks)
        .where(
          and(
            eq(legalChunks.lawName, data.law),
            eq(legalChunks.articleNumber, art.article)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update text if changed
        await getDb()
          .update(legalChunks)
          .set({ articleText: art.text, tags: art.tags })
          .where(eq(legalChunks.id, existing[0].id));
        skipped++;
        continue;
      }

      await getDb().insert(legalChunks).values({
        lawName: data.law,
        category: data.category,
        chapter: data.chapter ?? "عام",
        articleNumber: art.article,
        articleText: art.text,
        tags: art.tags,
      });
      inserted++;
    }
    console.log(`  ✅ ${data.law} — ${data.articles.length} مادة (${inserted} جديد، ${skipped} محدّث)`);
  }
}

async function main() {
  const categories = [
    "enforcement", "labor", "criminal", "cybercrime",
    "commercial", "family", "civil", "drugs",
  ];

  console.log("🔄 بدء تحميل الأنظمة القانونية...\n");

  for (const cat of categories) {
    console.log(`📂 ${cat}`);
    await seedCategory(cat);
  }

  console.log("\n✅ اكتمل التحميل.");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ خطأ:", e);
  process.exit(1);
});
