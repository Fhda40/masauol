import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Shield, Briefcase, Gavel, Scale, Lock, Target,
  FileCheck, ArrowLeft, Building2, Heart,
} from "lucide-react";
import GlowCard from "@/components/GlowCard";
import MagneticButton from "@/components/MagneticButton";

const categories = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "الجرائم الإلكترونية",
    desc: "الابتزاز، الاحتيال الإلكتروني، التهديدات، التشهير، الاختراق — تحليل قانوني فوري يحدد المادة المطبقة وإجراءات البلاغ.",
    law: "نظام مكافحة الجرائم المعلوماتية",
    articles: "المواد ٣-١٢",
    features: ["تحديد نوع الجريمة الإلكترونية", "إجراءات البلاغ والتحقيق", "حجز الأدلة الرقمية", "التعويض المدني"],
    glowColor: "#4EA8DE",
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: "التنفيذ والديون",
    desc: "إجراءات التنفيذ، حجز أموال، منع سفر، شيكات بدون رصيد — خطة عمل واضحة لاسترداد حقوقك المالية.",
    law: "نظام التنفيذ السعودي",
    articles: "المواد ٩-٨٤",
    features: ["إصدار الصحيفة التنفيذية", "حجز الراتب والحسابات", "منع السفر", "التقادم والسقوط"],
    glowColor: "#c9a84c",
  },
  {
    icon: <Gavel className="w-6 h-6" />,
    title: "القضايا العمالية",
    desc: "الفصل التعسفي، المستحقات المالية، نزاعات عقود العمل، إصابات العمل — تحليل شامل لحقوقك.",
    law: "نظام العمل السعودي",
    articles: "هيئة تسوية الخلافات",
    features: ["تعويض الفصل التعسفي", "المستحقات المالية", "مدة رفع الدعوى", "إصابات العمل"],
    glowColor: "#17B26A",
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: "القضايا المدنية",
    desc: "العقود، الإيجارات، النزاعات، التعويض — تكييف قانوني دقيق وتحديد الاختصاص والإجراءات.",
    law: "نظام المرافعات الشرعية",
    articles: "الأنظمة المدنية",
    features: ["تكييف العقود", "إثبات الحقوق", "التقادم", "التحكيم"],
    glowColor: "#4EA8DE",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "مكافحة المخدرات",
    desc: "الحيازة، الاتجار، التعاطي — فهم حقوقك القانونية والإجراءات المتبعة من الضبط إلى المحاكمة.",
    law: "نظام مكافحة المخدرات",
    articles: "التمييز بين حيازة واتجار",
    features: ["حقوق المتهم", "إجراءات التحقيق", "الإحالة للعلاج", "العقوبات"],
    glowColor: "#F59E0B",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "القضايا الجنائية",
    desc: "حقوق المتهم، إجراءات التحقيق، الكفالات، الدعوى المدنية المترتبة — تحليل قانوني دقيق وسريع.",
    law: "نظام الإجراءات الجزائية",
    articles: "حقوق المتهم والضحية",
    features: ["حقوق المتهم", "إجراءات التوقيف", "الكفالات", "الدعوى المدنية"],
    glowColor: "#F04438",
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "القضايا التجارية",
    desc: "الشركات، الإفلاس، النزاعات التجارية، التحكيم — تحليل شامل للقضايا التجارية المعقدة.",
    law: "نظام التجارة والشركات",
    articles: "نظام الإفلاس",
    features: ["نزاعات الشركات", "التحكيم التجاري", "الإفلاس", "المسؤولية المالية"],
    glowColor: "#c9a84c",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "الأحوال الشخصية",
    desc: "الطلاق، النفقة، الحضانة — تحليل قانوني يضع مصلحة الأسرة والقاصرين في المقام الأول.",
    law: "الأنظمة والتعليمات",
    articles: "المحاكم المختصة",
    features: ["الطلاق والنفقة", "الحضانة", "الوساطة الأسرية", "مصلحة القاصرين"],
    glowColor: "#17B26A",
  },
];

export default function Services() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#c9a84c]/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xs font-mono-ar text-[#c9a84c] tracking-widest uppercase mb-4 block"
            >
              خدماتنا القانونية
            </motion.span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              تغطية <span className="text-gradient">شاملة</span> لجميع الأنظمة
            </h1>
            <p className="text-sm text-white/40 max-w-lg mx-auto">
              من الجرائم الإلكترونية إلى القضايا التنفيذية — نغطي جميع الأنظمة
              القانونية السعودية بتحليل ذكي يصل إلى عمق القضية
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((cat, i) => (
              <GlowCard
                key={cat.title}
                glowColor={cat.glowColor}
                intensity={0.25}
                delay={i * 0.06}
                className="group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      className="w-12 h-12 rounded-sm bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border border-[#c9a84c]/15 flex items-center justify-center text-[#c9a84c] flex-shrink-0 group-hover:from-[#c9a84c]/30 group-hover:to-[#c9a84c]/10 transition-all duration-500"
                    >
                      {cat.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[#c9a84c]/90 transition-colors duration-300">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed mb-3">{cat.desc}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[9px] font-mono-ar px-2 py-0.5 bg-[#4EA8DE]/10 text-[#4EA8DE] rounded-sm">
                          {cat.law}
                        </span>
                        <span className="text-[9px] font-mono-ar px-2 py-0.5 bg-white/5 text-white/40 rounded-sm">
                          {cat.articles}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {cat.features.map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <FileCheck className="w-3 h-3 text-[#c9a84c]/50" />
                            <span className="text-[11px] text-white/50">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-16"
          >
            <p className="text-sm text-white/50 mb-6">جاهز لتحليل قضيتك؟</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <MagneticButton
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#c9a84c] to-[#a88a3a] text-black font-semibold text-sm rounded-sm"
                strength={0.15}
              >
                <Link to="/ai-advisor" className="contents">
                  <ArrowLeft className="w-4 h-4" />
                  ابدأ التحليل الذكي
                </Link>
              </MagneticButton>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/case-review"
                  className="flex items-center gap-2 px-8 py-3.5 border border-white/15 text-white/80 font-medium text-sm rounded-sm hover:bg-white/5 transition-all duration-300"
                >
                  <Shield className="w-4 h-4" />
                  اطلب مراجعة خبير
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
