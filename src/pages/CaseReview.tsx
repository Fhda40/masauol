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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: "#22c55e" }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            تم استلام طلبك بنجاح
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            سيقوم فريق شركة مسؤول للمحاماة بمراجعة قضيتك والتواصل معك خلال ٢٤ ساعة.
            للقضايا العاجلة، نتواصل خلال ٤ ساعات.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/ai-advisor" className="btn-apple">
              <Brain className="w-4 h-4" />
              جرّب المستشار الذكي
            </Link>
            <Link to="/" className="btn-apple-secondary">
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
      <section className="section-apple">
        <div className="container-apple text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="badge-apple mb-4 inline-flex">
              <Scale className="w-3.5 h-3.5" />
              مراجعة قضيتك
            </span>
            <h1 className="headline-hero mb-4">
              اطلب <span style={{ color: "var(--text-primary)" }}>مراجعة خبير</span>
            </h1>
            <p className="body-large mx-auto">
              قدم لنا تفاصيل قضيتك وسيقوم فريقنا القانوني المتخصص بمراجعة شاملة والتواصل معك بخطة عمل واضحة
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-apple">
        <div className="grid lg:grid-cols-5 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="lg:col-span-3">
            <div className="card-apple">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>نموذج المراجعة</h2>
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>جميع البيانات سرية ومشفرة</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>نوع القضية *</label>
                    <select
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-sm text-right appearance-none outline-none"
                      style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                    >
                      <option value="" style={{ backgroundColor: "var(--bg-primary)" }}>اختر نوع القضية</option>
                      {caseTypes.map((ct) => (
                        <option key={ct.value} value={ct.value} style={{ backgroundColor: "var(--bg-primary)" }}>{ct.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>وصف القضية *</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="صف قضيتك بالتفصيل — الوقائع، التواريخ، الأطراف المعنية، الوثائق المتوفرة..."
                      rows={5}
                      className="text-right resize-none input-apple"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>الاسم</label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                        <Input
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="الاسم الكريم"
                          className="pr-10 text-right input-apple"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>رقم الجوال *</label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                        <Input
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="05xxxxxxxx"
                          dir="ltr"
                          className="pr-10 text-right input-apple"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                      <Input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="email@example.com"
                        dir="ltr"
                        className="pr-10 text-right input-apple"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createLead.isPending || !caseType || !description || (!contactPhone && !contactEmail)}
                    className="w-full h-11 text-sm font-semibold rounded-full"
                    style={{ backgroundColor: "#171717", color: "white" }}
                  >
                    {createLead.isPending ? "جاري الإرسال..." : "إرسال طلب المراجعة"}
                    <Send className="w-4 h-4 mr-2" />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="lg:col-span-2 space-y-4">
            <div className="card-apple">
              <div className="p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>ما تحصل عليه</h3>
                <div className="space-y-3">
                  {[
                    { icon: <FileText className="w-4 h-4" />, text: "تقييم قانوني مفصل من فريق متخصص" },
                    { icon: <Clock className="w-4 h-4" />, text: "رد خلال ٢٤ ساعة (٤ ساعات للعاجل)" },
                    { icon: <Shield className="w-4 h-4" />, text: "خطة عمل واضحة مع جدول زمني" },
                    { icon: <AlertTriangle className="w-4 h-4" />, text: "تحديد المخاطر والبدائل القانونية" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                        {item.icon}
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-apple">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>تحليل فوري</h3>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                  إذا كنت تريد تحليلاً فورياً، جرّب المستشار القانوني الذكي. يقدم تحليلاً مُنظّماً في ثوانٍ.
                </p>
                <Link to="/ai-advisor" className="inline-flex items-center gap-2 text-xs transition-colors" style={{ color: "var(--text-primary)" }}>
                  <ArrowLeft className="w-3 h-3" />
                  جرّب المستشار الذكي
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>أسئلة شائعة</h3>
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="card-apple cursor-pointer"
                  onClick={() => setShowFaq(showFaq === i ? null : i)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{faq.q}</span>
                      {showFaq === i
                        ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
                        : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
                      }
                    </div>
                    {showFaq === i && (
                      <p className="text-xs mt-2 pt-2 leading-relaxed" style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border-light)" }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
