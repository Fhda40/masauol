import { motion } from "framer-motion";
import { Link } from "react-router";
import { Shield, Briefcase, Gavel, Scale, Lock, Target, Building2, Heart, FileCheck, ArrowLeft, Brain } from "lucide-react";

const categories = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "الجرائم الإلكترونية",
    desc: "الابتزاز، الاحتيال الإلكتروني، التهديدات، التشهير، الاختراق — تحليل قانوني فوري يحدد المادة المطبقة وإجراءات البلاغ.",
    law: "نظام مكافحة الجرائم المعلوماتية",
    features: ["تحديد نوع الجريمة الإلكترونية", "إجراءات البلاغ والتحقيق", "حجز الأدلة الرقمية", "التعويض المدني"],
    image: "/services-cybercrime.png",
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: "التنفيذ والديون",
    desc: "إجراءات التنفيذ، حجز أموال، منع سفر، شيكات بدون رصيد — خطة عمل واضحة لاسترداد حقوقك المالية.",
    law: "نظام التنفيذ السعودي",
    features: ["إصدار الصحيفة التنفيذية", "حجز الراتب والحسابات", "منع السفر", "التقادم والسقوط"],
    image: "/services-enforcement.png",
  },
  {
    icon: <Gavel className="w-5 h-5" />,
    title: "القضايا العمالية",
    desc: "الفصل التعسفي، المستحقات المالية، نزاعات عقود العمل، إصابات العمل — تحليل شامل لحقوقك.",
    law: "نظام العمل السعودي",
    features: ["تعويض الفصل التعسفي", "المستحقات المالية", "مدة رفع الدعوى", "إصابات العمل"],
    image: "/services-labor.png",
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: "القضايا المدنية",
    desc: "العقود، الإيجارات، النزاعات، التعويض — تكييف قانوني دقيق وتحديد الاختصاص والإجراءات.",
    law: "نظام المرافعات الشرعية",
    features: ["تكييف العقود", "إثبات الحقوق", "التقادم", "التحكيم"],
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "مكافحة المخدرات",
    desc: "الحيازة، الاتجار، التعاطي — فهم حقوقك القانونية والإجراءات المتبعة من الضبط إلى المحاكمة.",
    law: "نظام مكافحة المخدرات",
    features: ["حقوق المتهم", "إجراءات التحقيق", "الإحالة للعلاج", "العقوبات"],
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "القضايا الجنائية",
    desc: "حقوق المتهم، إجراءات التحقيق، الكفالات، الدعوى المدنية المترتبة — تحليل قانوني دقيق وسريع.",
    law: "نظام الإجراءات الجزائية",
    features: ["حقوق المتهم", "إجراءات التوقيف", "الكفالات", "الدعوى المدنية"],
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "القضايا التجارية",
    desc: "الشركات، الإفلاس، النزاعات التجارية، التحكيم — تحليل شامل للقضايا التجارية المعقدة.",
    law: "نظام التجارة والشركات",
    features: ["نزاعات الشركات", "التحكيم التجاري", "الإفلاس", "المسؤولية المالية"],
    image: "/services-commercial.png",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "الأحوال الشخصية",
    desc: "الطلاق، النفقة، الحضانة — تحليل قانوني يضع مصلحة الأسرة والقاصرين في المقام الأول.",
    law: "الأنظمة والتعليمات",
    features: ["الطلاق والنفقة", "الحضانة", "الوساطة الأسرية", "مصلحة القاصرين"],
    image: "/services-family.png",
  },
];

export default function Services() {
  return (
    <div>
      {/* Hero */}
      <section className="section-apple">
        <div className="container-apple text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="headline-hero mb-4">الخدمات القانونية</h1>
            <p className="body-large mx-auto">
              تغطية شاملة لجميع الأنظمة القانونية السعودية بتحليل ذكي يصل إلى عمق القضية
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20">
        <div className="container-apple">
          <div className="grid-clean">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="card-apple"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{cat.title}</h3>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>{cat.desc}</p>
                      <span className="badge-apple mb-3">{cat.law}</span>
                      <div className="space-y-1.5 mt-3">
                        {cat.features.map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <FileCheck className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
                            <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {cat.image && (
                      <div className="flex-shrink-0 w-20 h-20 hidden md:block">
                        <img src={cat.image} alt={cat.title} className="w-full h-full object-contain opacity-70" loading="lazy" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>جاهز لتحليل قضيتك؟</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/ai-advisor" className="btn-apple">
                <ArrowLeft className="w-4 h-4" />
                ابدأ التحليل الذكي
              </Link>
              <Link to="/case-review" className="btn-apple-secondary">
                <Brain className="w-4 h-4" />
                اطلب مراجعة خبير
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
