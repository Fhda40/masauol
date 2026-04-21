import { motion } from "framer-motion";
import { Scale, Eye, Target, Sparkles, ChevronRight } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import MagneticButton from "@/components/MagneticButton";
import { Link } from "react-router";

export default function About() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#c9a84c]/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-mono-ar text-[#c9a84c] tracking-widest uppercase mb-4 block"
            >
              عن مسؤول
            </motion.span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              نجمع بين <span className="text-gradient">الخبرة</span> والتقنية
            </h1>
            <p className="text-sm text-white/40 max-w-xl mx-auto leading-relaxed">
              شركة مسؤول للمحاماة تؤمن بأن الاستشارة القانونية يجب أن تكون
              سريعة ودقيقة ومتاحة للجميع — وليست حكراً على من يستطيعون الانتظار
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 sm:py-28 lg:py-36 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-xs font-mono-ar text-white/30 tracking-widest uppercase mb-4 block">قصتنا</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                لماذا بنينا <span className="text-gradient">مسؤول</span>
              </h2>
              <div className="space-y-4 text-sm text-white/50 leading-relaxed">
                <p>
                  ولدت فكرة مسؤول من ملاحظة بسيطة: الناس يحتاجون إلى إجابات قانونية
                  سريعة ودقيقة — وليس بعد أيام من الانتظار في المكاتب.
                </p>
                <p>
                  في شركة مسؤول للمحاماة، لاحظنا أن ٧٠٪ من الاستفسارات القانونية
                  يمكن تحليلها بشكل مبدئي بسرعة — لتحديد المسار الصحيح وتوفير
                  الوقت والجهد على العملاء.
                </p>
                <p>
                  فكّرنا: لماذا لا نجمع بين الخبرة القانونية العميقة التي اكتسبناها
                  عبر سنوات من الممارسة، والتقنية المتقدمة التي تمكّننا من تحليل
                  القضايا بسرعة ودقة؟
                </p>
                <p className="text-white/70">
                  هكذا ولد مسؤول — أول مستشار قانوني ذكي في السعودية يقدم تحليلاً
                  مُنظّماً يغطي التكييف القانوني والمخاطر والاستراتيجية وخطة العمل.
                </p>
              </div>

              <div className="mt-8">
                <MagneticButton
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a84c] to-[#a88a3a] text-black font-semibold text-sm rounded-sm"
                  strength={0.15}
                >
                  <Link to="/ai-advisor" className="contents">
                    جرّب المستشار الذكي
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </MagneticButton>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid grid-cols-1 gap-4"
            >
              {[
                { num: "٢٠+", label: "سنة خبرة قانونية" },
                { num: "١٠٠٠+", label: "استشارة قانونية" },
                { num: "٩٨%", label: "رضا العملاء" },
                { num: "١٥+", label: "نظام قانوني" },
              ].map((stat, i) => (
                <GlowCard key={stat.label} glowColor="#c9a84c" intensity={0.2} delay={i * 0.1}>
                  <div className="p-6 flex items-center gap-6">
                    <div className="text-3xl font-bold text-gradient font-mono-ar">{stat.num}</div>
                    <div className="text-sm text-white/50">{stat.label}</div>
                  </div>
                </GlowCard>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-20 sm:py-28 lg:py-36 bg-[#050508] relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono-ar text-[#c9a84c] tracking-widest uppercase mb-4 block">رؤيتنا وقيمنا</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              نؤمن بـ<span className="text-gradient">قيم</span> واضحة
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Eye className="w-6 h-6" />, title: "الوضوح", desc: "لا غموض في التحليل القانوني. نوضح الوضع كما هو — نقاط القوة ونقاط الضعف — بصراحة واحترافية." },
              { icon: <Target className="w-6 h-6" />, title: "الدقة", desc: "كل تحليل مبني على أنظمة سعودية محددة. لا تخمين، لا عمومية — تحليل قانوني دقيق ومُوثّق." },
              { icon: <Sparkles className="w-6 h-6" />, title: "الابتكار", desc: "نستخدم الذكاء الاصطناعي كأداة تمكين — لا كبديل عن الخبرة البشرية. خلف كل تحليل، خبرة قانونية عميقة." },
            ].map((value, i) => (
              <GlowCard key={value.title} glowColor="#c9a84c" intensity={0.3} delay={i * 0.1}>
                <div className="p-8 text-center">
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-16 h-16 rounded-sm bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border border-[#c9a84c]/15 flex items-center justify-center text-[#c9a84c] mx-auto mb-6"
                  >
                    {value.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{value.desc}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 sm:py-28 lg:py-36 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <GlowCard glowColor="#c9a84c" intensity={0.3}>
            <div className="p-8 sm:p-12 text-center">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-fit mx-auto"
              >
                <Scale className="w-12 h-12 text-[#c9a84c] mx-auto mb-6" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-4">مسؤول — شركة مسؤول للمحاماة</h2>
              <p className="text-sm text-white/50 max-w-2xl mx-auto leading-relaxed mb-8">
                شريكك القانوني الذكي. نجمع بين الخبرة القانونية العميقة والتقنية المتقدمة
                لتقديم استشارات قانونية استثنائية. مسؤول ليس بديلاً عن المحامي —
                هو البوابة الذكية التي تضعك على المسار الصحيح من اللحظة الأولى.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono-ar text-white/30">
                {[
                  { icon: <ChevronRight className="w-3 h-3 text-[#c9a84c]" />, text: "الرياض، المملكة العربية السعودية" },
                  { icon: <ChevronRight className="w-3 h-3 text-[#c9a84c]" />, text: "info@masoul-law.sa" },
                  { icon: <ChevronRight className="w-3 h-3 text-[#c9a84c]" />, text: "9200XXXXX" },
                ].map((item, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05, color: "rgba(201, 168, 76, 0.7)" }}
                    className="flex items-center gap-1 transition-colors duration-300"
                  >
                    {item.icon}
                    {item.text}
                  </motion.span>
                ))}
              </div>
            </div>
          </GlowCard>
        </div>
      </section>
    </div>
  );
}
