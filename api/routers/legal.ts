import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { legalChunks } from "@db/schema";
import { eq, and, like, or } from "drizzle-orm";
import { vectorSearch, isVectorSearchReady } from "../lib/vector-search";

const LAW_META: Record<string, { nameAr: string; category: string; description: string; icon: string }> = {
  "نظام مكافحة الجرائم المعلوماتية": {
    nameAr: "نظام مكافحة الجرائم المعلوماتية",
    category: "cybercrime",
    description: "يُنظّم الجرائم الإلكترونية كالابتزاز والاحتيال والاختراق والتشهير عبر الشبكات",
    icon: "shield",
  },
  "نظام العمل السعودي": {
    nameAr: "نظام العمل السعودي",
    category: "labor",
    description: "يُنظّم العلاقة بين صاحب العمل والموظف: العقود والرواتب والإجازات ونهاية الخدمة",
    icon: "briefcase",
  },
  "نظام التنفيذ السعودي": {
    nameAr: "نظام التنفيذ السعودي",
    category: "enforcement",
    description: "يُنظّم تنفيذ الأحكام القضائية والسندات التنفيذية والحجز وإجراءات استيفاء الديون",
    icon: "gavel",
  },
  "نظام مكافحة المخدرات والمؤثرات العقلية": {
    nameAr: "نظام مكافحة المخدرات والمؤثرات العقلية",
    category: "drugs",
    description: "يُحدّد عقوبات حيازة المخدرات وتعاطيها والاتجار بها والجرائم المرتبطة",
    icon: "alert-triangle",
  },
  "نظام الأحوال الشخصية السعودي": {
    nameAr: "نظام الأحوال الشخصية السعودي",
    category: "family",
    description: "يُنظّم أحكام الزواج والطلاق والحضانة والنفقة والمواريث وفق أحكام الشريعة الإسلامية",
    icon: "heart",
  },
  "نظام الشركات السعودي": {
    nameAr: "نظام الشركات السعودي",
    category: "commercial",
    description: "يُنظّم تأسيس الشركات وأنواعها وحوكمتها والنزاعات التجارية والإفلاس",
    icon: "building",
  },
  "نظام الإجراءات الجزائية": {
    nameAr: "نظام الإجراءات الجزائية",
    category: "criminal",
    description: "يُنظّم إجراءات التحقيق والاتهام والمحاكمة الجزائية وحقوق المتهم",
    icon: "scale",
  },
  "نظام الإجراءات المدنية": {
    nameAr: "نظام الإجراءات المدنية",
    category: "civil",
    description: "يُنظّم إجراءات التقاضي المدني وتقديم الدعاوى وقواعد الإثبات والتقادم",
    icon: "file-text",
  },
};

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
  family: [
    "طلاق", "زواج", "حضانة", "نفقة", "خلع", "فسخ", "مهر", "عقد زواج",
    "زوجة", "زوج", "أبناء", "أطفال", "ولاية", "وصية", "ميراث", "إرث",
    "تركة", "أحوال شخصية", "رضاعة", "حضانة الأطفال", "طاعة", "نشوز",
    "عدة", "رجعة", "بائن", "مهر المثل", "نسب", "لقيط",
  ],
  commercial: [
    "شركة", "تأسيس شركة", "مساهمة", "ذات مسؤولية محدودة", "شراكة",
    "إفلاس", "تصفية", "رأس مال", "أسهم", "مساهم", "مجلس إدارة",
    "عقد تجاري", "نزاع تجاري", "تجاري", "توزيع أرباح", "اندماج",
    "اكتساب", "حوكمة", "ترخيص تجاري", "سجل تجاري",
  ],
  criminal: [
    "جريمة", "جناية", "جنحة", "توقيف", "اعتقال", "احتجاز", "تحقيق",
    "المتهم", "المظنون", "اعتراف", "شهادة", "إثبات", "حكم جنائي",
    "استئناف جنائي", "النيابة العامة", "ادعاء", "دفاع", "سجن", "عقوبة",
    "تعزير", "قصاص", "دية", "حد", "محكمة جزائية",
  ],
  civil: [
    "دعوى مدنية", "إجراءات مدنية", "تقادم", "التقادم", "اختصاص",
    "اختصاص المحكمة", "تبليغ", "إخطار", "اعتراض", "طعن",
    "استئناف مدني", "تحكيم", "وساطة", "إثبات مدني", "بينة",
    "عبء الإثبات", "شهود", "خبرة", "خبير", "حكم مدني", "تنفيذ حكم",
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

    const fs = await import("fs");
    const path = await import("path");

    // Load all 8 law chunk files
    const chunkFiles = [
      "cybercrime-chunks.json",
      "labor-chunks.json",
      "enforcement-chunks.json",
      "drugs-chunks.json",
      "personal-status-chunks.json",
      "companies-chunks.json",
      "criminal-procedure-chunks.json",
      "civil-procedure-chunks.json",
    ];

    const allChunks: any[] = [];
    for (const file of chunkFiles) {
      const kbPath = path.resolve("api/legal-systems", file);
      if (!fs.existsSync(kbPath)) continue;
      const raw = fs.readFileSync(kbPath, "utf-8");
      const kb = JSON.parse(raw);
      for (const chunk of kb.chunks) {
        allChunks.push({
          lawName: chunk.law_name,
          chapter: chunk.chapter ?? "",
          articleNumber: chunk.article_number,
          articleText: chunk.article_text,
          tags: chunk.tags ?? [],
          category: chunk.category,
        });
      }
    }

    for (let i = 0; i < allChunks.length; i += 25) {
      await db.insert(legalChunks).values(allChunks.slice(i, i + 25));
    }

    return { message: "Seeded successfully", count: allChunks.length };
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

  /**
   * Get all articles for a specific law (for library page)
   */
  getByLaw: publicQuery
    .input(z.object({ lawName: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(legalChunks)
        .where(eq(legalChunks.lawName, input.lawName))
        .orderBy(legalChunks.articleNumber);
    }),

  /**
   * List laws with metadata and article counts (for library page)
   */
  listLawsWithMeta: publicQuery.query(async () => {
    const rows = await getDb()
      .select({
        lawName: legalChunks.lawName,
        category: legalChunks.category,
        id: legalChunks.id,
      })
      .from(legalChunks);

    const grouped: Record<string, { category: string; count: number }> = {};
    for (const row of rows) {
      if (!grouped[row.lawName]) {
        grouped[row.lawName] = { category: row.category, count: 0 };
      }
      grouped[row.lawName].count++;
    }

    return Object.entries(grouped).map(([lawName, { category, count }]) => ({
      lawName,
      category,
      count,
      ...(LAW_META[lawName] ?? { nameAr: lawName, description: "", icon: "book" }),
    }));
  }),

  /**
   * Search articles across all laws (full-text keyword search for library)
   */
  searchArticles: publicQuery
    .input(z.object({
      query: z.string().min(2).max(200),
      category: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      // Vector search path
      if (isVectorSearchReady()) {
        const results = await vectorSearch(input.query, input.limit, input.category ?? null);
        return results.map((r) => ({
          id: 0,
          lawName: r.law_name,
          chapter: r.chapter,
          articleNumber: r.article_number,
          articleText: r.content,
          tags: [] as string[],
          category: r.domain,
          createdAt: new Date(),
          _similarity: r.similarity,
        }));
      }

      // Keyword fallback
      const db = getDb();
      let base = db.select().from(legalChunks);
      const rows = await (input.category
        ? base.where(eq(legalChunks.category, input.category)).limit(300)
        : base.limit(500));

      const q = input.query.toLowerCase();
      return rows
        .filter(r =>
          r.articleText.toLowerCase().includes(q) ||
          r.articleNumber.toLowerCase().includes(q) ||
          (r.tags as string[]).some(t => t.includes(q))
        )
        .slice(0, input.limit);
    }),
});
