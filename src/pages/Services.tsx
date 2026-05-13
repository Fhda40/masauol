import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Shield, Briefcase, Gavel, Scale, Lock, FileSearch,
  ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Brain,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    num: "01", icon: Shield, color: "#4EA8DE",
    title: "الجرائم الإلكترونية",
    desc: "الابتزاز، الاحتيال الإلكتروني، التهديدات، التشهير، الاختراق — تحليل قانوني فوري يحدد المادة المطبقة وإجراءات البلاغ.",
    law: "نظام مكافحة الجرائم المعلوماتية",
    articles: "المواد ٣-٢٨",
    features: ["تحديد نوع الجريمة الإلكترونية", "إجراءات البلاغ والتحقيق", "حجز الأدلة الرقمية", "التعويض المدني وعقوبة المتهم"],
    urgency: "عاجل",
  },
  {
    num: "02", icon: Briefcase, color: "#C9A84C",
    title: "التنفيذ والديون",
    desc: "إجراءات التنفيذ، حجز أموال، منع سفر، شيكات بدون رصيد — خطة عمل واضحة لاسترداد حقوقك المالية.",
    law: "نظام التنفيذ السعودي",
    articles: "المواد ٩-٨٤",
    features: ["إصدار الصحيفة التنفيذية", "حجز الراتب والحسابات (الثلث)", "منع السفر والإكراه", "التقادم العشري للديون"],
    urgency: "متوسط",
  },
  {
    num: "03", icon: Gavel, color: "#17B26A",
    title: "القضايا العمالية",
    desc: "الفصل التعسفي، المستحقات المالية، نزاعات عقود العمل، إصابات العمل — تحليل شامل لحقوقك.",
    law: "نظام العمل السعودي",
    articles: "هيئة تسوية الخلافات",
    features: ["تعويض الفصل التعسفي", "المستحقات ونهاية الخدمة", "مدة رفع الدعوى (١٨٠ يوم)", "إصابات العمل"],
    urgency: "متوسط",
  },
  {
    num: "04", icon: Scale, color: "#9B59B6",
    title: "الأحوال الشخصية",
    desc: "طلاق، حضانة، نفقة، ميراث، وصية — تحليل مبني على نظام الأحوال الشخصية السعودي الجديد.",
    law: "نظام الأحوال الشخصية",
    articles: "المواد ٤-٩٠",
    features: ["أنواع الطلاق والخلع", "حضانة الأطفال ومدتها", "النفقة والمستحقات", "الميراث وتوزيع التركة"],
    urgency: "عادي",
  },
  {
    num: "05", icon: Lock, color: "#E74C3C",
    title: "المخدرات والجرائم الجنائية",
    desc: "حيازة، اتجار، تعاطٍ — فهم حقوق المتهم وإجراءات التقاضي وفرص الإعفاء.",
    law: "نظام مكافحة المخدرات",
    articles: "المواد ٣٧-٦١",
    features: ["تصنيف الجريمة وعقوبتها", "حقوق المتهم أثناء التحقيق", "الإعفاء عند الإبلاغ", "برامج العلاج والإدمان"],
    urgency: "حرج",
  },
  {
    num: "06", icon: FileSearch, color: "#F39C12",
    title: "القضايا التجارية",
    desc: "نزاعات الشركات، عقود تجارية، إفلاس، تأسيس شركات — تحليل قانوني للأعمال التجارية.",
    law: "نظام الشركات السعودي الجديد",
    articles: "المواد ٢-١١٠",
    features: ["تأسيس الشركات وأنواعها", "مسؤولية المديرين", "نزاعات الشركاء", "التصفية والإفلاس"],
    urgency: "متوسط",
  },
  {
    num: "07", icon: Gavel, color: "#1E88E5",
    title: "القضايا المدنية والمرافعات",
    desc: "دعاوى مدنية، استئناف، نقض، إثبات — معرفة حقوقك الإجرائية في المحاكم.",
    law: "نظام المرافعات الشرعية",
    articles: "المواد ١-٢١٦",
    features: ["شروط رفع الدعوى", "مواعيد الاستئناف (٣٠ يوم)", "شهادة الشهود والإثبات", "القضاء المستعجل والأوامر المؤقتة"],
    urgency: "عادي",
  },
  {
    num: "08", icon: Shield, color: "#00BCD4",
    title: "الجرائم الجنائية والإجراءات الجزائية",
    desc: "قبض، توقيف، استجواب — حقوق المتهم في نظام الإجراءات الجزائية السعودي.",
    law: "نظام الإجراءات الجزائية",
    articles: "المواد ٢-٢١٥",
    features: ["حقوق المتهم عند القبض", "مدد التوقيف الاحتياطي", "سرية المراسلات مع المحامي", "قرينة البراءة وعبء الإثبات"],
    urgency: "حرج",
  },
];

const urgencyColors: Record<string, string> = {
  "حرج":  "#EF4444",
  "عاجل": "#F59E0B",
  "متوسط": "#3B82F6",
  "عادي": "#17B26A",
};

