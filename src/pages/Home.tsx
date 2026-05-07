import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { Brain, ChevronLeft, Plus, FileText, Phone, Sparkles, Shield, Clock, BookOpen, Scale, ArrowLeft } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import DocumentUploadZone from "@/components/DocumentUploadZone";
import AnimatedCounter from "@/components/AnimatedCounter";

/* ── Rich Text ── */
function RichText({ text }: { text: string }) {
  const lines = text.split(/\n+/);
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return null;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: "#9A8F7A" }}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={j} className="font-semibold" style={{ color: "#F0EAD8" }}>{part.slice(2, -2)}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

/* ── Types ── */
interface AnalysisSection { key: string; label: string; content: string; }
interface ClassificationData { caseType: string; riskLevel: string; urgencyLevel: string; }

const SECTION_DEFS: Omit<AnalysisSection, "content">[] = [
  { key: "فهم_الحالة", label: "فهم الحالة" },
  { key: "التكييف_القانوني", label: "التكييف القانوني" },
  { key: "العناصر_النظامية", label: "العناصر النظامية" },
  { key: "نقاط_القوة", label: "نقاط القوة" },
  { key: "نقاط_الضعف", label: "نقاط الضعف" },
  { key: "المخاطر_القانونية", label: "المخاطر القانونية" },
  { key: "السيناريوهات_المحتملة", label: "السيناريوهات" },
  { key: "الاستراتيجية_الموصى_بها", label: "الاستراتيجية" },
  { key: "الإثباتات_المطلوبة", label: "الإثباتات المطلوبة" },
  { key: "خطة_العمل", label: "خطة العمل" },
  { key: "رؤى_استراتيجية", label: "رؤى استراتيجية" },
];

const QUICK_PROMPTS = [
  "تعرضت لابتزاز إلكتروني عبر واتساب",
  "شركتي فصلتني بدون سبب بعد ٣ سنوات",
  "لدي ديون مستحقة وتم حجز راتبي",
  "شخص سرق حسابي البنكي",
];

const RISK_LABELS: Record<string, string> = { low: "منخفض", medium: "متوسط", high: "عالي", critical: "حرج" };
const URGENCY_LABELS: Record<string, string> = { low: "عادي", medium: "متوسط", high: "عاجل", urgent: "حرج" };
const CASE_TYPE_LABELS: Record<string, string> = {
  enforcement: "تنفيذ / ديون", cybercrime: "جرائم إلكترونية", drugs: "مخدرات",
  labor: "عمالي", civil: "مدني", criminal: "جنائي", commercial: "تجاري",
  family: "أحوال شخصية", general: "عام",
};

const FEATURES = [
  { icon: Brain, title: "ذكاء اصطناعي متخصص", desc: "مدرّب على الأنظمة والتشريعات السعودية لتحليل دقيق وموثوق" },
  { icon: Shield, title: "تحليل المخاطر", desc: "تقييم فوري لمستوى المخاطرة والعجلة في كل قضية" },
  { icon: Clock, title: "استجابة فورية", desc: "تحليل قانوني شامل خلال ثوانٍ بدون انتظار" },
  { icon: BookOpen, title: "قاعدة معرفة قانونية", desc: "مرجعية من 80+ مادة نظامية سعودية محدّثة" },
  { icon: Scale, title: "تكييف قانوني دقيق", desc: "تصنيف القضية وتحديد الأنظمة المنطبقة بشكل احترافي" },
  { icon: FileText, title: "خطة عمل قابلة للتنفيذ", desc: "خطوات واضحة ومنظمة يمكن اتخاذها فوراً" },
];

