import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  Shield, Send, User, Phone, Mail, FileText, ArrowLeft,
  CheckCircle2, Clock, AlertTriangle, Brain, Scale,
  ChevronDown, ChevronUp, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import GlowCard from "@/components/GlowCard";
import { useTheme } from "@/contexts/ThemeContext";

/* ── Variants ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const staggerWrap = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ── Data ─────────────────────────────────────────────── */
const caseTypes = [
  { value: "cybercrime",  label: "جرائم إلكترونية",    icon: <Shield className="w-5 h-5" />,    accent: "#4EA8DE", sub: "ابتزاز، احتيال، تهديدات" },
  { value: "enforcement", label: "تنفيذ / ديون",        icon: <Scale className="w-5 h-5" />,     accent: "#c9a84c", sub: "حجز أموال، منع سفر" },
  { value: "labor",       label: "قضية عمالية",         icon: <FileText className="w-5 h-5" />,  accent: "#17B26A", sub: "فصل، مستحقات" },
  { value: "drugs",       label: "مخدرات",              icon: <AlertTriangle className="w-5 h-5" />, accent: "#F59E0B", sub: "حيازة، اتجار" },
  { value: "civil",       label: "قضية مدنية",          icon: <FileText className="w-5 h-5" />,  accent: "#4EA8DE", sub: "عقود، إيجار" },
  { value: "criminal",    label: "قضية جنائية",         icon: <AlertTriangle className="w-5 h-5" />, accent: "#F04438", sub: "إجراءات، حقوق" },
  { value: "commercial",  label: "قضية تجارية",         icon: <Scale className="w-5 h-5" />,     accent: "#c9a84c", sub: "شركات، تحكيم" },
  { value: "family",      label: "أحوال شخصية",         icon: <User className="w-5 h-5" />,      accent: "#17B26A", sub: "طلاق، حضانة" },
  { value: "other",       label: "أخرى",                icon: <ChevronRight className="w-5 h-5" />, accent: "#64748B", sub: "غير مصنفة" },
];

const faqs = [
  { q: "كم تستغرق مراجعة القضية؟",               a: "نقوم بالرد خلال ٢٤ ساعة عمل. القضايا العاجلة تُعالج خلال ٤ ساعات." },
  { q: "هل الاستشارة الأولية مجانية؟",            a: "نعم، التقييم الأولي لقضيتك مجاني. نحدد لك المسار القانوني ونقدم تقديراً للتكاليف." },
  { q: "هل يكفي المستشار الذكي بدون محامٍ؟",     a: "المستشار الذكي يقدم تحليلاً مبدئياً ممتازاً. لكن القضايا المعقدة تحتاج إلى محامٍ مرخص." },
  { q: "هل تغطون جميع مناطق السعودية؟",           a: "نعم، نقدم خدماتنا في جميع مناطق المملكة العربية السعودية." },
];

const STEPS = [
  { num: 1, label: "نوع القضية" },
  { num: 2, label: "التفاصيل" },
  { num: 3, label: "التواصل" },
];

