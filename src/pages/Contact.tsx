import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send, MessageSquare,
  CheckCircle2, ArrowLeft, ChevronLeft, Building2,
} from "lucide-react";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";

const contactItems = [
  {
    icon: <Phone className="w-5 h-5" />,
    label: "الهاتف",
    value: "920-0XX-XXX",
    sub: "الأحد — الخميس، ٩ص — ٦م",
    color: "#171717",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: "البريد الإلكتروني",
    value: "info@masoul-law.sa",
    sub: "نرد خلال ٢٤ ساعة",
    color: "#171717",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "العنوان",
    value: "الرياض، المملكة العربية السعودية",
    sub: "خدمات في جميع المناطق",
    color: "#171717",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: "ساعات العمل",
    value: "السبت — الخميس",
    sub: "٩:٠٠ ص — ٦:٠٠ م",
    color: "#171717",
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLead.mutate({
      caseType: subject || "general",
      issueSummary: message,
      riskLevel: "low",
      urgencyLevel: "low",
      contactName: name || undefined,
      contactPhone: phone || undefined,
      contactEmail: email || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#f0fdf4] border-4 border-[#86efac]">
            <CheckCircle2 className="w-9 h-9 text-[#16a34a]" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>تم إرسال رسالتك</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            شكراً لتواصلك معنا. سنقوم بالرد عليك خلال ٢٤ ساعة.
          </p>
          <Link to="/" className="btn-apple">
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(to bottom, #fafafa, #ffffff)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="badge-apple mb-5 inline-flex gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              تواصل معنا
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
              نحن هنا لمساعدتك
            </h1>
            <p className="text-lg leading-relaxed mx-auto max-w-xl" style={{ color: "var(--text-secondary)" }}>
              سواء كان لديك سؤال قانوني أو تحتاج إلى استشارة — فريقنا جاهز للرد عليك
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Contact Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {contactItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
              className="card-apple p-5 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <span style={{ color: "var(--text-primary)" }}>{item.icon}</span>
              </div>
              <div>
                <div className="text-[11px] font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>{item.label}</div>
                <div className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{item.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{item.sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="card-apple p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <Send className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>أرسل رسالة</h2>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>نرد في غضون ٢٤ ساعة</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>الاسم الكريم *</label>
                    <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك" className="input-apple" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>رقم الجوال</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" dir="ltr" className="input-apple" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>البريد الإلكتروني *</label>
                  <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr" className="input-apple" />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>الموضوع *</label>
                  <Input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع الرسالة" className="input-apple" />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>الرسالة *</label>
                  <Textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    rows={5}
                    className="input-apple resize-none"
                  />
                </div>

                {createLead.isError && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>حدث خطأ أثناء الإرسال، حاول مرة أخرى</p>
                )}

                <button
                  type="submit"
                  disabled={createLead.isPending}
                  className="btn-apple w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createLead.isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      جاري الإرسال...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* AI Advisor CTA */}
            <div className="rounded-2xl p-6 border" style={{ background: "linear-gradient(135deg, #171717, #374151)", borderColor: "#374151" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">تحليل فوري بالذكاء الاصطناعي</h3>
              <p className="text-xs leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                احصل على تحليل قانوني مُنظّم لقضيتك في ثوانٍ — مجاناً وبشكل فوري
              </p>
              <Link
                to="/ai-advisor"
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white" }}
              >
                جرّب الآن
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Office Info */}
            <div className="card-apple p-6">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>شركة مسؤول للمحاماة</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "الترخيص", value: "مرخصة من وزارة العدل" },
                  { label: "التأسيس", value: "الرياض، المملكة العربية السعودية" },
                  { label: "التخصص", value: "جنائي • مدني • عمالي • تجاري" },
                  { label: "التغطية", value: "جميع مناطق المملكة" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start">
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{item.label}</span>
                    <span className="text-xs font-medium text-left" style={{ color: "var(--text-secondary)", maxWidth: "55%" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Review CTA */}
            <Link
              to="/case-review"
              className="card-apple p-5 flex items-center gap-4 group cursor-pointer block"
              style={{ textDecoration: "none" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <Send className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>اطلب مراجعة قضيتك</div>
                <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>تقييم من فريق متخصص خلال ٢٤ ساعة</div>
              </div>
              <ChevronLeft className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-1" style={{ color: "var(--text-tertiary)" }} />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