export default function Services() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const headerRef = useRef<HTMLDivElement>(null!);
  const gridRef   = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".services-title", {
        y: 50, opacity: 0, duration: 0.9, ease: "power3.out",
      });
      ScrollTrigger.batch(".svc-card", {
        onEnter: batch =>
          gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, duration: 0.65, ease: "power2.out" }),
        start: "top 90%",
      });
      gsap.set(".svc-card", { opacity: 0, y: 40 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <SEO
        title="الخدمات القانونية"
        description="خدمات قانونية متكاملة: تحليل القضايا، مراجعة الأحكام، الاستشارات العمالية والتجارية والأسرية وفق الأنظمة السعودية."
        path="/services"
      />

      {/* ── Header ── */}
      <section ref={headerRef} className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)",
          }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="services-title">
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-5"
              style={{ color: "var(--accent-gold)" }}>
              خدماتنا القانونية
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'EB Garamond', serif" }}>
              الأنظمة السعودية<br />
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D78A, #C9A84C)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>في خدمتك</span>
            </h1>
            <p className="text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
              ٨ تخصصات قانونية مغطاة بالكامل، مع استشهاد مباشر بالمواد النظامية الرسمية لكل قضية.
            </p>
          </div>

          {/* Quick CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/ai-advisor"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                color: "#0A0A0A",
                boxShadow: "0 8px 28px rgba(201,168,76,0.35)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(201,168,76,0.5)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(201,168,76,0.35)";
              }}>
              <Brain className="w-4 h-4" />
              استشارة مجانية الآن
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section ref={gridRef} className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {SERVICES.map((svc, i) => {
              const isExpanded = expanded === i;
              return (
                <div
                  key={i}
                  className="svc-card rounded-3xl overflow-hidden cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: `1px solid ${isExpanded ? `${svc.color}40` : "rgba(201,168,76,0.10)"}`,
                    backdropFilter: "blur(12px)",
                    boxShadow: isExpanded ? `0 16px 40px ${svc.color}12` : "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                  }}>

                  {/* Card header */}
                  <button
                    className="w-full flex items-start gap-5 p-7 text-right"
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    onMouseEnter={e => {
                      if (!isExpanded) {
                        (e.currentTarget.parentElement as HTMLElement).style.border = `1px solid ${svc.color}35`;
                        (e.currentTarget.parentElement as HTMLElement).style.background = `${svc.color}08`;
                        (e.currentTarget.parentElement as HTMLElement).style.transform = "translateY(-4px)";
                        (e.currentTarget.parentElement as HTMLElement).style.boxShadow = `0 12px 32px ${svc.color}12`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isExpanded) {
                        (e.currentTarget.parentElement as HTMLElement).style.border = "1px solid rgba(201,168,76,0.10)";
                        (e.currentTarget.parentElement as HTMLElement).style.background = "rgba(255,255,255,0.75)";
                        (e.currentTarget.parentElement as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget.parentElement as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                      }
                    }}>
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ background: `${svc.color}18`, border: `1px solid ${svc.color}30` }}>
                      <svc.icon className="w-6 h-6" style={{ color: svc.color }} />
                    </div>

                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-3 mb-2 flex-row-reverse justify-end">
                        <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                          {svc.title}
                        </h3>
                        <span className="text-[10px] font-mono" style={{ color: `${svc.color}70` }}>
                          {svc.num}
                        </span>
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                          style={{
                            background: `${urgencyColors[svc.urgency]}15`,
                            color: urgencyColors[svc.urgency],
                          }}>
                          {svc.urgency}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-right" style={{ color: "var(--text-muted)" }}>
                        {svc.desc}
                      </p>
                    </div>

                    <div className="flex-shrink-0 mt-1" style={{ color: svc.color }}>
                      {isExpanded
                        ? <ChevronUp className="w-5 h-5" />
                        : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Expanded details */}
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden" }}>
                    <div className="px-7 pb-7">
                      <div className="pt-5" style={{ borderTop: `1px solid ${svc.color}20` }}>
                        {/* Law reference */}
                        <div className="flex items-center justify-between mb-5 p-4 rounded-2xl"
                          style={{ background: `${svc.color}08`, border: `1px solid ${svc.color}15` }}>
                          <div>
                            <p className="text-xs font-bold mb-1" style={{ color: svc.color }}>النظام المرجعي</p>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{svc.law}</p>
                          </div>
                          <span className="text-xs px-3 py-1.5 rounded-full font-mono font-bold"
                            style={{ background: `${svc.color}20`, color: svc.color }}>
                            {svc.articles}
                          </span>
                        </div>

                        {/* Features */}
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
                          ما يغطيه التحليل
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                          {svc.features.map((f, j) => (
                            <div key={j} className="flex items-center gap-2.5 p-3 rounded-xl"
                              style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(201,168,76,0.08)" }}>
                              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: svc.color }} />
                              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{f}</span>
                            </div>
                          ))}
                        </div>

                        <Link to="/ai-advisor"
                          className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                          style={{
                            background: `linear-gradient(135deg, ${svc.color}cc, ${svc.color}99)`,
                            color: "#0A0A0A",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}>
                          <Brain className="w-4 h-4" />
                          تحليل هذه القضية
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
