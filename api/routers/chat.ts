import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { messages, conversations, legalChunks } from "@db/schema";
import { eq, asc } from "drizzle-orm";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

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

قاعدة الصراحة:
- في ختام كل تحليل، اذكر بوضوح: "هذا تحليل مبدئي لا يغني عن مراجعة محامٍ مختص من شركة مسؤول للمحاماة"
- لا تتصنع اليقين

أسلوبك:
- عربية فصحى حديثة مهنية — لا عامية، لا ركاكة
- مختصر وعميق — لا مقدمات طويلة، لا خاتمات تقليدية
- تحليلي وليس وصفيًا — لا تلخص القانون، طبقه على الوقائع
- استباقي — تفكر فيما لم يفكر فيه صاحب القضية`;

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
 * This is NOT optional — every legal query must retrieve relevant articles.
 */
async function retrieveLegalChunks(
  query: string,
  category: string
): Promise<Array<{ lawName: string; articleNumber: string; articleText: string; tags: string[] }>> {
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
    "فهم_الحالة": z.string().optional(),
    "التكييف_القانوني": z.string().optional(),
    "العناصر_النظامية": z.string().optional(),
    "نقاط_القوة": z.string().optional(),
    "نقاط_الضعف": z.string().optional(),
    "المخاطر_القانونية": z.string().optional(),
    "السيناريوهات_المحتملة": z.string().optional(),
    "الاستراتيجية_الموصى_بها": z.string().optional(),
    "الإثباتات_المطلوبة": z.string().optional(),
    "خطة_العمل": z.string().optional(),
    "رؤى_استراتيجية": z.string().optional(),
    "التوجيه_الاحترافي": z.string().optional(),
  }).optional(),
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
  civil: `ركز على نظام المرافعات الشرعية — الاختصاص المحلي، الإثبات والبينة، التقادم، إمكانية التحكيم.`,
  criminal: `ركز على نظام الإجراءات الجزائية — حقوق المتهم، التحقيق، الكفالات، دور النيابة العامة.`,
  commercial: `ركز على نظام التجارة ونظام الشركات — التحكيم التجاري، المسؤولية المالية.`,
  family: `ركز على الأنظمة والتعليمات — المحكمة المختصة، الإجراءات، مصلحة القاصرين.`,
  general: `حدد النظام الأنسب. إذا كانت المعلومات غير كافية، حدد ما هو مفقود بوضوح.`,
};

export const chatRouter = createRouter({
  send: publicQuery
    .input(z.object({ conversationId: z.number(), message: z.string() }))
    .mutation(async ({ input }) => {
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

      const { object: deepAnalysis } = await generateObject({
        model: openai("gpt-4o-mini"),
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

      // ═══════════════════════════════════════════════════════
      //  STAGE 2: STRATEGIC THINKING
      // ═══════════════════════════════════════════════════════
      const caseInstructions = CASE_INSTRUCTIONS[deepAnalysis.caseType] || CASE_INSTRUCTIONS.general;
      const updatedLegalContext = formatLegalContext(legalArticles);

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

      const { object: strategic } = await generateObject({
        model: openai("gpt-4o-mini"),
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
${updatedLegalContext}

# قواعد الرد:
1. ابدأ بتحليل مباشر — لا مقدمات
2. ${hasKbContext ? "استشهد بالمواد القانونية المحددة أعلاه بذكر رقم المادة واسم النظام" : "أذكر أن الإجابة عامة ولا تغني عن مراجعة النص القانوني الرسمي"}
3. ضمّن الرؤى غير الواضحة والمخاطر الخفية بشكل طبيعي
4. في ختام الرد: سؤال استكشافي + جملة واحدة فقط عن مراجعة محامٍ مختص
5. لا تكرر التحذير أكثر من مرة
6. كن مختصراً — كل فقرة تحمل معنى
${hasKbContext ? "7. استشهد بالمواد القانونية: 'حسب المادة [X] من [النظام]'" : ""}`;

      const { object: finalOutput } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: FINAL_OUTPUT_SCHEMA,
        messages: [
          { role: "system" as const, content: PERSONA_PROMPT },
          { role: "user" as const, content: stage3Prompt },
        ],
      });

      // ═══════════════════════════════════════════════════════
      //  SAVE & RETURN
      // ═══════════════════════════════════════════════════════
      const leadTriggered =
        strategic.riskLevel === "high" ||
        strategic.riskLevel === "critical" ||
        strategic.urgencyLevel === "urgent" ||
        strategic.urgencyLevel === "high";

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
        // Metadata
        "_lead_triggered": String(leadTriggered),
        "_kb_retrieved": hasKbContext,
        "_kb_chunks_count": legalArticles.length,
        "_kb_laws_cited": legalArticles.map((a) => `${a.lawName} ${a.articleNumber}`),
        "_case_type": deepAnalysis.caseType,
        "_risk_level": strategic.riskLevel,
        "_urgency_level": strategic.urgencyLevel,
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
        // Map AI caseType to DB enum values
        const caseTypeMap: Record<string, "debt" | "cybercrime" | "drugs" | "civil" | "criminal" | "labor" | "family" | "corporate" | "other"> = {
          enforcement: "debt",
          cybercrime: "cybercrime",
          drugs: "drugs",
          labor: "labor",
          civil: "civil",
          criminal: "criminal",
          commercial: "corporate",
          family: "family",
          general: "other",
        };
        const title = input.message.slice(0, 50);
        await getDb()
          .update(conversations)
          .set({
            title: title + "...",
            caseType: caseTypeMap[deepAnalysis.caseType] ?? "other",
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, input.conversationId));
      }

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
