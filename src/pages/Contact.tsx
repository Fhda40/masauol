import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle,
  Brain, Scale, Shield, MessageSquare, Loader2,
} from "lucide-react";

const CASE_TYPES = [
  "جريمة إلكترونية (ابتزاز / احتيال)",
  "تنفيذ وديون",
  "قضية عمالية",
  "أحوال شخصية (طلاق / حضانة)",
  "مخدرات / جنائي",
  "قضية تجارية",
  "مراجعة حكم قضائي",
  "استشارة قانونية عامة",
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", caseType: "", summary: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const leadMut = trpc.lead.create.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.summary.trim()) return;
    leadMut.mutate({
      caseType: form.caseType || "other",
      issueSummary: form.summary,
      riskLevel: "medium",
      urgencyLevel: "medium",
      contactName: form.name,
      contactPhone: form.phone,
      contactEmail: form.email || undefined,
    });
  };

  const inputStyle = (field: string) => ({
    background: focused === field ? "rgba(255,248,230,0.90)" : "rgba(255,255,255,0.78)",
    border: `1.5px solid ${focused === field ? "rgba(201,168,76,0.45)" : "rgba(201,168,76,0.15)"}`,
    boxShadow: focused === field ? "0 0 0 3px rgba(201,168,76,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
    color: "var(--text-primary)",
    outline: "none",
    transition: "all 0.25s ease",
    width: "100%",
    padding: "14px 18px",
    borderRadius: "16px",
    fontSize: "14px",
    fontFamily: "inherit",
  } as React.CSSProperties);

  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 55%)" }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-5" style={{ color: "var(--accent-gold)" }}>
              تواصل معنا
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold mb-5" style={{ fontFamily: "'EB Garamond', serif" }}>
              نحن هنا<br />
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D78A, #C9A84C)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>من أجلك</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              أرسل تفاصيل قضيتك وسيتواصل معك فريقنا القانوني خلال ٢٤ ساعة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-3">
              <div className="p-8 rounded-3xl relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  backdropFilter: "blur(20px) saturate(160%)",
                  boxShadow: "0 8px 40px rgba(201,168,76,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                }}>
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-16 text-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: "rgba(23,178,106,0.15)", border: "1px solid rgba(23,178,106,0.3)" }}>
                        <CheckCircle className="w-10 h-10" style={{ color: "#17B26A" }} />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'EB Garamond', serif" }}>
                        تم إرسال طلبك
                      </h3>
                      <p style={{ color: "var(--text-muted)" }}>
                        سيتواصل معك فريقنا القانوني خلال ٢٤ ساعة.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleSubmit}>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}>
                          <MessageSquare className="w-5 h-5" style={{ color: "#0A0A0A" }} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>أرسل طلبك</h2>
                          <p className="text-xs" style={{ color: "var(--text-faint)" }}>جميع المعلومات سرية</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                            الاسم الكامل *
                          </label>
                          <input type="text" value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                            placeholder="محمد العبدالله" required style={inputStyle("name")} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                            رقم الجوال *
                          </label>
                          <input type="tel" value={form.phone}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
                            placeholder="05XXXXXXXX" required style={inputStyle("phone")} />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                          البريد الإلكتروني (اختياري)
                        </label>
                        <input type="email" value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                          placeholder="name@email.com" style={inputStyle("email")} />
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                          نوع القضية
                        </label>
                        <select value={form.caseType}
                          onChange={e => setForm(p => ({ ...p, caseType: e.target.value }))}
                          onFocus={() => setFocused("caseType")} onBlur={() => setFocused(null)}
                          style={{ ...inputStyle("caseType"), cursor: "pointer" }}>
                          <option value="">اختر نوع القضية...</option>
                          {CASE_TYPES.map(t => (
                            <option key={t} value={t} style={{ background: "#fff", color: "#0F172A" }}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-6">
                        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                          ملخص القضية *
                        </label>
                        <textarea value={form.summary}
                          onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                          onFocus={() => setFocused("summary")} onBlur={() => setFocused(null)}
                          placeholder="اشرح قضيتك بإيجاز... (ما حدث، متى، وما تحتاجه)"
                          rows={4} required
                          style={{ ...inputStyle("summary"), resize: "none", lineHeight: "1.6" }} />
                      </div>

                      <div className="flex items-start gap-3 mb-6 p-4 rounded-2xl"
                        style={{ background: "rgba(23,178,106,0.05)", border: "1px solid rgba(23,178,106,0.12)" }}>
                        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#17B26A" }} />
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          معلوماتك محمية بالكامل ولن تُشارك مع أي طرف ثالث. نلتزم بسرية تامة لجميع الاستفسارات.
                        </p>
                      </div>

                      <button type="submit"
                        disabled={leadMut.isPending || !form.name || !form.phone || !form.summary}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all cursor-pointer"
                        style={{
                          background: (leadMut.isPending || !form.name || !form.phone || !form.summary)
                            ? "rgba(201,168,76,0.15)" : "linear-gradient(135deg, #C9A84C, #A8893A)",
                          color: (leadMut.isPending || !form.name || !form.phone || !form.summary)
                            ? "rgba(201,168,76,0.4)" : "#0A0A0A",
                          boxShadow: (leadMut.isPending || !form.name || !form.phone || !form.summary)
                            ? "none" : "0 8px 28px rgba(201,168,76,0.35)",
                        }}
                        onMouseEnter={e => {
                          if (!leadMut.isPending && form.name && form.phone && form.summary) {
                            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(201,168,76,0.5)";
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(201,168,76,0.35)";
                        }}>
                        {leadMut.isPending
                          ? <><Loader2 className="w-5 h-5 animate-spin" />جارٍ الإرسال...</>
                          : <><Send className="w-5 h-5" />إرسال الطلب</>}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-2 space-y-5">

              <div className="p-6 rounded-3xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(30,58,138,0.08) 100%)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}>
                <Brain className="w-8 h-8 mb-3" style={{ color: "#C9A84C" }} />
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'EB Garamond', serif" }}>
                  تريد إجابة فورية؟
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  المستشار الذكي يحلل قضيتك فوراً بدون انتظار.
                </p>
                <a href="/ai-advisor"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", color: "#0A0A0A" }}>
                  <Brain className="w-4 h-4" />
                  استشارة مجانية الآن
                </a>
              </div>

              <div className="p-6 rounded-3xl space-y-5"
                style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(201,168,76,0.12)", backdropFilter: "blur(12px)" }}>
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>معلومات التواصل</h3>
                {[
                  { icon: Phone,  label: "الهاتف",     val: "+966 550 341 728" },
                  { icon: Mail,   label: "البريد",     val: "info@masoul-law.sa" },
                  { icon: MapPin, label: "الموقع",     val: "الرياض، المملكة العربية السعودية" },
                  { icon: Clock,  label: "أوقات العمل", val: "السبت — الخميس: ٩ص — ٦م" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.15)" }}>
                      <item.icon className="w-4 h-4" style={{ color: "#C9A84C" }} />
                    </div>
                    <div>
                      <p className="text-[11px] mb-0.5" style={{ color: "var(--text-faint)" }}>{item.label}</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(201,168,76,0.12)", backdropFilter: "blur(12px)" }}>
                <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>لماذا مسؤول؟</h3>
                {[
                  "رد خلال ٢٤ ساعة مضمون",
                  "سرية تامة لجميع المعلومات",
                  "محامون متخصصون في كل مجال",
                  "تحليل مسبق بالذكاء الاصطناعي",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#17B26A" }} />
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>{f}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-3xl flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(201,168,76,0.12)", backdropFilter: "blur(10px)" }}>
                <Scale className="w-7 h-7 flex-shrink-0" style={{ color: "rgba(201,168,76,0.5)" }} />
                <div>
                  <p className="text-xs mb-0.5" style={{ color: "var(--text-faint)" }}>تحتاج تحديد نوع قضيتك؟</p>
                  <a href="/services" className="text-sm font-semibold cursor-pointer" style={{ color: "#C9A84C" }}>
                    تعرف على خدماتنا القانونية ←
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
