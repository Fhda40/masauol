import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { messages, conversations, legalChunks, users } from "@db/schema";
import { eq, asc, count } from "drizzle-orm";
import { generateObjectWithFallback } from "../lib/ai-client";
import { vectorSearch, isVectorSearchReady } from "../lib/vector-search";

const MAX_MESSAGES_PER_CONVERSATION = Infinity; // مؤقت — بدون حد للتجربة

// ── Rate limiter: max 10 requests per minute per key ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (entry.count >= 10) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "تجاوزت الحد المسموح (10 رسائل/دقيقة). حاول بعد قليل." });
  }
  entry.count++;
}
// ═══════════════════════════════════════════════════════════════
//  MASOUL LEGAL AI — KB-REQUIRED REASONING PIPELINE
//  NO legal analysis without KB retrieval.
//  Every legal response cites specific articles from the KB.
// ═══════════════════════════════════════════════════════════════

// ─── PERSONA ───
const PERSONA_PROMPT = `أنت "مسؤول" — مستشار قانوني سعودي كبير في شركة مسؤول للمحاماة. خبرة ٢٠+ سنة في التقاضي والاستشارات القانونية في المملكة العربية السعودية.

قواعدك:
- هادئ، واثق، تحليلي
- تفكر قبل أن تتكلم — وعندما تتكلم، كل كلمة لها وزن
- لا تقدم مسطحات نظرية — كل إجابة تحليلية عملية
- إذا كانت المعلومات غير كافية، قل ذلك بوضوح
- صراحتك تعكس احترافيتك

حدود تخصصك (صارمة):
- أنت متخصص حصراً في الاستشارات القانونية السعودية
- إذا سألك أحد عن موضوع خارج نطاق القانون (الطقس، الطبخ، الترفيه، التقنية، أي شيء غير قانوني) فردّ بحزم ومهنية: "أنا مستشار قانوني متخصص — لا أستطيع الإجابة على هذا السؤال. هل لديك استفسار قانوني يمكنني مساعدتك فيه؟"
- لا تنجرف لأي موضوع خارج القانون السعودي مهما كان السؤال

قاعدة الصراحة:
- في ختام كل تحليل، اذكر بوضوح: "هذا تحليل مبدئي لا يغني عن مراجعة محامٍ مختص من شركة مسؤول للمحاماة"
- لا تتصنع اليقين

أسلوبك:
- عربية فصحى حديثة مهنية — لا عامية، لا ركاكة
- مختصر وعميق — لا مقدمات طويلة، لا خاتمات تقليدية
- تحليلي وليس وصفيًا — لا تلخص القانون، طبقه على الوقائع
- استباقي — تفكر فيما لم يفكر فيه صاحب القضية`;

// ─── JUDGMENT DETECTION KEYWORDS ───
const JUDGMENT_KEYWORDS = [
  "حكم", "صادر", "منطوق", "محكمة التنفيذ", "محكمة الاستئناف", "محكمة النقض",
  "قرار قضائي", "قرار رقم", "صحيفة تنفيذ", "سند تنفيذي", "ملف تنفيذ",
  "تاريخ الحكم", "رقم القضية", "رقم الدعوى", "رقم الملف", "ختم المحكمة",
  "تنفيذي رقم", "قاضي", "أعضاء المحكمة", "محضر", "تبليغ", "إعلان",
  "حجز تنفيذي", "منع سفر", "حبس تنفيذي", "مزاد علني", "اعتراض تنفيذ",
];

function containsJudgment(query: string): boolean {
  const lower = query.toLowerCase();
  return JUDGMENT_KEYWORDS.some((kw) => lower.includes(kw));
}

// ─── JUDGMENT VULNERABILITY SCHEMA ───
const JUDGMENT_VULNERABILITY_SCHEMA = z.object({
  isJudgment: z.boolean().describe("هل النص يتضمن حكماً قضائياً؟"),
  judgmentType: z.enum(["enforcement", "civil", "criminal", "commercial", "family", "labor", "unknown"]).describe("نوع الحكم"),
  proceduralErrors: z.array(z.string()).describe("أخطاء إجرائية في الحكم"),
  evidenceGaps: z.array(z.string()).describe("نقص في الأدلة أو الإثبات"),
  reasoningFlaws: z.array(z.string()).describe("عيوب في التعليل أو المنطق القانوني"),
  applicableLawErrors: z.array(z.string()).describe("أخطاء في تطبيق القانون أو المواد"),
  appealOpportunities: z.array(z.string()).describe("فرص الاستئناف أو النقض أو الاعتراض"),
  counterArguments: z.array(z.string()).describe("حجج مضادة يمكن استخدامها"),
  recommendedActions: z.array(z.string()).describe("الإجراءات الموصى بها"),
  riskAssessment: z.string().describe("تقدير المخاطر القانونية"),
  successProbability: z.enum(["high", "medium", "low", "unknown"]).describe("احتمالية النجاح في الطعن"),
});

