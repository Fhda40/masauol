import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { legalChunks } from "@db/schema";
import { eq, and } from "drizzle-orm";

// Category to keywords mapping for retrieval
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  enforcement: [
    "دين", "ديون", "تنفيذ", "حجز", "منع سفر", "حبس", "شيك", "كمبيالة",
    "سند", "صحيفة تنفيذ", "مزاد", "راتب", "تقادم", "نفقة", "وديعة",
    "إكراه", "إنذار", "حجز راتب", "حجز حساب", "حجز عقار",
  ],
  cybercrime: [
    "ابتزاز", "احتيال", "تهديد", "تشهير", "اختراق", "قرصنة", "تنصت",
    "جرائم إلكترونية", "معلوماتية", "إلكتروني", "واتساب", "تويتر",
    "سناب", "إنستقرام", "موقع", "تصوير", "سرقة بيانات", "هوية",
    "بنك", "حساب", "رسائل", "محتوى", "إباحي", "قمار",
  ],
  drugs: [
    "مخدرات", "مؤثرات عقلية", "حشيش", "حبوب", "كبتاجون", "هيروين",
    "كوكايين", "حيازة", "اتجار", "تعاطي", "ترويج", "زراعة",
    "تصنيع", "استيراد", "تصدير", "نقل", "بيع", "شراء",
    "علاج", "إدمان", "مدمن", "تأهيل", "طبيب شرعي",
  ],
  labor: [
    "عمل", "وظيفة", "موظف", "راتب", "فصل", "فصل تعسفي", "نهاية خدمة",
    "مستحقات", "تعويض", "إجازة", "عمل إضافي", "إصابة عمل",
    "عقد عمل", "فترة تجربة", "إشعار", "استقالة", "نزاع عمالي",
    "هيئة تسوية", "محكمة عمالية", "تأمينات", "نفقة", "حضانة",
  ],
};

/**
 * Match a user query against category keywords to find the most relevant legal category.
 */
function matchCategory(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  let bestCategory: string | null = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lowerQuery.includes(kw)).length;
    if (score > bestScore && score >= 1) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // If no category matched with keywords, use a minimum threshold
  return bestScore >= 1 ? bestCategory : null;
}

/**
 * Score relevance of a chunk against a query.
 */
function scoreChunk(query: string, chunk: { articleText: string; tags: string[] | null }): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = chunk.articleText.toLowerCase();
  const tags = (chunk.tags as string[]) || [];
  const lowerTags = tags.map((t) => t.toLowerCase());

  let score = 0;

  // Tag matching (highest weight)
  for (const tag of lowerTags) {
    if (lowerQuery.includes(tag)) score += 5;
  }

  // Text keyword matching
  const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
  for (const word of queryWords) {
    if (lowerText.includes(word)) score += 2;
  }

  // Exact phrase match
  if (lowerText.includes(lowerQuery)) score += 10;

  return score;
}

export const legalRouter = createRouter({
  /**
   * Search legal chunks by category + relevance scoring
   */
  search: publicQuery
    .input(
      z.object({
        query: z.string(),
        category: z.string().optional(),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input }) => {
      // Detect category from query if not provided
      const detectedCategory = input.category || matchCategory(input.query);

      if (!detectedCategory) {
        // Fallback: search across all categories using text matching
        const allChunks = await getDb()
          .select()
          .from(legalChunks)
          .limit(50);

        const scored = allChunks
          .map((chunk) => ({
            ...chunk,
            _score: scoreChunk(input.query, chunk),
          }))
          .filter((c) => c._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, input.limit);

        return {
          category: null,
          chunks: scored.map(({ _score, ...chunk }) => chunk),
        };
      }

      // Get chunks for the matched category
      const categoryChunks = await getDb()
        .select()
        .from(legalChunks)
        .where(eq(legalChunks.category, detectedCategory));

      // Score and rank
      const scored = categoryChunks
        .map((chunk) => ({
          ...chunk,
          _score: scoreChunk(input.query, chunk),
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, input.limit);

      return {
        category: detectedCategory,
        chunks: scored.map(({ _score, ...chunk }) => chunk),
      };
    }),

  /**
   * Get chunks by specific article number
   */
  getByArticle: publicQuery
    .input(
      z.object({
        lawName: z.string(),
        articleNumber: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(legalChunks)
        .where(
          and(
            eq(legalChunks.lawName, input.lawName),
            eq(legalChunks.articleNumber, input.articleNumber)
          )
        );
    }),

  /**
   * List all unique laws in the KB
   */
  listLaws: publicQuery.query(async () => {
    const results = await getDb()
      .select({ lawName: legalChunks.lawName })
      .from(legalChunks)
      .groupBy(legalChunks.lawName);

    return results.map((r) => r.lawName);
  }),

  /**
   * Get chunks by category
   */
  getByCategory: publicQuery
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(legalChunks)
        .where(eq(legalChunks.category, input.category));
    }),

  /**
   * Seed the legal KB (admin only, no auth check for now)
   */
  seed: publicQuery.mutation(async () => {
    const db = getDb();
    const existing = await db.select({ count: legalChunks.id }).from(legalChunks);

    if (existing.length > 0 && existing[0].count > 0) {
      return { message: "Already seeded", count: existing[0].count };
    }

    // Load from JSON
    const fs = await import("fs");
    const path = await import("path");
    const kbPath = path.resolve("api/legal-systems/legal-kb.json");
    const raw = fs.readFileSync(kbPath, "utf-8");
    const kb = JSON.parse(raw);

    const chunks = kb.chunks.map((chunk: any) => ({
      lawName: chunk.law_name,
      chapter: chunk.chapter,
      articleNumber: chunk.article_number,
      articleText: chunk.article_text,
      tags: chunk.tags,
      category: chunk.category,
    }));

    for (let i = 0; i < chunks.length; i += 20) {
      const batch = chunks.slice(i, i + 20);
      await db.insert(legalChunks).values(batch);
    }

    return { message: "Seeded successfully", count: chunks.length };
  }),

  /**
   * Count total chunks
   */
  count: publicQuery.query(async () => {
    const result = await getDb()
      .select({ count: legalChunks.id })
      .from(legalChunks);
    return result[0]?.count ?? 0;
  }),
});
