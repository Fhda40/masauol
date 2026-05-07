import { motion } from "framer-motion";
import { Scale, Eye, Target, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router";

export default function About() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="section-apple">
        <div className="container-apple text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="headline-hero mb-4">
              نجمع بين <span style={{ color: "var(--text-primary)" }}>الخبرة</span> والتقنية
            </h1>
            <p className="body-large mx-auto mb-10">
              شركة مسؤول للمحاماة تؤمن بأن الاستشارة القانونية يجب أن تكون سريعة ودقيقة ومتاحة للجميع
            </p>
            <div className="mx-auto max-w-lg mb-12">
              <img src="/about-hero.png" alt="مسؤول - الذكاء الاصطناعي والقانون" className="w-full h-auto rounded-2xl" style={{ boxShadow: "var(--shadow-md)" }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container-apple">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="headline-section mb-6">لماذا مسؤول؟</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <p>ولدت فكرة مسؤول من ملاحظة بسيطة: الناس يحتاجون إلى إجابات قانونية سريعة ودقيقة — وليس بعد أيام من الانتظار.</p>
                <p>في شركة مسؤول للمحاماة، لاحظنا أن ٧٠٪ من الاستفسارات القانونية يمكن تحليلها بشكل مبدئي بسرعة — لتحديد المسار الصحيح.</p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>هكذا ولد مسؤول — أول مستشار قانوني ذكي في السعودية.</p>
              </div>
              <div className="mt-8">
                <Link to="/ai-advisor" className="btn-apple">
                  جرّب المستشار الذكي
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 gap-4"
            >
              {[
                { num: "٢٠+", label: "سنة خبرة قانونية" },
                { num: "١٠٠٠+", label: "استشارة قانونية" },
                { num: "٩٨%", label: "رضا العملاء" },
                { num: "١٥+", label: "نظام قانوني" },
              ].map((stat) => (
                <div key={stat.label} className="card-apple">
                  <div className="p-6 flex items-center gap-6">
                    <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.num}</div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-apple">
        <div className="container-apple">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">قيمنا</h2>
            <p className="body-large mx-auto">نؤمن بقيم واضحة تحكم كل تحليل قانوني نقدمه</p>
          </div>
          <div className="grid-clean">
            {[
              { icon: <Eye className="w-6 h-6" />, title: "الوضوح", desc: "لا غموض في التحليل. نوضح الوضع كما هو — نقاط القوة ونقاط الضعف — بصراحة واحترافية." },
              { icon: <Target className="w-6 h-6" />, title: "الدقة", desc: "كل تحليل مبني على أنظمة سعودية محددة. لا تخمين، لا عمومية — تحليل قانوني دقيق ومُوثّق." },
              { icon: <Sparkles className="w-6 h-6" />, title: "الابتكار", desc: "نستخدم الذكاء الاصطناعي كأداة تمكين — لا كبديل عن الخبرة البشرية. خلف كل تحليل، خبرة قانونية عميقة." },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-apple"
              >
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{value.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand */}
      <section className="py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container-apple">
          <div className="card-apple">
            <div className="p-8 sm:p-12 text-center">
              <Scale className="w-10 h-10 mx-auto mb-6" style={{ color: "var(--text-secondary)" }} />
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>مسؤول — شركة مسؤول للمحاماة</h2>
              <p className="text-sm max-w-2xl mx-auto leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
                شريكك القانوني الذكي. نجمع بين الخبرة القانونية العميقة والتقنية المتقدمة
                لتقديم استشارات قانونية استثنائية.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: "var(--text-tertiary)" }}>
                <span>الرياض، المملكة العربية السعودية</span>
                <span>info@masoul-law.sa</span>
                <span>9200XXXXX</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