/* ════════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════════ */
export default function Home() {
  const [view, setView] = useState<"hero" | "thinking" | "analysis">("hero");
  const [input, setInput] = useState("");
  const [sections, setSections] = useState<AnalysisSection[]>([]);
  const [classification, setClassification] = useState<ClassificationData | null>(null);
  const [kbUsed, setKbUsed] = useState(false);
  const [kbCount, setKbCount] = useState(0);
  const [aiResponse, setAiResponse] = useState("");
  const [leadTriggered, setLeadTriggered] = useState(false);
  const fingerprint = getDeviceFingerprint();

  const createConversation = trpc.conversation.create.useMutation();
  const chatMutation = trpc.chat.send.useMutation();

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || chatMutation.isPending) return;
    const text = input.trim();
    setView("thinking");

    const conv = await createConversation.mutateAsync({
      deviceFingerprint: fingerprint,
      title: text.slice(0, 50) + "...",
    });

    chatMutation.mutate(
      { conversationId: conv.id, message: text },
      {
        onSuccess: (data: any) => {
          if (!data) return;
          setAiResponse(data.content || "");
          setClassification(data.classification);
          setKbUsed(data.kbUsed);
          setKbCount(data.kbChunksCount);
          setLeadTriggered(!!data.leadTriggered);

          if (data.analysis) {
            const analysisEntries = Object.entries(data.analysis as Record<string, string>)
              .filter(([k]) => !k.startsWith("_"))
              .filter(([k]) => SECTION_DEFS.find((d) => d.key === k));

            const builtSections = analysisEntries
              .map(([key, content]) => {
                const def = SECTION_DEFS.find((d) => d.key === key);
                if (!def) return null;
                return { key, label: def.label, content };
              })
              .filter(Boolean) as AnalysisSection[];

            const orderMap = Object.fromEntries(SECTION_DEFS.map((d, i) => [d.key, i]));
            builtSections.sort((a, b) => (orderMap[a.key] ?? 99) - (orderMap[b.key] ?? 99));
            setSections(builtSections);
          }
          setTimeout(() => setView("analysis"), 2000);
        },
        onError: () => setView("hero"),
      }
    );
  }, [input, chatMutation, createConversation, fingerprint]);

  /* ══ HERO VIEW ══ */
  if (view === "hero") {
    return (
      <div>

        {/* ── HERO SECTION ── */}
        <section className="relative overflow-hidden" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>

          {/* Background ambient glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl"
              style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
            />
            <div
              className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full opacity-6 blur-3xl"
              style={{ background: "radial-gradient(circle, #A8893A 0%, transparent 70%)" }}
            />
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(201,168,76,1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)
                `,
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          <div className="container-apple relative z-10 py-32 text-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Badge */}
              <div className="mb-8 inline-flex">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full"
                  style={{
                    background: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    color: "#C9A84C",
                    letterSpacing: "0.05em",
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  أول مستشار قانوني ذكي في السعودية
                </span>
              </div>

              {/* Headline */}
              <h1 className="headline-hero mb-6">
                استشارتك القانونية{" "}
                <span className="text-gradient-gold">
                  بذكاء اصطناعي
                </span>
              </h1>

              {/* Sub */}
              <p className="body-large mx-auto mb-12">
                اكتب قضيتك بالعربية — وسيقوم مسؤول بتحليلها قانونياً من خلال ٣ مراحل ذكية،
                مع الاستشهاد بالأنظمة السعودية
              </p>

              {/* Input box */}
              <motion.div
                className="max-w-2xl mx-auto mb-8"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div
                  className="relative rounded-2xl p-px"
                  style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.05), rgba(201,168,76,0.3))" }}
                >
                  <div className="rounded-2xl" style={{ backgroundColor: "#111111" }}>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                      placeholder="اكتب قضيتك هنا — مثال: تعرضت لاحتيال إلكتروني وأريد معرفة خياراتي القانونية..."
                      rows={4}
                      className="w-full px-6 py-5 text-sm bg-transparent resize-none outline-none"
                      style={{ color: "#F0EAD8", lineHeight: "1.7" }}
                    />
                    <div
                      className="flex items-center justify-between px-4 pb-4"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <span className="text-xs" style={{ color: "#3A3530" }}>
                        {input.length > 0 ? `${input.length} حرف` : "اضغط Enter للإرسال"}
                      </span>
                      <button
                        onClick={handleSubmit}
                        disabled={!input.trim() || chatMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                        style={{
                          background: input.trim() ? "linear-gradient(135deg, #C9A84C, #A8893A)" : "rgba(255,255,255,0.05)",
                          color: input.trim() ? "#0A0A0A" : "#3A3530",
                          cursor: input.trim() ? "pointer" : "not-allowed",
                          boxShadow: input.trim() ? "0 4px 16px rgba(201,168,76,0.3)" : "none",
                        }}
                      >
                        <Brain className="w-4 h-4" />
                        حلّل قضيتي
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                <span className="text-xs ml-1" style={{ color: "#3A3530" }}>أمثلة:</span>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-1.5 text-xs rounded-full transition-all duration-200"
                    style={{
                      color: "#9A8F7A",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#C9A84C";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(201,168,76,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#9A8F7A";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)";
                    }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>

              {/* CTA Links */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/ai-advisor" className="btn-apple-secondary">
                  المستشار المتكامل
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <Link to="/services" className="text-sm transition-colors" style={{ color: "#5A5248" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#9A8F7A")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5248")}
                >
                  استكشف خدماتنا ←
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gold divider */}
        <div className="gold-divider" />

        {/* ── STATS SECTION ── */}
        <section className="py-20" style={{ backgroundColor: "#080808" }}>
          <div className="container-apple">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { end: 257, suffix: "+", label: "مادة قانونية", duration: 2 },
                { end: 8, suffix: "", label: "أنظمة سعودية", duration: 1.5 },
                { end: 3, suffix: "", label: "مراحل تحليل", duration: 1.2 },
                { end: null, suffix: null, label: "الرد فوري", duration: 0 },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  {stat.end !== null ? (
                    <AnimatedCounter
                      end={stat.end}
                      suffix={stat.suffix || ""}
                      duration={stat.duration}
                      className="text-4xl font-bold text-gradient-gold"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gradient-gold">فوري</span>
                  )}
                  <p className="text-sm mt-2" style={{ color: "#5A5248" }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gold divider */}
        <div className="gold-divider" />

        {/* ── HOW IT WORKS ── */}
        <section className="section-apple">
          <div className="container-apple text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="badge-apple mb-4">كيف يعمل؟</span>
              <h2 className="headline-section mt-4 mb-4">تحليل في ثلاث مراحل</h2>
              <p className="body-large mx-auto">منهجية احترافية مبنية على أفضل الممارسات القانونية</p>
            </motion.div>
          </div>

          <div className="container-apple grid-clean">
            {[
              {
                num: "١",
                title: "تحليل عميق",
                desc: "نقرأ القضية بعمق ونحدد نوعها القانوني والأنظمة السعودية المنطبقة عليها",
                color: "#C9A84C",
              },
              {
                num: "٢",
                title: "تفكير استراتيجي",
                desc: "نقيّم المخاطر والبدائل ونحدد السيناريوهات المتوقعة ونقاط القوة والضعف",
                color: "#E5C97A",
              },
              {
                num: "٣",
                title: "رد احترافي",
                desc: "نقدم تحليلاً منظماً مع خطة عمل واضحة وإجراءات قابلة للتنفيذ فوراً",
                color: "#A8893A",
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="card-apple p-8 text-center relative overflow-hidden group"
              >
                {/* Glow top */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }}
                />
                <span
                  className="text-5xl font-bold mb-6 block"
                  style={{ color: "rgba(201,168,76,0.15)" }}
                >
                  {step.num}
                </span>
                <h3 className="text-lg font-bold mb-3" style={{ color: "#F0EAD8" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#5A5248" }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="section-apple" style={{ backgroundColor: "#080808" }}>
          <div className="container-apple text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="badge-apple mb-4">المميزات</span>
              <h2 className="headline-section mt-4 mb-4">لماذا مسؤول؟</h2>
              <p className="body-large mx-auto">تقنية متقدمة مصممة للبيئة القانونية السعودية</p>
            </motion.div>
          </div>

          <div className="container-apple grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="card-apple p-6 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: "#C9A84C" }} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: "#F0EAD8" }}>
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#5A5248" }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Gold divider */}
        <div className="gold-divider" />

        {/* ── CTA SECTION ── */}
        <section className="section-apple relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)",
            }}
          />
          <div className="container-apple text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="headline-section mb-4">جاهز للتحليل القانوني؟</h2>
              <p className="body-large mx-auto mb-10">
                ابدأ الآن — تحليل فوري، دقيق، مبني على الأنظمة السعودية. مجاني ومتاح على مدار الساعة.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="btn-apple text-base px-8 py-4"
                >
                  <Brain className="w-5 h-5" />
                  ابدأ التحليل الآن
                </button>
                <Link to="/contact" className="btn-apple-secondary text-base px-8 py-4">
                  <Phone className="w-5 h-5" />
                  تواصل مع محامٍ
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    );
  }

  /* ══ THINKING VIEW ══ */
  if (view === "thinking") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          {/* Animated gold ring */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                border: "2px solid rgba(201,168,76,0.1)",
                borderTopColor: "#C9A84C",
              }}
            />
            <div
              className="absolute inset-2 rounded-full animate-spin"
              style={{
                border: "1px solid rgba(201,168,76,0.05)",
                borderBottomColor: "rgba(201,168,76,0.4)",
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-6 h-6" style={{ color: "#C9A84C" }} />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-3" style={{ color: "#F0EAD8" }}>
            جاري التحليل القانوني
          </h2>
          <p className="text-sm" style={{ color: "#5A5248" }}>
            المرور على المراحل الثلاث للتحليل العميق...
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#C9A84C" }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ══ ANALYSIS VIEW ══ */
  return (
    <div className="pb-20" style={{ backgroundColor: "#0A0A0A" }}>

      {/* Header bar */}
      <header
        className="flex items-center justify-between px-6 sm:px-8 py-4"
        style={{ borderBottom: "1px solid rgba(201,168,76,0.1)", backgroundColor: "#080808" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}
          >
            <Brain className="w-4 h-4" style={{ color: "#0A0A0A" }} />
          </div>
          <span className="text-sm font-bold" style={{ color: "#F0EAD8" }}>مسؤول — نتائج التحليل</span>
        </div>
        <button
          onClick={() => { setView("hero"); setInput(""); setSections([]); setClassification(null); setLeadTriggered(false); }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-full transition-all duration-200"
          style={{
            color: "#9A8F7A",
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          قضية جديدة
        </button>
      </header>

      <div className="container-apple py-10">

        {/* Lead CTA Banner */}
        <AnimatePresence>
          {leadTriggered && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mb-8 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(168,137,58,0.06))",
                border: "1px solid rgba(201,168,76,0.25)",
              }}
            >
              <div className="flex-1">
                <p className="text-sm font-bold mb-1" style={{ color: "#E5C97A" }}>
                  قضيتك تستدعي متابعة فورية
                </p>
                <p className="text-xs" style={{ color: "#9A8F7A" }}>
                  بناءً على درجة المخاطر — ننصح بالتواصل مع محامٍ متخصص من فريق مسؤول
                </p>
              </div>
              <Link
                to="/contact"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold flex-shrink-0 transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                  color: "#0A0A0A",
                  boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
                }}
              >
                <Phone className="w-3.5 h-3.5" />
                تواصل الآن
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Classification badges */}
        {classification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            <span className="badge-apple">
              {CASE_TYPE_LABELS[classification.caseType] || classification.caseType}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: (classification.riskLevel === "high" || classification.riskLevel === "critical")
                  ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                color: (classification.riskLevel === "high" || classification.riskLevel === "critical")
                  ? "#ef4444" : "#9A8F7A",
                border: `1px solid ${(classification.riskLevel === "high" || classification.riskLevel === "critical") ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              المخاطر: {RISK_LABELS[classification.riskLevel]}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: (classification.urgencyLevel === "urgent" || classification.urgencyLevel === "high")
                  ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                color: (classification.urgencyLevel === "urgent" || classification.urgencyLevel === "high")
                  ? "#ef4444" : "#9A8F7A",
                border: `1px solid ${(classification.urgencyLevel === "urgent" || classification.urgencyLevel === "high") ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              العجلة: {URGENCY_LABELS[classification.urgencyLevel]}
            </span>
          </motion.div>
        )}

        {/* KB Badge */}
        {kbUsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-4 mb-8 rounded-xl"
            style={{
              backgroundColor: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.12)",
            }}
          >
            <BookOpen className="w-4 h-4" style={{ color: "#22c55e" }} />
            <span className="text-xs" style={{ color: "#16a34a" }}>
              التحليل مبني على {kbCount} مادة من قاعدة المعرفة القانونية
            </span>
          </motion.div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl"
            style={{
              backgroundColor: "#111111",
              border: "1px solid rgba(201,168,76,0.12)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}
              >
                <Brain className="w-3 h-3" style={{ color: "#0A0A0A" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: "#C9A84C" }}>تحليل مسؤول</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#9A8F7A" }}>{aiResponse}</p>
          </motion.div>
        )}

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section, i) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-apple p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: "linear-gradient(180deg, #C9A84C, #A8893A)" }}
                />
                <h3 className="text-sm font-bold" style={{ color: "#F0EAD8" }}>
                  {section.label}
                </h3>
              </div>
              <RichText text={section.content} />
            </motion.div>
          ))}
        </div>

        {/* Document Upload */}
        <div className="mt-10">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                <FileText className="w-4 h-4" style={{ color: "#C9A84C" }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: "#F0EAD8" }}>رفع مستند قانوني</h3>
            </div>
            <DocumentUploadZone />
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => { setView("hero"); setInput(""); setSections([]); setClassification(null); setLeadTriggered(false); }}
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "#5A5248" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5248")}
          >
            <ArrowLeft className="w-4 h-4" />
            تحليل قضية جديدة
          </button>
        </div>
      </div>
    </div>
  );
}
