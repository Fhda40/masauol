import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Scale, Shield, Briefcase, Gavel, Lock,
  Brain, ArrowLeft, ChevronDown, Star,
  FileSearch, Clock, CheckCircle, Zap,
} from "lucide-react";
import HeroScene from "@/components/HeroScene";

gsap.registerPlugin(ScrollTrigger);

/* ── Data ── */
const STATS = [
  { value: 500, suffix: "+", label: "قضية مُعالَجة" },
  { value: 20,  suffix: "+", label: "سنة خبرة قانونية" },
  { value: 98,  suffix: "%", label: "نسبة رضا العملاء" },
  { value: 7,   suffix: "",  label: "أنظمة قانونية" },
];

const SERVICES = [
  { icon: Shield,      color: "#4EA8DE", num: "01", title: "الجرائم الإلكترونية",   desc: "ابتزاز، احتيال، تشهير، اختراق — تحليل قانوني فوري بمواد نظامية محددة" },
  { icon: Briefcase,   color: "#C9A84C", num: "02", title: "التنفيذ والديون",        desc: "إجراءات التنفيذ، حجز الأموال، منع السفر، شيكات بدون رصيد" },
  { icon: Gavel,       color: "#17B26A", num: "03", title: "القضايا العمالية",       desc: "فصل تعسفي، مستحقات مالية، نزاعات عقود العمل، إصابات العمل" },
  { icon: Scale,       color: "#9B59B6", num: "04", title: "الأحوال الشخصية",       desc: "طلاق، حضانة، نفقة، ميراث — تحليل مبني على نظام الأحوال الشخصية" },
  { icon: Lock,        color: "#E74C3C", num: "05", title: "المخدرات والجرائم الجنائية", desc: "حيازة، اتجار، تعاطٍ، حقوق المتهم وإجراءات التقاضي" },
  { icon: FileSearch,  color: "#F39C12", num: "06", title: "القضايا التجارية",      desc: "نزاعات الشركات، عقود تجارية، إفلاس، تأسيس شركات وحوكمة" },
];

const FEATURES = [
  { icon: Brain,        text: "تحليل ذكي مبني على الأنظمة السعودية الرسمية" },
  { icon: FileSearch,   text: "استشهاد مباشر بالمواد القانونية المحددة" },
  { icon: Clock,        text: "ردود فورية في ثوانٍ لا ساعات" },
  { icon: CheckCircle,  text: "تحليل ثلاثي المراحل: وقائع ← استراتيجية ← خطة" },
  { icon: Shield,       text: "سرية تامة لجميع الاستشارات" },
  { icon: Zap,          text: "كشف ثغرات الأحكام القضائية تلقائياً" },
];

