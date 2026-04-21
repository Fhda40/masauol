import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Shield, Send, User, Phone, Mail, FileText, ArrowLeft,
  CheckCircle2, Clock, AlertTriangle, Brain, Scale, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import GlowCard from "@/components/GlowCard";
import { useTheme } from "@/contexts/ThemeContext";

const caseTypes = [
  { value: "cybercrime", label: "جرائم إلكترونية (ابتزاز، احتيال، تهديدات)" },
  { value: "enforcement", label: "تنفيذ / ديون (حجز أموال، منع سفر)" },
  { value: "labor", label: "قضية عمالية (فصل، مستحقات)" },
  { value: "drugs", label: "مخدرات (حيازة، اتجار)" },
  { value: "civil", label: "قضية مدنية (عقود، إيجار)" },
  { value: "criminal", label: "قضية جنائية" },
  { value: "commercial", label: "قضية تجارية" },
  { value: "family", label: "أحوال شخصية" },
  { value: "other", label: "أخرى" },
];

export default function CaseReview() {
  const [step, setStep] = useState<"form" | "submitted">("form");
  const [caseType, setCaseType] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [showFaq, setShowFaq] = useState<number | null>(null);
  useTheme(); // triggers re-render on theme change

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => setStep("submitted"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseType || !description || (!contactPhone && !contactEmail)) return;

    const caseTypeLabel = caseTypes.find((c) => c.value === caseType)?.label ?? caseType;
    const riskLevel = description.includes("عاجل") || description.includes("فوري") ? "high" : "medium";
    const urgencyLevel = description.includes("عاجل") || description.includes("فوري") ? "urgent" : description.includes("قريب") ? "high" : "medium";

    createLead.mutate({
      caseType: caseTypeLabel,
      issueSummary: description,
      riskLevel: riskLevel as "low" | "medium" | "high" | "critical",
      urgencyLevel: urgencyLevel as "low" | "medium" | "high" | "urgent",
      contactName: contactName || undefined,
      contactPhone: contactPhone || undefined,
      contactEmail: contactEmail || undefined,
    });
  };

  const faqs = [
    { q: "كم تستغرق مراجعة القضية؟", a: "نقوم بالرد خلال ٢٤ ساعة عمل. القضايا العاجلة تُعالج خلال ٤ ساعات." },
    { q: "هل الاستشارة الأولية مجانية؟", a: "نعم، التقييم الأولي لقضيتك مجاني. نحدد لك المسار القانوني ونقدم تقديراً للتكاليف." },
    { q: "هل يكفي المستشار الذكي بدون محامي؟", a: "المستشار الذكي يقدم تحليلاً مبدئياً ممتازاً. لكن القضايا المعقدة أو التي تتطلب إجراءات رسمية تحتاج إلى محامٍ مرخص." },
    { q: "هل يغطي فريقكم جميع مناطق السعودية؟", a: "نعم، نقدم خدماتنا في جميع مناطق المملكة العربية السعودية." },
  ];

  if (step === "submitted") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #17B26A/20, #17B26A/5)", border: "1px solid #17B26A/20" }}
          >
            <CheckCircle2 className="w-8 h-8 text-[#17B26A]" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            تم استلام طلبك بنجاح
          </h2>
          <p className="text-sm leading-relaxed mb-8 body-text" style={{ color: "var(--text-muted)" }}>
            سيقوم فريق شركة مسؤول للمحاماة بمراجعة قضيتك والتواصل معك خلال ٢٤ ساعة.
            للقضايا العاجلة، نتواصل خلال ٤ ساعات.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/ai-advisor"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-sm"
              style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))", color: "var(--bg-primary)" }}
            >
              <Brain className="w-4 h-4" />
              جرّب المستشار الذكي
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 text-sm rounded-sm transition-colors"
              style={{ border: "1px solid var(--border-default)", color: "var(--text-muted)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(to right, transparent, var(--border-hover), transparent)" }} />
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--glow-gold) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <span className="text-xs tracking-widest uppercase mb-4 block" style={{ color: "var(--accent-gold)", fontFamily: "'IBM Plex Mono', monospace" }}>
              مراجعة قضيتك
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 hero-headline" style={{ color: "var(--text-primary)" }}>
              اطلب <span className="text-gradient">مراجعة خبير</span>
            </h1>
            <p className="text-sm max-w-lg mx-auto body-text" style={{ color: "var(--text-muted)" }}>
              قدم لنا تفاصيل قضيتك وسيقوم فريقنا القانوني المتخصص بمراجعة شاملة
              والتواصل معك بخطة عمل واضحة
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
            <GlowCard glowColor="var(--accent-gold)" intensity={0.25}>
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))" }}
                  >
                    <Scale className="w-5 h-5" style={{ color: "var(--bg-primary)" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                      نموذج المراجعة
                    </h2>
                    <p className="text-[10px] font-mono-ar" style={{ color: "var(--text-faint)" }}>جميع البيانات سرية ومشفرة</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>نوع القضية *</label>
                    <select
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value)}
                      className="w-full h-10 px-3 rounded-sm text-sm text-right appearance-none focus:outline-none input-themed"
                      style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                    >
                      <option value="" style={{ backgroundColor: "var(--bg-primary)" }}>اختر نوع القضية</option>
                      {caseTypes.map((ct) => (
                        <option key={ct.value} value={ct.value} style={{ backgroundColor: "var(--bg-primary)" }}>{ct.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>وصف القضية *</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="صف قضيتك بالتفصيل — الوقائع، التواريخ، الأطراف المعنية، الوثائق المتوفرة..."
                      rows={5}
                      className="text-right resize-none input-themed focus-visible:ring-[var(--accent-gold)]/30"
                      style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>الاسم</label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-faint)" }} />
                        <Input
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="الاسم الكريم"
                          className="pr-10 text-right input-themed"
                          style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>رقم الجوال *</label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-faint)" }} />
                        <Input
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="05xxxxxxxx"
                          dir="ltr"
                          className="pr-10 text-right input-themed"
                          style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-faint)" }} />
                      <Input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="email@example.com"
                        dir="ltr"
                        className="pr-10 text-right input-themed"
                        style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createLead.isPending || !caseType || !description || (!contactPhone && !contactEmail)}
                    className="w-full h-11 text-black font-semibold rounded-sm transition-all"
                    style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))" }}
                  >
                    {createLead.isPending ? "جاري الإرسال..." : "إرسال طلب المراجعة"}
                    <Send className="w-4 h-4 mr-2" />
                  </Button>
                </form>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 space-y-6">
            <GlowCard glowColor="var(--accent-gold)" intensity={0.2}>
              <div className="p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>ما تحصل عليه</h3>
                <div className="space-y-3">
                  {[
                    { icon: <FileText className="w-4 h-4" />, text: "تقييم قانوني مفصل من فريق متخصص" },
                    { icon: <Clock className="w-4 h-4" />, text: "رد خلال ٢٤ ساعة (٤ ساعات للعاجل)" },
                    { icon: <Shield className="w-4 h-4" />, text: "خطة عمل واضحة مع جدول زمني" },
                    { icon: <AlertTriangle className="w-4 h-4" />, text: "تحديد المخاطر والبدائل القانونية" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent-gold)/10" }}>
                        <span style={{ color: "var(--accent-gold)" }}>{item.icon}</span>
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlowCard>

            <GlowCard glowColor="#4EA8DE" intensity={0.2}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>تحليل فوري</h3>
                </div>
                <p className="text-xs leading-relaxed mb-4 body-text" style={{ color: "var(--text-muted)" }}>
                  إذا كنت تريد تحليلاً فورياً، جرّب المستشار القانوني الذكي.
                  يقدم تحليلاً مُنظّماً في ثوانٍ.
                </p>
                <Link to="/ai-advisor" className="inline-flex items-center gap-2 text-xs transition-colors" style={{ color: "var(--accent-blue)" }}>
                  <ArrowLeft className="w-3 h-3" />
                  جرّب المستشار الذكي
                </Link>
              </div>
            </GlowCard>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>أسئلة شائعة</h3>
              {faqs.map((faq, i) => (
                <GlowCard key={i} glowColor="var(--accent-gold)" intensity={0.1} delay={i * 0.05}>
                  <div className="p-4 cursor-pointer" onClick={() => setShowFaq(showFaq === i ? null : i)}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{faq.q}</span>
                      {showFaq === i
                        ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
                        : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
                      }
                    </div>
                    {showFaq === i && (
                      <p className="text-xs mt-2 pt-2 leading-relaxed body-text" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                </GlowCard>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