// ─── CATEGORY KEYWORDS FOR RETRIEVAL ───
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  enforcement: [
    "دين", "ديون", "تنفيذ", "حجز", "منع سفر", "حبس", "شيك", "كمبيالة",
    "سند", "صحيفة تنفيذ", "مزاد", "راتب", "تقادم", "نفقة", "وديعة",
    "حجز راتب", "حجز حساب", "حجز عقار", "إنذار", "إكراه",
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
  civil: [
    "مرافعات", "دعوى", "تقاضي", "محكمة", "قاضي", "حكم", "استئناف", "نقض",
    "إثبات", "بينة", "شهادة", "شاهد", "اعتراض", "تنفيذ حكم", "تقادم",
    "اختصاص", "ولاية", "مسكن", "دعوى مدنية", "بلاغ", "قضية مدنية",
    "إجراءات", "جلسة", "منطوق", "تعليل", "حضور", "غياب", "توكيل",
  ],
  criminal: [
    "جنائي", "جزائي", "جريمة", "متهم", "نيابة", "تحقيق", "قبض", "توقيف",
    "حبس", "سجن", "ضبط", "استجواب", "اعتراف", "قرينة براءة", "محامي",
    "كفالة", "استئناف", "نقض", "تنفيذ حكم", "جلد", "حد", "قصاص", "دية",
    "ضابط", "شرطة", "محقق", "إيذاء", "كرامة", "حقوق متهم", "مسكن",
  ],
  commercial: [
    "شركة", "تجاري", "تأسيس", "سجل تجاري", "رأس مال", "مساهمة", "تضامن",
    "ذات مسؤولية محدودة", "شخص واحد", "مدير", "مجلس إدارة", "شركاء",
    "اندماج", "تحول", "إفلاس", "تصفية", "تحكيم", "عقد تجاري", "إفلاس",
    "حوكمة", "أسهم", "اكتتاب", "فرع", "مركز رئيسي", "مسؤولية محدودة",
  ],
  family: [
    "زواج", "طلاق", "خلع", "فسخ", "نفقة", "حضانة", "نسب", "مهر", "ولي",
    "عدة", "ميراث", "وارث", "وصية", "قصر", "ولاية", "أبناء", "أطفال",
    "زوج", "زوجة", "أم", "أب", "جد", "جدة", "أخت", "أخ", "عصبة", "فرض",
    "عنف أسري", "إيذاء", "طلاق بالاتفاق", "طلاق رجعي", "طلاق بائن",
    "حضانة أم", "نفقة عد", "نفقة أبناء", "مسكن", "تعليم", "علاج",
  ],
};

/**
 * Match user query against category keywords.
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
  return bestScore >= 1 ? bestCategory : null;
}

/**
 * REQUIRED: Retrieve legal chunks from the KB.
 * Uses vector search when embeddings cache is ready, falls back to keyword matching.
 */