/* ── Animated Counter ── */
function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null!);
  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val) + suffix;
      },
    });
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function Home() {
  const heroRef     = useRef<HTMLElement>(null!);
  const titleRef    = useRef<HTMLDivElement>(null!);
  const statsRef    = useRef<HTMLDivElement>(null!);
  const servicesRef = useRef<HTMLDivElement>(null!);
  const featureRef  = useRef<HTMLDivElement>(null!);
  const ctaRef      = useRef<HTMLDivElement>(null!);

  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY     = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpac  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  /* GSAP scroll reveals */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero title stagger */
      gsap.from(".hero-word", {
        y: 80, opacity: 0, duration: 1, stagger: 0.12,
        ease: "power3.out", delay: 0.3,
      });
      gsap.from(".hero-sub", {
        y: 30, opacity: 0, duration: 0.9,
        ease: "power2.out", delay: 0.9,
      });
      gsap.from(".hero-cta", {
        y: 20, opacity: 0, duration: 0.7,
        ease: "power2.out", delay: 1.2, stagger: 0.1,
      });

      /* Stats section */
      gsap.from(statsRef.current?.querySelectorAll(".stat-card") ?? [], {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
      });

      /* Services cards */
      ScrollTrigger.batch(".service-card", {
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power2.out" }),
        start: "top 88%",
      });
      gsap.set(".service-card", { opacity: 0, y: 50 });

      /* Feature list */
      gsap.from(".feature-item", {
        x: 40, opacity: 0, duration: 0.6, stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: featureRef.current, start: "top 75%" },
      });

      /* CTA section */
      gsap.from(ctaRef.current, {
        scale: 0.95, opacity: 0, duration: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: ctaRef.current, start: "top 80%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", overflowX: "hidden" }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">

        {/* Background gradient layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(201,168,76,0.07) 0%, transparent 60%)",
          }} />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 60% 80% at 20% 80%, rgba(30,58,138,0.12) 0%, transparent 55%)",
          }} />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

            {/* Text content */}
            <motion.div style={{ y: heroY, opacity: heroOpac }} ref={titleRef} className="relative z-10 order-2 lg:order-1">

              {/* Badge */}
              <div className="hero-word inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}>
                <Star className="w-3 h-3 fill-current" />
                المستشار القانوني الذكي الأول في السعودية
              </div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "'EB Garamond', serif" }}>
                <span className="hero-word block" style={{ color: "var(--text-primary)" }}>اعرف</span>
                <span className="hero-word block" style={{
                  background: "linear-gradient(135deg, #C9A84C 0%, #F0D78A 50%, #C9A84C 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>حقوقك</span>
                <span className="hero-word block" style={{ color: "var(--text-primary)" }}>الآن</span>
              </h1>

              <p className="hero-sub text-lg leading-relaxed mb-10 max-w-lg"
                style={{ color: "var(--text-muted)", fontFamily: "'Lato', sans-serif" }}>
                تحليل قانوني احترافي مبني على الأنظمة السعودية. اشرح قضيتك وسيحللها مسؤول بمواد قانونية محددة خلال ثوانٍ.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/ai-advisor"
                  className="hero-cta group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                    color: "#0A0A0A",
                    boxShadow: "0 8px 32px rgba(201,168,76,0.35)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(201,168,76,0.55)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(201,168,76,0.35)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}>
                  <Brain className="w-5 h-5" />
                  استشارة مجانية الآن
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Link>
                <Link to="/services"
                  className="hero-cta flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 cursor-pointer"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.6)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.06)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}>
                  <Scale className="w-5 h-5" />
                  خدماتنا القانونية
                </Link>
              </div>

              {/* Trust chips */}
              <div className="hero-cta flex flex-wrap gap-3">
                {["تحليل فوري", "أنظمة سعودية", "سرية تامة", "مجاناً"].map(chip => (
                  <span key={chip}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(201,168,76,0.15)", color: "var(--text-muted)", backdropFilter: "blur(8px)" }}>
                    <CheckCircle className="w-3 h-3" style={{ color: "#17B26A" }} />
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 3D Scene */}
            <div className="order-1 lg:order-2 relative h-[360px] sm:h-[480px] lg:h-[600px]">
              <div className="absolute inset-0">
                <HeroScene />
              </div>
              {/* Floating badge */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 left-4 px-4 py-3 rounded-2xl z-10"
                style={{
                  background: "rgba(12,12,20,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}>
                <p className="text-xs font-bold" style={{ color: "#C9A84C" }}>٢٠+ سنة خبرة</p>
                <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>قانوني سعودي محترف</p>
              </motion.div>
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 right-4 px-4 py-3 rounded-2xl z-10"
                style={{
                  background: "rgba(12,12,20,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(23,178,106,0.2)",
                }}>
                <p className="text-xs font-bold" style={{ color: "#17B26A" }}>+٥٠٠ قضية</p>
                <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>تم تحليلها بنجاح</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>
          <span className="text-xs tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>اسحب للأسفل</span>
          <ChevronDown className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
        </motion.div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.03) 50%, transparent 100%)",
        }} />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i}
                className="stat-card text-center p-8 rounded-3xl relative overflow-hidden cursor-default group"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.30)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,248,230,0.85)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(201,168,76,0.12)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.12)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.75)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                }}>
                <div className="text-4xl lg:text-5xl font-bold mb-2" style={{
                  background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  fontFamily: "'EB Garamond', serif",
                }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
                خدماتنا القانونية
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'EB Garamond', serif" }}>
                كل قضية لها <span style={{
                  background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>حل</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
                نغطي أبرز أنواع القضايا في المملكة بتحليل مبني على النصوص النظامية الرسمية
              </p>
            </motion.div>
          </div>

          <div ref={servicesRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((svc, i) => (
              <div key={i}
                className="service-card group relative p-7 rounded-3xl cursor-pointer overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(201,168,76,0.10)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${svc.color}45`;
                  (e.currentTarget as HTMLElement).style.background = `${svc.color}0A`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${svc.color}18`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.10)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.75)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                }}>
                {/* Number */}
                <span className="absolute top-5 left-5 text-xs font-mono font-bold tracking-wider"
                  style={{ color: `${svc.color}50` }}>
                  {svc.num}
                </span>
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${svc.color}18`, border: `1px solid ${svc.color}30` }}>
                  <svc.icon className="w-6 h-6" style={{ color: svc.color }} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>{svc.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{svc.desc}</p>
                {/* Arrow */}
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: svc.color }}>
                  <span>اعرف أكثر</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 cursor-pointer"
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
              }}>
              عرض جميع الخدمات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ AI ADVISOR HIGHLIGHT ══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(30,58,138,0.08) 0%, transparent 70%)",
        }} />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Feature list */}
            <div ref={featureRef}>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
                المستشار القانوني الذكي
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: "'EB Garamond', serif" }}>
                تحليل قانوني <span style={{
                  background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>حقيقي</span><br />لا اجتهادات عامة
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                مسؤول لا يعطيك إجابات جاهزة — يحلل وقائع قضيتك تحديداً ويربطها بالمواد النظامية المناسبة.
              </p>
              <div className="space-y-4">
                {FEATURES.map((f, i) => (
                  <div key={i}
                    className="feature-item flex items-center gap-4 p-4 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(201,168,76,0.12)",
                      backdropFilter: "blur(10px)",
                    }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <f.icon className="w-4 h-4" style={{ color: "#C9A84C" }} />
                    </div>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <Link to="/ai-advisor"
                className="mt-8 inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                  color: "#0A0A0A",
                  boxShadow: "0 8px 32px rgba(201,168,76,0.35)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(201,168,76,0.55)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(201,168,76,0.35)";
                }}>
                <Brain className="w-5 h-5" />
                جرّب الآن مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Chat preview mockup */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative">
              <div className="rounded-3xl overflow-hidden p-6"
                style={{
                  background: "rgba(10,10,18,0.9)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)",
                }}>
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-4 mb-4"
                  style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}>
                    <Scale className="w-4 h-4" style={{ color: "#0A0A0A" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#F0EAD8" }}>مسؤول</p>
                    <p className="text-[11px]" style={{ color: "#6B6355" }}>مستشار قانوني • متصل الآن</p>
                  </div>
                  <div className="mr-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>

                {/* Messages */}
                {[
                  { role: "user",      text: "تعرضت لابتزاز إلكتروني ولدي الرسائل والصور كدليل" },
                  { role: "assistant", text: "وقائعك تندرج تحت المادة ٣ و٥ من نظام مكافحة الجرائم المعلوماتية. الابتزاز الإلكتروني عقوبته لا تقل عن سنة وغرامة مليون ريال. خطوتك الأولى: احتفظ بجميع الأدلة وأبلغ هيئة الأمن السيبراني فوراً.\n\nهل تريد خطة إجراءات تفصيلية؟" },
                  { role: "user",      text: "نعم، ما الخطوات بالترتيب؟" },
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className={`flex mb-3 ${msg.role === "user" ? "justify-start flex-row-reverse" : "justify-start"}`}>
                    <div className="max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={msg.role === "user"
                        ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.15)", color: "#F0EAD8", borderBottomRightRadius: 4 }
                        : { background: "#141414", border: "1px solid rgba(255,255,255,0.05)", color: "#D4C9B0", borderBottomLeftRadius: 4, whiteSpace: "pre-line" }}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Typing */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}>
                    <Scale className="w-3.5 h-3.5" style={{ color: "#0A0A0A" }} />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl"
                    style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.1)" }}>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(j => (
                        <motion.div key={j} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#C9A84C" }}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: j * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                  color: "#0A0A0A",
                  boxShadow: "0 8px 24px rgba(201,168,76,0.4)",
                }}>
                ٣ مراحل تحليل
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ CASE REVIEW HIGHLIGHT ════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden p-12"
            style={{
              background: "linear-gradient(135deg, rgba(30,58,138,0.15) 0%, rgba(201,168,76,0.06) 100%)",
              border: "1px solid rgba(201,168,76,0.15)",
            }}>
            <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" style={{
              background: "radial-gradient(circle at top right, rgba(201,168,76,0.08) 0%, transparent 60%)",
            }} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
                  مراجعة القضايا والأحكام
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>
                  عندك حكم قضائي؟<br />
                  <span style={{
                    background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>نكتشف ثغراته</span>
                </h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                  ارفع الحكم القضائي أو السند التنفيذي وسيحلل مسؤول أخطاءه الإجرائية وفرص الاستئناف.
                </p>
                <Link to="/case-review"
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#C9A84C",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.12)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}>
                  <FileSearch className="w-4 h-4" />
                  ابدأ مراجعة القضية
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "أخطاء إجرائية", val: "٩٢٪ من الأحكام" },
                  { label: "فرص الاستئناف", val: "تحليل فوري" },
                  { label: "ثغرات التعليل", val: "كشف تلقائي" },
                  { label: "حجج مضادة", val: "مُصاغة جاهزة" },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(201,168,76,0.1)",
                    }}>
                    <p className="text-xs mb-1" style={{ color: "var(--text-faint)" }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: "#C9A84C" }}>{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div ref={ctaRef}
            className="relative rounded-3xl overflow-hidden p-16 text-center"
            style={{
              background: "rgba(255,255,255,0.80)",
              border: "1px solid rgba(201,168,76,0.20)",
              backdropFilter: "blur(24px) saturate(160%)",
              boxShadow: "0 16px 60px rgba(201,168,76,0.10), 0 4px 16px rgba(0,0,0,0.05)",
            }}>
            {/* Gold glow top */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.45), transparent)" }} />
              <div className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)" }} />
            </div>

            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 relative z-10"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 12px 40px rgba(201,168,76,0.4)" }}>
              <Scale className="w-10 h-10" style={{ color: "#0A0A0A" }} />
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6 relative z-10" style={{ fontFamily: "'EB Garamond', serif" }}>
              قضيتك تستحق
              <span style={{
                display: "block",
                background: "linear-gradient(135deg, #C9A84C 0%, #F0D78A 50%, #C9A84C 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>تحليلاً احترافياً</span>
            </h2>
            <p className="text-lg mb-10 relative z-10 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              ابدأ باستشارتك المجانية الآن. لا تسجيل بريد، لا انتظار — فقط اشرح قضيتك واحصل على تحليل قانوني فوري.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link to="/ai-advisor"
                className="flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-base transition-all cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                  color: "#0A0A0A",
                  boxShadow: "0 8px 32px rgba(201,168,76,0.5)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(201,168,76,0.65)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(201,168,76,0.5)";
                }}>
                <Brain className="w-5 h-5" />
                ابدأ استشارتك الآن
              </Link>
              <Link to="/contact"
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                style={{
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.5)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.06)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.25)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}>
                تواصل مع محامٍ
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
