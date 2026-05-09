import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Brain, Scale, Shield, MessageSquare } from "lucide-react";

const FAQS = [
  {
    category: "عن مسؤول",
    items: [
      {
        q: "ما هو مسؤول وكيف يعمل؟",
        a: "مسؤول هو مستشار قانوني ذكي متخصص في الأنظمة السعودية. يحلل قضيتك عبر ثلاث مراحل متتالية: أولاً فهم الوقائع وتكييفها قانونياً، ثانياً التفكير الاستراتيجي وتحديد الخيارات، ثالثاً تقديم رد احترافي بمواد قانونية محددة. كل إجابة مبنية على نصوص الأنظمة السعودية الرسمية.",
      },
      {
        q: "هل مسؤول بديل عن المحامي؟",
        a: "لا. مسؤول أداة استشارية تمهيدية تساعدك على فهم موقفك القانوني قبل التوجه للمحامي. يمنحك صورة واضحة عن قضيتك، الأنظمة المطبقة، والخيارات المتاحة — مما يجعل اجتماعك مع المحامي أكثر كفاءة. في القضايا الجدية، يُنصح دائماً بتوكيل محامٍ مختص.",
      },
      {
        q: "كم تكلفة الاستشارة؟",
        a: "الاستشارة الأولى مجانية تماماً بدون تسجيل بريد أو بيانات بنكية. فقط سجّل بحساب Google واشرح قضيتك. للاستشارات المتكررة أو التمثيل القانوني، تواصل مع فريقنا.",
      },
      {
        q: "هل معلوماتي آمنة؟",
        a: "نعم. جميع المعلومات التي تشاركها محمية بالكامل ولا تُشارك مع أي طرف ثالث. نلتزم بسرية تامة لجميع الاستشارات وفق سياسة الخصوصية المعتمدة.",
      },
    ],
  },
  {
    category: "القضايا والتحليل",
    items: [
      {
        q: "ما أنواع القضايا التي يغطيها مسؤول؟",
        a: "يغطي مسؤول ٨ تخصصات قانونية: الجرائم الإلكترونية، التنفيذ والديون، القضايا العمالية، الأحوال الشخصية، المخدرات والجرائم الجنائية، القضايا التجارية، القضايا المدنية والمرافعات، والجرائم الجنائية والإجراءات الجزائية.",
      },
      {
        q: "هل يمكنني رفع ملف PDF للتحليل؟",
        a: "نعم. يمكنك رفع ملفات PDF بحد أقصى 10MB في صفحة المستشار الذكي. مسؤول سيستخرج النص وسيحلله قانونياً. هذه الميزة مثالية لتحليل عقود، أحكام قضائية، أو وثائق قانونية.",
      },
      {
        q: "كيف يتم تحليل الأحكام القضائية؟",
        a: "مسؤول متخصص في كشف ثغرات الأحكام القضائية. عند رفع الحكم، يحلل: الأخطاء الإجرائية، نقص الأدلة، عيوب التعليل، أخطاء تطبيق القانون، فرص الاستئناف، والحجج المضادة المتاحة مع تقدير احتمالية النجاح في الطعن.",
      },
      {
        q: "كم تستغرق الاستشارة؟",
        a: "ثوانٍ. مسؤول يحلل القضية في ثلاث مراحل متوازية وتعود بإجابة احترافية خلال 30-60 ثانية في الغالب، بدلاً من الانتظار لأيام.",
      },
    ],
  },
  {
    category: "التواصل والمتابعة",
    items: [
      {
        q: "متى أحتاج للتواصل مع محامٍ؟",
        a: "ننصح بالتواصل الفوري مع محامٍ إذا كانت قضيتك: تنطوي على إجراءات قانونية عاجلة (توقيف، تنفيذ وشيك)، تتعلق بمبالغ مالية كبيرة، أو تُشير نتائج التحليل لخطر عالٍ أو حرج. مسؤول سيُنبهك تلقائياً في هذه الحالات.",
      },
      {
        q: "كيف يمكنني التواصل مع فريق مسؤول القانوني؟",
        a: "يمكنك التواصل معنا عبر صفحة 'تواصل' وملء نموذج القضية. سيردّ فريقنا القانوني خلال 24 ساعة. للحالات العاجلة، يمكنك التواصل عبر واتساب مباشرة.",
      },
      {
        q: "هل يمكنني حفظ محادثاتي ومراجعتها لاحقاً؟",
        a: "نعم. عند تسجيل الدخول بحساب Google، تُحفظ جميع محادثاتك تلقائياً ويمكنك مراجعتها في أي وقت من خلال القائمة الجانبية في صفحة المستشار الذكي.",
      },
    ],
  },
  {
    category: "الأنظمة والمواد القانونية",
    items: [
      {
        q: "هل التحليل مبني على أنظمة سعودية فعلية؟",
        a: "نعم. قاعدة معرفة مسؤول تحتوي على نصوص الأنظمة السعودية الرسمية شاملةً: نظام مكافحة الجرائم المعلوماتية، نظام التنفيذ، نظام العمل، نظام الأحوال الشخصية، نظام مكافحة المخدرات، نظام الشركات، نظام المرافعات الشرعية، ونظام الإجراءات الجزائية.",
      },
      {
        q: "هل تُحدَّث الأنظمة بشكل دوري؟",
        a: "نعم. نحرص على تحديث قاعدة المعرفة القانونية بشكل دوري لمواكبة أحدث التعديلات الصادرة على الأنظمة السعودية. ومع ذلك، ينصح دائماً بالتحقق من المصدر الرسمي (هيئة الخبراء بمجلس الوزراء) للنصوص المحدّثة.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: open ? "rgba(255,248,230,0.85)" : "rgba(255,255,255,0.75)",
        border: `1px solid ${open ? "rgba(201,168,76,0.30)" : "rgba(201,168,76,0.10)"}`,
        backdropFilter: "blur(12px)",
        boxShadow: open ? "0 8px 24px rgba(201,168,76,0.08)" : "0 2px 8px rgba(0,0,0,0.03)",
        transition: "all 0.3s ease",
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4 p-5">
        <h3 className="text-sm font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {q}
        </h3>
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
          style={{
            background: open ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.20)",
          }}
        >
          {open
            ? <ChevronUp className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
            : <ChevronDown className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="px-5 pb-5 text-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)",
        }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-5" style={{ color: "var(--accent-gold)" }}>
              الأسئلة الشائعة
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold mb-5" style={{ fontFamily: "'EB Garamond', serif" }}>
              كل ما تريد<br />
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D78A, #C9A84C)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>معرفته</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              إجابات واضحة على أكثر الأسئلة التي يسألها مستخدمو مسؤول.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 space-y-14">
          {FAQS.map((section, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: si * 0.1 }}
            >
              <h2 className="text-lg font-bold mb-5 flex items-center gap-3">
                <span
                  className="w-2 h-6 rounded-full inline-block"
                  style={{ background: "linear-gradient(180deg, #C9A84C, #A8893A)" }}
                />
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, ii) => (
                  <FAQItem key={ii} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl p-10 text-center relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.80)",
              border: "1px solid rgba(201,168,76,0.18)",
              backdropFilter: "blur(20px) saturate(160%)",
              boxShadow: "0 8px 40px rgba(201,168,76,0.08)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)",
            }} />
            <Scale className="w-10 h-10 mx-auto mb-4 relative z-10" style={{ color: "#C9A84C" }} />
            <h2 className="text-2xl font-bold mb-3 relative z-10" style={{ fontFamily: "'EB Garamond', serif" }}>
              لم تجد إجابتك؟
            </h2>
            <p className="mb-7 relative z-10" style={{ color: "var(--text-muted)" }}>
              اشرح قضيتك مباشرة للمستشار الذكي أو تواصل مع فريقنا القانوني.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                to="/ai-advisor"
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                  color: "#0A0A0A",
                  boxShadow: "0 8px 28px rgba(201,168,76,0.35)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(201,168,76,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(201,168,76,0.35)";
                }}
              >
                <Brain className="w-4 h-4" />
                استشارة مجانية الآن
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                style={{
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "var(--accent-gold)",
                  background: "rgba(201,168,76,0.05)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.12)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.25)";
                }}
              >
                <MessageSquare className="w-4 h-4" />
                تواصل مع فريقنا
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
