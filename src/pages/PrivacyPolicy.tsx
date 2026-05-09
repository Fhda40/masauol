import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Mail, Phone } from "lucide-react";

const SECTIONS = [
  {
    icon: Database,
    title: "المعلومات التي نجمعها",
    content: [
      "بيانات الحساب: الاسم والبريد الإلكتروني وصورة الملف الشخصي عند تسجيل الدخول بـ Google.",
      "محتوى الاستشارات: النصوص التي تكتبها وملفات PDF التي ترفعها لأغراض التحليل القانوني.",
      "بيانات الجهاز: بصمة الجهاز (Device Fingerprint) للتعرف على المستخدمين بدون تسجيل.",
      "بيانات الاستخدام: وقت وتاريخ الاستشارات لأغراض التحسين والأمان.",
    ],
  },
  {
    icon: Eye,
    title: "كيف نستخدم معلوماتك",
    content: [
      "تقديم خدمة التحليل القانوني وحفظ سجل محادثاتك.",
      "تحسين دقة وجودة التحليل القانوني.",
      "التواصل معك في حال طلبت متابعة قانونية.",
      "الوقاية من الاستخدام المسيء وحماية النظام.",
    ],
  },
  {
    icon: Lock,
    title: "حماية معلوماتك",
    content: [
      "جميع البيانات مشفرة أثناء النقل باستخدام HTTPS/TLS.",
      "كلمات المرور مشفرة ببروتوكول bcrypt ولا يمكن الاطلاع عليها.",
      "الوصول إلى قاعدة البيانات محدود بصلاحيات مشددة.",
      "نظام حماية من الهجمات الآلية (Rate Limiting & Brute Force Protection).",
    ],
  },
  {
    icon: Shield,
    title: "مشاركة المعلومات",
    content: [
      "لا نبيع معلوماتك الشخصية لأي طرف ثالث.",
      "لا نشارك محتوى استشاراتك مع أي جهة خارجية.",
      "قد نستخدم خدمات معالجة ذكاء اصطناعي (OpenAI) لتقديم التحليل — وفق سياسة خصوصيتهم.",
      "في حالات نادرة، قد نُلزَم قانونياً بالإفصاح للجهات القضائية المختصة.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)",
        }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <Shield className="w-7 h-7" style={{ color: "#C9A84C" }} />
            </div>
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
              قانوني
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5" style={{ fontFamily: "'EB Garamond', serif" }}>
              سياسة الخصوصية
            </h1>
            <p className="text-base" style={{ color: "var(--text-muted)" }}>
              آخر تحديث: مايو ٢٠٢٥ — نلتزم بحماية خصوصيتك وسرية بياناتك.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 space-y-6">

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-7 rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(201,168,76,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              تصف هذه السياسة كيف تجمع شركة مسؤول للمحاماة وتستخدم وتحمي معلوماتك الشخصية عند استخدامك لمنصة مسؤول.
              باستخدامك للمنصة، توافق على ما ورد في هذه السياسة. إذا كانت لديك أي أسئلة، تواصل معنا.
            </p>
          </motion.div>

          {SECTIONS.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-7 rounded-3xl"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(201,168,76,0.10)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.20)" }}>
                  <section.icon className="w-5 h-5" style={{ color: "#C9A84C" }} />
                </div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "'EB Garamond', serif" }}>
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "#C9A84C" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-7 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(30,58,138,0.04) 100%)",
              border: "1px solid rgba(201,168,76,0.15)",
            }}
          >
            <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "'EB Garamond', serif" }}>
              حقوقك
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "حق الوصول لبياناتك الشخصية",
                "حق تصحيح المعلومات غير الدقيقة",
                "حق حذف حسابك وبياناتك",
                "حق الاعتراض على معالجة بياناتك",
              ].map((right, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(201,168,76,0.10)" }}>
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#17B26A" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{right}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-7 rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(201,168,76,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>
              للتواصل بشأن الخصوصية
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <Mail className="w-4 h-4" style={{ color: "#C9A84C" }} />
                <span>law2030m@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <Phone className="w-4 h-4" style={{ color: "#C9A84C" }} />
                <span>+966 550 341 728</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
