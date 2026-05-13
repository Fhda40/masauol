import { motion } from "framer-motion";
import { FileText, AlertTriangle, Scale, Shield, Mail } from "lucide-react";
import SEO from "@/components/SEO";

const SECTIONS = [
  {
    icon: Scale,
    title: "طبيعة الخدمة",
    content: [
      "مسؤول منصة للمعلومات القانونية العامة المستندة إلى الأنظمة السعودية الرسمية.",
      "التحليلات المُقدَّمة لأغراض استرشادية فقط ولا تُعدّ استشارة قانونية ملزمة.",
      "لا تُغني المعلومات المُقدَّمة عن الاستعانة بمحامٍ مرخّص للنظر في قضيتك.",
      "نُحيل إلى محامين معتمدين عند الحاجة لتمثيل قانوني رسمي.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "حدود المسؤولية",
    content: [
      "مسؤول غير مسؤولة عن أي قرار يتخذه المستخدم بناءً على المعلومات المُقدَّمة.",
      "التحليل القانوني لا يُنشئ علاقة موكّل-محامٍ بين المستخدم والمنصة.",
      "الأنظمة القانونية عرضة للتعديل؛ تأكد دائماً من النسخة الرسمية في الجريدة الرسمية.",
      "المنصة غير مسؤولة عن أي أضرار ناجمة عن الاعتماد الكامل على نتائج التحليل.",
    ],
  },
  {
    icon: Shield,
    title: "التزامات المستخدم",
    content: [
      "يلتزم المستخدم بتقديم معلومات صادقة وغير مضللة عند شرح قضيته.",
      "يُحظر استخدام المنصة لأغراض غير قانونية أو للإضرار بأطراف ثالثة.",
      "يُحظر محاولة اختراق أنظمة المنصة أو الاستخدام المفرط الذي يُعيق الخدمة.",
      "المستخدم مسؤول عن سرية بيانات الدخول الخاصة به.",
    ],
  },
  {
    icon: FileText,
    title: "الملكية الفكرية",
    content: [
      "تحليلات مسؤول وواجهاته محمية بموجب حقوق الملكية الفكرية.",
      "نصوص الأنظمة السعودية هي ملك عام لا تتدّعي المنصة ملكيتها.",
      "يُحظر إعادة بيع أو نشر تحليلات المنصة تجارياً دون إذن كتابي.",
      "يُسمح باستخدام التحليلات للأغراض الشخصية والبحثية غير التجارية.",
    ],
  },
];

export default function TermsOfService() {
  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <SEO
        title="الشروط والأحكام — مسؤول"
        description="اطلع على شروط وأحكام استخدام منصة مسؤول. تحكم هذه الشروط علاقتك بالمنصة وخدماتها."
        path="/terms"
      />

      {/* Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)",
        }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <FileText className="w-7 h-7" style={{ color: "#C9A84C" }} />
            </div>
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
              قانوني
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5" style={{ fontFamily: "'EB Garamond', serif" }}>
              الشروط والأحكام
            </h1>
            <p className="text-base" style={{ color: "var(--text-muted)" }}>
              آخر تحديث: مايو ٢٠٢٥ — يُرجى قراءة هذه الشروط قبل استخدام المنصة.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 space-y-6">

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-7 rounded-3xl"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(201,168,76,0.12)", backdropFilter: "blur(12px)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              باستخدامك لمنصة مسؤول فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي بند منها،
              يُرجى التوقف عن استخدام المنصة. نحتفظ بحق تعديل هذه الشروط في أي وقت مع إشعار المستخدمين.
            </p>
          </motion.div>

          {SECTIONS.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-7 rounded-3xl"
              style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(201,168,76,0.10)", backdropFilter: "blur(12px)" }}>
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

          {/* Jurisdiction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-7 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(30,58,138,0.04) 100%)",
              border: "1px solid rgba(201,168,76,0.15)",
            }}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>الاختصاص القضائي</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              تخضع هذه الشروط لأنظمة المملكة العربية السعودية. أي نزاع ينشأ عن استخدام المنصة يُحال
              إلى المحاكم السعودية المختصة في مدينة الرياض.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-7 rounded-3xl"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(201,168,76,0.10)", backdropFilter: "blur(12px)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>للاستفسار</h2>
            <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
              <Mail className="w-4 h-4" style={{ color: "#C9A84C" }} />
              <span>law2030m@gmail.com</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