async function retrieveLegalChunks(
  query: string,
  category: string
): Promise<Array<{ lawName: string; articleNumber: string; articleText: string; tags: string[] }>> {
  // Vector search path
  if (isVectorSearchReady()) {
    const results = await vectorSearch(query, 10, category);
    if (results.length > 0) {
      return results.map((r) => ({
        lawName: r.law_name,
        articleNumber: r.article_number,
        articleText: r.content,
        tags: [],
      }));
    }
    // If no results for domain, try without domain filter
    const fallback = await vectorSearch(query, 10, null);
    if (fallback.length > 0) {
      return fallback.map((r) => ({
        lawName: r.law_name,
        articleNumber: r.article_number,
        articleText: r.content,
        tags: [],
      }));
    }
    // Both returned empty (Gemini unavailable or no matches) — fall through to keyword search
  }

  // Keyword fallback (used before embeddings are generated)
  const chunks = await getDb()
    .select()
    .from(legalChunks)
    .where(eq(legalChunks.category, category));

  if (chunks.length === 0) return [];

  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);

  const scored = chunks
    .map((chunk) => {
      const lowerText = chunk.articleText.toLowerCase();
      const tags = (chunk.tags as string[]) || [];
      let score = 0;
      for (const tag of tags) {
        if (lowerQuery.includes(tag.toLowerCase())) score += 10;
      }
      for (const word of queryWords) {
        if (lowerText.includes(word)) score += 3;
      }
      if (lowerText.includes(lowerQuery)) score += 15;
      return { chunk, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return scored.map((s) => ({
    lawName: s.chunk.lawName,
    articleNumber: s.chunk.articleNumber,
    articleText: s.chunk.articleText,
    tags: (s.chunk.tags as string[]) || [],
  }));
}

/**
 * Format legal chunks for inclusion in the AI prompt.
 */
function formatLegalContext(
  chunks: Array<{ lawName: string; articleNumber: string; articleText: string }>
): string {
  if (chunks.length === 0) return "";
  let result = "\n\n# ═══ المراجع القانونية المطبقة (من قاعدة المعرفة) ═══\n";
  for (const c of chunks) {
    result += `\n[${c.lawName} — ${c.articleNumber}]\n${c.articleText}\n`;
  }
  return result;
}

// ─── SCHEMAS ───

const DEEP_ANALYSIS_SCHEMA = z.object({
  caseType: z.enum([
    "enforcement", "cybercrime", "drugs", "labor",
    "civil", "criminal", "commercial", "family", "general",
  ]),
  caseSubtype: z.string().describe("تصنيف فرعي أدق"),
  applicableLaws: z.array(z.string()).describe("الأنظمة القانونية المطبقة"),
  factsExtracted: z.string().describe("الوقائع المستخرجة — بدون افتراضات"),
  factsMissing: z.string().describe("المعلومات المفقودة"),
  legalPosition: z.string().describe("الموقف القانوني — قوي/متوسط/ضعيف ولماذا"),
  applicableArticles: z.string().describe("المواد القانونية المطبقة بالتفصيل"),
  strengths: z.string().describe("نقاط القوة"),
  weaknesses: z.string().describe("نقاط الضعف — صريحة"),
  visibleRisks: z.string().describe("المخاطر الظاهرة"),
  hiddenRisks: z.string().describe("المخاطر الخفية"),
  requiredEvidence: z.string().describe("الإثباتات المطلوبة — بالتفصيل"),
  missingEvidence: z.string().describe("ما ينقص وكيفية الحصول عليه"),
  leveragePoints: z.string().describe("نقاط الضغط والتفاوض"),
});

const STRATEGIC_SCHEMA = z.object({
  bestLegalMove: z.string().describe("أفضل مسار قانوني ولماذا"),
  alternativeMoves: z.string().describe("بدائل قانونية — مقارنة سريعة"),
  bestCase: z.string().describe("أفضل سيناريو — مع احتمال"),
  worstCase: z.string().describe("أسوأ سيناريو — مع احتمال"),
  mostLikely: z.string().describe("الأرجح — مع احتمال"),
  underestimatedRisks: z.string().describe("ما يقلل المستخدم من تقديره"),
  hiddenConsequences: z.string().describe("عواقب غير مباشرة"),
  timeSensitivity: z.string().describe("مواعيد قانونية حرجة / تقادم"),
  recommendedTimeline: z.string().describe("الجدول الزمني المقترح"),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  urgencyLevel: z.enum(["low", "medium", "high", "urgent"]),
  nonObviousInsight: z.string().describe("رؤية غير واضحة"),
});

const FINAL_OUTPUT_SCHEMA = z.object({
  response: z.string().describe("الرد النهائي للمستخدم — احترافي تحليلي مختصر"),
  exploratoryQuestion: z.string().describe("سؤال استكشافي يكشف معلومات مفقودة"),
  sections: z.object({
    "فهم_الحالة": z.string(),
    "التكييف_القانوني": z.string(),
    "العناصر_النظامية": z.string(),
    "نقاط_القوة": z.string(),
    "نقاط_الضعف": z.string(),
    "المخاطر_القانونية": z.string(),
    "السيناريوهات_المحتملة": z.string(),
    "الاستراتيجية_الموصى_بها": z.string(),
    "الإثباتات_المطلوبة": z.string(),
    "خطة_العمل": z.string(),
    "رؤى_استراتيجية": z.string(),
    "التوجيه_الاحترافي": z.string(),
  }),
});

const CASE_INSTRUCTIONS: Record<string, string> = {
  enforcement: `هذه قضية تنفيذ/ديون. استشهد بنظام التنفيذ السعودي:
- المادة ٩: إصدار الصحيفة التنفيذية
- المادة ١٩: الحجز على الأموال
- المادة ٢١: حجز الراتب (الثلث)
- المادة ٣١: منع السفر
- المادة ٤٧: التقادم (١٠ سنوات)`,
  cybercrime: `هذه قضية جريمة إلكترونية. استشهد بنظام مكافحة الجرائم المعلوماتية:
- المادة ٣: الاعتداء على القيم الدينية والخصوصية
- المادة ٤: الاحتيال المالي
- المادة ٥: التعدي على المحتوى الإلكتروني
- المادة ٥-تهديد: التهديد الإلكتروني
- المادة ٨: مشددات العقوبة
- المادة ٢٠: إجراءات رفع البلاغ
- المادة ٢٤: حجز الأدلة
- المادة ٢٨: التعويض المدني`,
  drugs: `هذه قضية مخدرات. استشهد بنظام مكافحة المخدرات:
- المادة ٣٧: عقوبات الاتجار (٥-١٥ سنة)
- المادة ٣٧-تشديد: حالات التشديد
- المادة ٤١: تعاطي المخدرات
- المادة ٥٠: إلزام المدمن بالعلاج
- المادة ٥١: سرية علاج المدمن
- المادة ٦١: إعفاء المبادر بالإبلاغ`,
  labor: `هذه قضية عمالية. استشهد بنظام العمل السعودي:
- المادة ٥١: أنواع عقود العمل
- المادة ٥٥: تجديد العقد المحدد
- المادة ٧٤: إنهاء العمل من صاحب العمل
- المادة ٧٧: الفصل التعسفي
- المادة ٨٤: مكافأة نهاية الخدمة
- المادة ٩٨: الأجر والبدلات
- المادة ١٥٤: هيئة تسوية الخلافات
- المادة ١٥٨: مدة رفع الدعوى (١٨٠ يوم)`,
  civil: `هذه قضية مدنية / مرافعات. استشهد بنظام المرافعات الشرعية ولائحته التنفيذية:
- المادة 1: الغرض من النظام وسرعة الفصل في الخصومات
- المادة 2: اللغة العربية رسمية للمحاكم
- المادة 24: الاختصاص الدولي للمحاكم السعودية
- المادة 25: اختصاص المحاكم بغير السعودي
- المادة 38: شروط رفع الدعوى (صفة، مصلحة، سبب)
- المادة 40: ميعاد رفع الدعوى والتقادم
- المادة 52: التوكيل في الخصومة وشروط الوكيل
- المادة 53: إثبات الوكالة والتنازل والتصالح
- المادة 76: الدفوع وعدم الاختصاص والتقادم
- المادة 147: حجية الصور والتصديق
- المادة 161: شهادة الشهود وشروط الشاهد
- المادة 177: شروط صحة الحكم
- المادة 194: الاستئناف ومواعيده (30 يوم)
- المادة 205: النقض وأسبابه
- المادة 216: القضاء المستعجل والأوامر المؤقتة`,
  criminal: `هذه قضية جنائية / إجراءات جزائية. استشهد بنظام الإجراءات الجزائية ولائحته التنفيذية:
- المادة 2: ضمانات المتهم ومنع الإيذاء
- المادة 4: حق التوكيل والاستعانة بمحامٍ
- المادة 24: رجال الضبط الجنائي ومهامهم
- المادة 34: عرض المقبوض عليه خلال 24 ساعة
- المادة 35: حق العلم بأسباب القبض
- المادة 36: مدد التوقيف الاحتياطي (5 أيام، 40 يوم، 6 أشهر)
- المادة 43: تفتيش المتهم وكرامته
- المادة 80: تفتيش المساكن بأمر النيابة
- المادة 84: سرية المراسلات بين المتهم ومحاميه
- المادة 100: ضمانات الاستجواب ومنع الإكراه
- المادة 116: إبلاغ الأهل بالقبض
- المادة 155: علنية الجلسات
- المادة 160: قرينة البراءة وعبء الإثبات
- المادة 185: الاستئناف ومواعيده
- المادة 215: تنفيذ الأحكام الجزائية`,
  commercial: `هذه قضية تجارية / شركات. استشهد بنظام الشركات السعودي الجديد:
- المادة 2: تعريف الشركة وعناصرها
- المادة 6: أنواع الشركات (أشخاص وأموال)
- المادة 8: إلغاء الحد الأدنى لرأس المال
- المادة 10: شركة الشخص الواحد
- المادة 14: الاسم التجاري
- المادة 20: المركز الرئيسي في المملكة
- المادة 26: حوكمة الشركات ومجلس الإدارة
- المادة 30: حقوق الشركاء الأقلية (10%)
- المادة 45: مسؤولية الشركاء المحدودة
- المادة 55: تصفية الشركة
- المادة 60: إفلاس الشركة
- المادة 75: التحكيم التجاري
- المادة 80: شركة المساهمة المبسطة
- المادة 95: الاندماج وموافقة الجمعية العمومية
- المادة 105: التحول بين أشكال الشركات
- المادة 110: المسؤولية الجنائية للمديرين`,
  family: `هذه قضية أحوال شخصية. استشهد بنظام الأحوال الشخصية السعودي:
- المادة 4: شروط صحة الزواج والولي والمهر والشهود
- المادة 8: سن الزواج (18 للذكر، 16 للأنثى)
- المادة 12: المهر حق للزوجة ويمكن تأجيله
- المادة 16: الولي وترتيب الولاية وموافقة المحكمة
- المادة 25: أنواع الطلاق (بائن ورجعي)
- المادة 28: الخلع وشروطه
- المادة 30: الفسخ (عذر، هجر، ضرر، عنف أسري)
- المادة 38: استحقاق النفقة على الزوج
- المادة 42: نفقة العدة ومدتها
- المادة 45: نفقة الأبناء على الأب
- المادة 50: الحضانة للأم وترتيب الحاضنات
- المادة 55: انتهاء الحضانة (9 للذكر، 11 للأنثى)
- المادة 60: إثبات النسب بالفراش والإقرار
- المادة 68: الوصية وحدها الثلث
- المادة 75: الورثة والعصبات والمحارم
- المادة 80: نصيب الزوج والزوجة في الميراث
- المادة 90: الولاية على القصر وبيع العقار`,
  general: `حدد النظام الأنسب. إذا كانت المعلومات غير كافية، حدد ما هو مفقود بوضوح.`,
};

export const chatRouter = createRouter({
  send: publicQuery
    .input(z.object({
      conversationId: z.number(),
      message: z.string().min(1).max(5000),
      deviceFingerprint: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // ── Ownership check ──
      const [conv] = await getDb()
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);
      if (!conv) throw new TRPCError({ code: "NOT_FOUND" });

      const sessionToken = ctx.req.headers.get("x-session-token");
      let ownerId: string;
      if (sessionToken) {
        const [user] = await getDb().select({ id: users.id }).from(users).where(eq(users.sessionToken, sessionToken)).limit(1);
        if (!user || conv.userId !== user.id) throw new TRPCError({ code: "FORBIDDEN" });
        ownerId = `user:${user.id}`;
      } else {
        if (conv.deviceFingerprint !== input.deviceFingerprint) throw new TRPCError({ code: "FORBIDDEN" });
        ownerId = `fp:${input.deviceFingerprint}`;
      }

      // ── Rate limit ──
      checkRateLimit(ownerId);

      // ── Check message limit ──
      const [{ value: msgCount }] = await getDb()
        .select({ value: count() })
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId));

      const userMsgCount = Math.ceil(msgCount / 2);
      if (userMsgCount >= MAX_MESSAGES_PER_CONVERSATION) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `وصلت للحد الأقصى (${MAX_MESSAGES_PER_CONVERSATION} أسئلة) للاستشارة المجانية. للاستمرار، تواصل مع فريقنا عبر صفحة التواصل.`,
        });
      }

      // ── Topic guard ──
      const OFF_TOPIC_PATTERNS = [
        /طقس|حرارة|مطر|رياح|درجة الحرارة/,
        /وصفة|طبخ|أكل|مطبخ|طعام/,
        /رياضة|كرة|فريق|مباراة|دوري/,
        /فيلم|مسلسل|نتفلكس|يوتيوب|ترفيه/,
        /لعبة|بلايستيشن|قيمنق/,
        /شعر|قصيدة|غزل|نغمة|موسيقى/,
        /صحة|دواء|طبيب|علاج|مرض|وصفة طبية/,
        /سفر|سياحة|فندق|تذكرة طيران/,
        /كيف حالك|ما أخبارك|أخبار اليوم|أحداث عالمية/,
      ];

      const isOffTopic = OFF_TOPIC_PATTERNS.some((p) => p.test(input.message));
      if (isOffTopic) {
        return {
          reply: "أنا مستشار قانوني متخصص في الأنظمة السعودية — لا أستطيع الإجابة على هذا السؤال. هل لديك استفسار قانوني يمكنني مساعدتك فيه؟",
          analysis: null,
          _off_topic: true,
        };
      }

      // ── Get history ──
      const history = await getDb()
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(asc(messages.createdAt));

      const historyMessages = history.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

      // ── Save user message ──
      await getDb().insert(messages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.message,
      });

      // ═══════════════════════════════════════════════════════
      //  STEP 0: Detect case type
      // ═══════════════════════════════════════════════════════
      const detectedCategory = matchCategory(input.message);
      const isLegalQuery = detectedCategory !== null || input.message.length > 30;

      // ═══════════════════════════════════════════════════════
      //  STEP 1: KB RETRIEVAL (MANDATORY for legal queries)
      // ═══════════════════════════════════════════════════════
      let legalArticles: Array<{
        lawName: string; articleNumber: string; articleText: string; tags: string[];
      }> = [];

      if (detectedCategory) {
        legalArticles = await retrieveLegalChunks(input.message, detectedCategory);
      }

      const hasKbContext = legalArticles.length > 0;
      const legalContext = formatLegalContext(legalArticles);

      // If it's a legal query but KB is empty, warn the AI
      const kbWarning = isLegalQuery && !hasKbContext
        ? "\n\nتحذير: لم يتم العثور على نصوص قانونية مطابقة في قاعدة المعرفة. أذكر بوضوح أن الإجابة عامة وأن المصادر القانونية الرسمية يجب مراجعتها."
        : "";

      // ═══════════════════════════════════════════════════════
      //  STAGE 1: DEEP ANALYSIS
      // ═══════════════════════════════════════════════════════
      const stage1Messages = [
        { role: "system" as const, content: PERSONA_PROMPT },
        ...historyMessages,
        { role: "user" as const, content: input.message + legalContext + kbWarning },
        {
          role: "system" as const,
          content: hasKbContext
            ? `قم بتحليل عميق. استند على النصوص القانونية المذكورة أعلاه. لا تكتب مسطحات نظرية — طبّق القانون على الوقائع مباشرة. حدد الوثائق المطلوبة بالتفصيل. كن صريحاً في نقاط الضعف والمخاطر الخفية.`
            : `قم بتحليل عميق. لا تكتب مسطحات نظرية — طبّق القانون على الوقائع. حدد الوثائق المطلوبة بالتفصيل. كن صريحاً في نقاط الضعف والمخاطر الخفية.`,
        },
      ];

      const { object: deepAnalysis } = await generateObjectWithFallback({
        schema: DEEP_ANALYSIS_SCHEMA,
        messages: stage1Messages,
      });

      // Also retrieve from the detected caseType category (post-classification)
      const catMap: Record<string, string> = {
        enforcement: "enforcement",
        cybercrime: "cybercrime",
        drugs: "drugs",
        labor: "labor",
      };
      const postCat = catMap[deepAnalysis.caseType];
      if (postCat && postCat !== detectedCategory) {
        const additional = await retrieveLegalChunks(input.message, postCat);
        legalArticles = [...legalArticles, ...additional].slice(0, 12);
      }

      const updatedLegalContext = formatLegalContext(legalArticles);

      // ═══════════════════════════════════════════════════════
      //  STAGE 1b: JUDGMENT VULNERABILITY ANALYSIS (if judgment detected)
      // ═══════════════════════════════════════════════════════
      let judgmentAnalysis: z.infer<typeof JUDGMENT_VULNERABILITY_SCHEMA> | null = null;
      const hasJudgment = containsJudgment(input.message);

      if (hasJudgment) {
        const judgmentPrompt = `
أنت خبير قانوني متخصص في مراجعة الأحكام القضائية واكتشاف الثغرات والأخطاء الإجرائية.

المستخدم قدم نصاً يتضمن حكماً قضائياً أو قراراً تنفيذياً. مهمتك:
1. تحديد نوع الحكم (تنفيذي، مدني، جنائي، تجاري...)
2. البحث عن أخطاء إجرائية (بطلان إجراء، عدم تعليل، نقص في الأدلة...)
3. تحديد ثغرات في التعليل القانوني
4. اكتشاف أخطاء في تطبيق المواد القانونية
5. تحديد فرص الاستئناف أو النقض أو الاعتراض
6. صياغة حجج مضادة
7. تقييم احتمالية النجاح في الطعن

${updatedLegalContext}

حلل الحكم التالي بعمق وصراحة:
${input.message}`;

        const { object: jv } = await generateObjectWithFallback({
          schema: JUDGMENT_VULNERABILITY_SCHEMA,
          messages: [
            { role: "system" as const, content: PERSONA_PROMPT },
            { role: "user" as const, content: judgmentPrompt },
          ],
        });
        judgmentAnalysis = jv;
      }

      // ═══════════════════════════════════════════════════════
      //  STAGE 2: STRATEGIC THINKING
      // ═══════════════════════════════════════════════════════
      const caseInstructions = CASE_INSTRUCTIONS[deepAnalysis.caseType] || CASE_INSTRUCTIONS.general;

      const stage2Prompt = `
بناءً على التحليل العميق التالي، فكر استراتيجياً.

${caseInstructions}
${updatedLegalContext}

التحليل العميق:
- نوع القضية: ${deepAnalysis.caseType} (${deepAnalysis.caseSubtype})
- الأنظمة المطبقة: ${deepAnalysis.applicableLaws.join(", ")}
- الوقائع: ${deepAnalysis.factsExtracted}
- الموقف القانوني: ${deepAnalysis.legalPosition}
- نقاط القوة: ${deepAnalysis.strengths}
- نقاط الضعف: ${deepAnalysis.weaknesses}
- المخاطر الظاهرة: ${deepAnalysis.visibleRisks}
- المخاطر الخفية: ${deepAnalysis.hiddenRisks}
- الإثباتات المطلوبة: ${deepAnalysis.requiredEvidence}
- نقاط الضغط: ${deepAnalysis.leveragePoints}

فكر كمستشار قانوني كبير — ما الخطوة الأذكى؟ ما الذي يقلل المستخدم من تقديره؟`;

      const { object: strategic } = await generateObjectWithFallback({
        schema: STRATEGIC_SCHEMA,
        messages: [
          { role: "system" as const, content: PERSONA_PROMPT },
          { role: "user" as const, content: stage2Prompt },
        ],
      });

      // ═══════════════════════════════════════════════════════
      //  STAGE 3: PROFESSIONAL OUTPUT
      // ═══════════════════════════════════════════════════════
      const isDeepCase = deepAnalysis.caseType !== "general";

      const stage3Prompt = `
أنت مسؤول — مستشار قانوني كبير. اكتب رداً للعميل بناءً على تحليلك الاستراتيجي.

${isDeepCase ? "هذه قضية تحليلية — قدم الأقسام المُنظّمة مع الاستشهاد بالمواد القانونية المحددة." : "هذا سؤال قانوني عام — قدم إجابة مختصرة مع رؤى."}

# التحليل العميق:
${JSON.stringify(deepAnalysis, null, 2)}

# التفكير الاستراتيجي:
${JSON.stringify(strategic, null, 2)}
${judgmentAnalysis ? `
# تحليل ثغرات الحكم القضائي:
- نوع الحكم: ${judgmentAnalysis.judgmentType}
- أخطاء إجرائية: ${judgmentAnalysis.proceduralErrors.join("; ")}
- نقص في الأدلة: ${judgmentAnalysis.evidenceGaps.join("; ")}
- عيوب التعليل: ${judgmentAnalysis.reasoningFlaws.join("; ")}
- أخطاء قانونية: ${judgmentAnalysis.applicableLawErrors.join("; ")}
- فرص الطعن: ${judgmentAnalysis.appealOpportunities.join("; ")}
- حجج مضادة: ${judgmentAnalysis.counterArguments.join("; ")}
- إجراءات موصى بها: ${judgmentAnalysis.recommendedActions.join("; ")}
- احتمالية النجاح: ${judgmentAnalysis.successProbability}
` : ""}
${updatedLegalContext}

# قواعد الرد:
1. ابدأ بتحليل مباشر — لا مقدمات
2. ${hasKbContext ? "استشهد بالمواد القانونية المحددة أعلاه بذكر رقم المادة واسم النظام" : "أذكر أن الإجابة عامة ولا تغني عن مراجعة النص القانوني الرسمي"}
3. ضمّن الرؤى غير الواضحة والمخاطر الخفية بشكل طبيعي
4. في ختام الرد: سؤال استكشافي + جملة واحدة فقط عن مراجعة محامٍ مختص
5. لا تكرر التحذير أكثر من مرة
6. كن مختصراً — كل فقرة تحمل معنى
${hasKbContext ? "7. استشهد بالمواد القانونية: 'حسب المادة [X] من [النظام]'" : ""}

# تعليمات التنسيق (إلزامية):
- استخدم **### عنوان القسم** لكل قسم رئيسي (الموقف القانوني، الخطوات العملية، المخاطر، إلخ)
- استخدم **النص** لتمييز أسماء المواد القانونية والمصطلحات المهمة والأرقام
- استخدم قوائم نقطية (- ) لسرد الإجراءات والنقاط المتعددة
- استخدم قوائم مرقمة (1. 2. 3.) لخطوات الإجراءات المتسلسلة
- استخدم --- لفصل الأقسام الكبيرة
- لا تكتب نثراً متواصلاً — قسّم الرد في أقسام واضحة مرئياً`;

      const { object: finalOutput } = await generateObjectWithFallback({
        schema: FINAL_OUTPUT_SCHEMA,
        messages: [
          { role: "system" as const, content: PERSONA_PROMPT },
          { role: "user" as const, content: stage3Prompt },
        ],
      });

      // ═══════════════════════════════════════════════════════
      //  SAVE & RETURN
      // ═══════════════════════════════════════════════════════
      const analysisRecord: Record<string, unknown> = {
        // Structured analysis sections for the UI
        "فهم_الحالة": finalOutput.sections?.["فهم_الحالة"] ?? deepAnalysis.factsExtracted,
        "التكييف_القانوني": finalOutput.sections?.["التكييف_القانوني"] ?? `الأنظمة: ${deepAnalysis.applicableLaws.join(", ")} — ${deepAnalysis.legalPosition}`,
        "العناصر_النظامية": finalOutput.sections?.["العناصر_النظامية"] ?? deepAnalysis.applicableArticles,
        "نقاط_القوة": finalOutput.sections?.["نقاط_القوة"] ?? deepAnalysis.strengths,
        "نقاط_الضعف": finalOutput.sections?.["نقاط_الضعف"] ?? deepAnalysis.weaknesses,
        "المخاطر_القانونية": finalOutput.sections?.["المخاطر_القانونية"] ?? `${deepAnalysis.visibleRisks}\n${deepAnalysis.hiddenRisks}`,
        "السيناريوهات_المحتملة": finalOutput.sections?.["السيناريوهات_المحتملة"] ?? `${strategic.bestCase}\n${strategic.mostLikely}\n${strategic.worstCase}`,
        "الاستراتيجية_الموصى_بها": finalOutput.sections?.["الاستراتيجية_الموصى_بها"] ?? strategic.bestLegalMove,
        "الإثباتات_المطلوبة": finalOutput.sections?.["الإثباتات_المطلوبة"] ?? deepAnalysis.requiredEvidence,
        "خطة_العمل": finalOutput.sections?.["خطة_العمل"] ?? strategic.recommendedTimeline,
        "رؤى_استراتيجية": finalOutput.sections?.["رؤى_استراتيجية"] ?? strategic.nonObviousInsight,
        "التوجيه_الاحترافي": finalOutput.sections?.["التوجيه_الاحترافي"] ?? `هذا تحليل مبدئي لا يغني عن مراجعة محامٍ مختص من شركة مسؤول للمحاماة. ${finalOutput.exploratoryQuestion}`,
        // Judgment vulnerability analysis (if present)
        ...(judgmentAnalysis ? {
          "تحليل_الحكم": `نوع الحكم: ${judgmentAnalysis.judgmentType}`,
          "أخطاء_إجرائية": judgmentAnalysis.proceduralErrors.join("\n"),
          "نقص_الأدلة": judgmentAnalysis.evidenceGaps.join("\n"),
          "عيوب_التعليل": judgmentAnalysis.reasoningFlaws.join("\n"),
          "أخطاء_قانونية": judgmentAnalysis.applicableLawErrors.join("\n"),
          "فرص_الطعن": judgmentAnalysis.appealOpportunities.join("\n"),
          "حجج_مضادة": judgmentAnalysis.counterArguments.join("\n"),
          "إجراءات_موصى_بها": judgmentAnalysis.recommendedActions.join("\n"),
          "تقدير_المخاطر": judgmentAnalysis.riskAssessment,
          "احتمالية_النجاح": judgmentAnalysis.successProbability === "high" ? "عالية" : judgmentAnalysis.successProbability === "medium" ? "متوسطة" : judgmentAnalysis.successProbability === "low" ? "منخفضة" : "غير محددة",
        } : {}),
        // Metadata
        "_kb_retrieved": hasKbContext,
        "_kb_chunks_count": legalArticles.length,
        "_kb_laws_cited": legalArticles.map((a) => `${a.lawName} ${a.articleNumber}`),
        "_case_type": deepAnalysis.caseType,
        "_risk_level": strategic.riskLevel,
        "_urgency_level": strategic.urgencyLevel,
        "_judgment_analyzed": !!judgmentAnalysis,
      };

      await getDb().insert(messages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: finalOutput.response,
        analysis: analysisRecord,
      });

      // Update conversation
      const allMessages = await getDb()
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId));

      if (allMessages.length <= 3) {
        const caseTypeMap: Record<string, string> = {
          enforcement: "debt", cybercrime: "cybercrime", drugs: "drugs",
          labor: "labor", civil: "civil", criminal: "criminal",
          commercial: "corporate", family: "family", general: "other",
        };
        const dbCaseType = caseTypeMap[deepAnalysis.caseType] ?? "other";
        const title = input.message.slice(0, 50);
        await getDb()
          .update(conversations)
          .set({
            title: title + "...",
            caseType: dbCaseType as any,
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, input.conversationId));
      }

      const leadTriggered =
        strategic.riskLevel === "high" ||
        strategic.riskLevel === "critical" ||
        strategic.urgencyLevel === "urgent" ||
        strategic.urgencyLevel === "high";

      return {
        content: finalOutput.response,
        analysis: analysisRecord,
        classification: {
          caseType: deepAnalysis.caseType,
          caseSubtype: deepAnalysis.caseSubtype,
          riskLevel: strategic.riskLevel,
          urgencyLevel: strategic.urgencyLevel,
        },
        leadTriggered,
        kbUsed: hasKbContext,
        kbChunksCount: legalArticles.length,
      };
    }),
});