/* ── Success screen ───────────────────────────────────── */
function SuccessScreen() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.65, type: "spring", stiffness: 150 }}
        className="text-center max-w-md"
      >
        {/* Animated rings */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.6 + i * 0.4, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(23,178,106,0.15)" }}
            />
          ))}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "rgba(23,178,106,0.12)", border: "1px solid rgba(23,178,106,0.3)" }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: "#17B26A" }} />
          </motion.div>
        </div>

        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          تم استلام طلبك بنجاح
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="text-sm leading-loose mb-4" style={{ color: "var(--text-muted)" }}>
          سيقوم فريق شركة مسؤول للمحاماة بمراجعة قضيتك والتواصل معك خلال ٢٤ ساعة.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs mb-8"
          style={{ background: "rgba(23,178,106,0.1)", color: "#17B26A", border: "1px solid rgba(23,178,106,0.2)" }}
        >
          <Clock className="w-3 h-3" />
          للقضايا العاجلة: ٤ ساعات فقط
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/ai-advisor"
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-sm"
            style={{ background: "linear-gradient(135deg, #c9a84c, #a88a3a)", color: "#000" }}
          >
            <Brain className="w-4 h-4" />
            جرّب المستشار الذكي
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 text-sm rounded-sm transition-colors"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Step indicator ───────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const done   = step.num < current;
        const active = step.num === current;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  background: done ? "#17B26A" : active ? "#c9a84c" : "var(--bg-card)",
                  borderColor: done ? "#17B26A" : active ? "#c9a84c" : "var(--border-default)",
                  scale: active ? 1.15 : 1,
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ border: "2px solid", color: done || active ? "#000" : "var(--text-faint)" }}
              >
                {done ? <CheckCircle2 className="w-4 h-4" style={{ color: "#fff" }} /> : step.num}
              </motion.div>
              <span className="text-[9px] whitespace-nowrap font-mono-ar"
                style={{ color: active ? "#c9a84c" : done ? "#17B26A" : "var(--text-faint)" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <motion.div
                animate={{ background: done ? "#17B26A" : "var(--border-subtle)" }}
                className="h-0.5 w-16 sm:w-24 mb-5 mx-2 transition-colors duration-500"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function CaseReview() {
  const [step, setStep] = useState<"form" | "submitted">("form");
  const [currentStep, setCurrentStep] = useState(1);
  const [caseType, setCaseType]         = useState("");
  const [description, setDescription]   = useState("");
  const [contactName, setContactName]   = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [openFaq, setOpenFaq]           = useState<number | null>(null);
  useTheme();

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => setStep("submitted"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseType || !description || (!contactPhone && !contactEmail)) return;

    const caseTypeLabel = caseTypes.find((c) => c.value === caseType)?.label ?? caseType;
    const riskLevel     = description.includes("عاجل") || description.includes("فوري") ? "high" : "medium";
    const urgencyLevel  = description.includes("عاجل") || description.includes("فوري") ? "urgent"
                        : description.includes("قريب") ? "high" : "medium";

    createLead.mutate({
      caseType: caseTypeLabel,
      issueSummary: description,
      riskLevel:    riskLevel    as "low" | "medium" | "high" | "critical",
      urgencyLevel: urgencyLevel as "low" | "medium" | "high" | "urgent",
      contactName:  contactName  || undefined,
      contactPhone: contactPhone || undefined,
      contactEmail: contactEmail || undefined,
    });
  };

  if (step === "submitted") return <SuccessScreen />;

  return (
    <div className="pb-20 overflow-hidden">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(to right, transparent, var(--border-hover), transparent)" }} />
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.07, 0.04] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, #c9a84c, transparent)", filter: "blur(100px)" }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <span
              className="inline-flex items-center gap-2 text-[10px] font-mono-ar tracking-[0.2em] uppercase mb-6 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c" }}
            >
              <Shield className="w-3 h-3" />
              مراجعة قضيتك
            </span>
            <h1 className="text-3xl sm:text-5xl font-black mb-4" style={{ color: "var(--text-primary)", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              اطلب <span className="text-gradient">مراجعة خبير</span>
            </h1>
            <p className="text-sm max-w-lg mx-auto leading-loose" style={{ color: "var(--text-muted)" }}>
              قدم لنا تفاصيل قضيتك وسيقوم فريقنا القانوني المتخصص بمراجعة شاملة
              والتواصل معك بخطة عمل واضحة
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* ── Form (3/5) ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3"
          >
            <GlowCard glowColor="#c9a84c" intensity={0.25}>
              <div className="p-6 sm:p-8">
                {/* Step header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.14)", color: "#c9a84c" }}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono-ar tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>مراجعة قانونية</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>تفاصيل قضيتك</p>
                  </div>
                </div>

                {/* Step indicator */}
                <StepIndicator current={currentStep} />

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Case type */}
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div key="step1" variants={staggerWrap} initial="hidden" animate="show" exit={{ opacity: 0, y: -16 }}>
                        <p className="text-[11px] font-mono-ar tracking-widest uppercase mb-4" style={{ color: "var(--text-faint)" }}>
                          اختر نوع القضية *
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {caseTypes.map((ct) => {
                            const selected = caseType === ct.value;
                            return (
                              <motion.button
                                key={ct.value}
                                type="button"
                                variants={fadeUp}
                                onClick={() => setCaseType(ct.value)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex flex-col items-start gap-2 p-3.5 rounded-xl text-right cursor-pointer transition-all duration-200"
                                style={{
                                  background: selected ? `${ct.accent}12` : "var(--bg-input)",
                                  border: `1px solid ${selected ? ct.accent + "50" : "var(--border-default)"}`,
                                  boxShadow: selected ? `0 0 16px ${ct.accent}18` : "none",
                                }}
                              >
                                <span style={{ color: selected ? ct.accent : "var(--text-faint)" }}>{ct.icon}</span>
                                <div>
                                  <p className="text-xs font-semibold" style={{ color: selected ? ct.accent : "var(--text-secondary)" }}>
                                    {ct.label}
                                  </p>
                                  <p className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>{ct.sub}</p>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                        <div className="mt-6 flex justify-start">
                          <Button
                            type="button"
                            disabled={!caseType}
                            onClick={() => setCurrentStep(2)}
                            className="cursor-pointer font-semibold text-sm rounded-sm px-6"
                            style={{ background: caseType ? "linear-gradient(135deg, #c9a84c, #a88a3a)" : undefined, color: caseType ? "#000" : undefined }}
                          >
                            التالي
                            <ChevronRight className="w-4 h-4 mr-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Description */}
                    {currentStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}>
                        <div>
                          <label className="block text-[11px] font-mono-ar uppercase mb-2" style={{ color: "var(--text-faint)" }}>
                            ملخص القضية *
                          </label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="اشرح قضيتك بإيجاز: ما الذي حدث؟ متى؟ وما موقفك الحالي؟"
                            rows={6}
                            className="text-right resize-none"
                            style={{
                              background: "var(--bg-input)",
                              borderColor: "var(--border-default)",
                              color: "var(--text-primary)",
                            }}
                          />
                          <p className="text-[10px] mt-2" style={{ color: "var(--text-faint)" }}>
                            {description.length} حرف — كلما كانت التفاصيل أوضح، كان التحليل أدق
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                          <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="cursor-pointer text-sm rounded-sm"
                            style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}>
                            السابق
                          </Button>
                          <Button type="button" disabled={description.length < 20} onClick={() => setCurrentStep(3)}
                            className="cursor-pointer font-semibold text-sm rounded-sm px-6"
                            style={{ background: description.length >= 20 ? "linear-gradient(135deg, #c9a84c, #a88a3a)" : undefined, color: description.length >= 20 ? "#000" : undefined }}>
                            التالي
                            <ChevronRight className="w-4 h-4 mr-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Contact */}
                    {currentStep === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-mono-ar uppercase mb-2" style={{ color: "var(--text-faint)" }}>الاسم</label>
                          <div className="relative">
                            <User className="absolute top-1/2 right-3 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-faint)" }} />
                            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="الاسم الكريم (اختياري)"
                              className="text-right pr-9" style={{ background: "var(--bg-input)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-mono-ar uppercase mb-2" style={{ color: "var(--text-faint)" }}>الهاتف *</label>
                            <div className="relative">
                              <Phone className="absolute top-1/2 right-3 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-faint)" }} />
                              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="05XXXXXXXX"
                                className="pr-9" dir="ltr" style={{ background: "var(--bg-input)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono-ar uppercase mb-2" style={{ color: "var(--text-faint)" }}>البريد</label>
                            <div className="relative">
                              <Mail className="absolute top-1/2 right-3 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-faint)" }} />
                              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com"
                                className="pr-9" dir="ltr" style={{ background: "var(--bg-input)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                          <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="cursor-pointer text-sm rounded-sm"
                            style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}>
                            السابق
                          </Button>
                          <Button type="submit" disabled={!caseType || !description || (!contactPhone && !contactEmail) || createLead.isPending}
                            className="cursor-pointer font-semibold text-sm rounded-sm px-6 flex items-center gap-2"
                            style={{ background: "linear-gradient(135deg, #c9a84c, #a88a3a)", color: "#000" }}>
                            {createLead.isPending ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <Scale className="w-4 h-4" />
                              </motion.div>
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            إرسال الطلب
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </GlowCard>
          </motion.div>

          {/* ── Sidebar (2/5) ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Trust signals */}
            <GlowCard glowColor="#17B26A" intensity={0.2}>
              <div className="p-5 space-y-3">
                <p className="text-[10px] font-mono-ar tracking-[0.2em] uppercase mb-4" style={{ color: "var(--text-faint)" }}>لماذا مسؤول؟</p>
                {[
                  { icon: <Clock className="w-4 h-4" />,        accent: "#4EA8DE", text: "رد خلال ٢٤ ساعة عمل" },
                  { icon: <Shield className="w-4 h-4" />,       accent: "#17B26A", text: "سرية تامة لبياناتك" },
                  { icon: <CheckCircle2 className="w-4 h-4" />, accent: "#c9a84c", text: "تقييم أولي مجاني" },
                  { icon: <AlertTriangle className="w-4 h-4" />, accent: "#F59E0B", text: "تغطية لجميع المناطق" },
                ].map((item) => (
                  <motion.div
                    key={item.text}
                    whileHover={{ x: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex items-center gap-3 cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.accent}12`, color: item.accent }}>
                      {item.icon}
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </GlowCard>

            {/* FAQ */}
            <GlowCard glowColor="#4EA8DE" intensity={0.15}>
              <div className="p-5">
                <p className="text-[10px] font-mono-ar tracking-[0.2em] uppercase mb-4" style={{ color: "var(--text-faint)" }}>أسئلة شائعة</p>
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-right cursor-pointer transition-colors"
                        style={{ background: openFaq === i ? "var(--bg-card-hover)" : "transparent" }}
                      >
                        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{faq.q}</span>
                        <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: "var(--text-faint)", flexShrink: 0 }}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-3 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </GlowCard>

            {/* AI Advisor shortcut */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/ai-advisor" className="block">
                <div className="p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid rgba(139,92,246,0.2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)", color: "#8B5CF6" }}>
                      <Brain className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>تحليل فوري بالذكاء الاصطناعي</p>
                  </div>
                  <p className="text-xs leading-relaxed mr-12" style={{ color: "var(--text-faint)" }}>
                    لا تنتظر — احصل على تحليل قانوني خلال ثوانٍ
                  </p>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
