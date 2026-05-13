import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import SEO from "@/components/SEO";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Scale, Shield, Briefcase, Gavel, Lock,
  Brain, ArrowLeft, ChevronDown, Star,
  FileSearch, Clock, CheckCircle, Zap, Quote,
  BookOpen, MessageSquare, CheckCircle2,
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
  { icon: Shield,      color: "#4EA8DE", num: "01", title: "الجرائم الإلكترونية",       desc: "ابتزاز، احتيال، تشهير، اختراق — تحليل قانوني فوري بمواد نظامية محددة" },
  { icon: Briefcase,   color: "#C9A84C", num: "02", title: "التنفيذ والديون",            desc: "إجراءات التنفيذ، حجز الأموال، منع السفر، شيكات بدون رصيد" },
  { icon: Gavel,       color: "#17B26A", num: "03", title: "القضايا العمالية",           desc: "فصل تعسفي، مستحقات مالية، نزاعات عقود العمل، إصابات العمل" },
  { icon: Scale,       color: "#9B59B6", num: "04", title: "الأحوال الشخصية",           desc: "طلاق، حضانة، نفقة، ميراث — تحليل مبني على نظام الأحوال الشخصية" },
  { icon: Lock,        color: "#E74C3C", num: "05", title: "المخدرات والجرائم الجنائية", desc: "حيازة، اتجار، تعاطٍ، حقوق المتهم وإجراءات التقاضي" },
  { icon: FileSearch,  color: "#F39C12", num: "06", title: "القضايا التجارية",          desc: "نزاعات الشركات، عقود تجارية، إفلاس، تأسيس شركات وحوكمة" },
];

const TESTIMONIALS = [
  {
    name: "أحمد الشمري",
    role: "مدير شركة",
    text: "ساعدني مسؤول في فهم حقوقي كاملاً في نزاع تجاري معقد. التحليل كان دقيقاً ومبنياً على مواد قانونية محددة.",
    rating: 5,
    tag: "قضية تجارية",
  },
  {
    name: "سارة العتيبي",
    role: "موظفة سابقة",
    text: "تعرضت لفصل تعسفي وما كنت أعرف حقوقي. مسؤول شرح لي كل شيء بالتفصيل — المادة ٧٧ من نظام العمل، ومقدار التعويض الذي يحق لي.",
    rating: 5,
    tag: "قضية عمالية",
  },
  {
    name: "محمد الزهراني",
    role: "صاحب مشروع",
    text: "تعرضت لابتزاز إلكتروني وكنت في حالة ذعر. مسؤول حدّد المواد القانونية الدقيقة وأعطاني خطة عمل واضحة.",
    rating: 5,
    tag: "جريمة إلكترونية",
  },
];

const FEATURES = [
  { icon: Brain,        text: "تحليل ذكي مبني على الأنظمة السعودية الرسمية" },
  { icon: FileSearch,   text: "استشهاد مباشر بالمواد القانونية المحددة" },
  { icon: Clock,        text: "ردود فورية في ثوانٍ لا ساعات" },
  { icon: CheckCircle,  text: "تحليل ثلاثي المراحل: وقائع ← استراتيجية ← خطة" },
  { icon: Shield,       text: "سرية تامة لجميع الاستشارات" },
  { icon: Zap,          text: "كشف ثغرات الأحكام القضائية تلقائياً" },
];

const TRUST_BADGES = [
  { icon: BookOpen,   text: "مبني على الأنظمة السعودية" },
  { icon: Zap,        text: "تحليل أولي فوري" },
  { icon: Shield,     text: "سرية وخصوصية تامة" },
  { icon: Gavel,      text: "مراجعة محامٍ عند الحاجة" },
];

const HOW_IT_WORKS = [
  {
    num: "١",
    title: "اكتب وصف الحالة",
    desc: "اكتب السؤال أو تفاصيل المشكلة القانونية باختصار.",
    icon: FileSearch,
    color: "#C9A84C",
  },
  {
    num: "٢",
    title: "احصل على تحليل أولي",
    desc: "يعرض لك المستشار التكييف الأولي، الأنظمة ذات الصلة، والخطوات المقترحة.",
    icon: Brain,
    color: "#4EA8DE",
  },
  {
    num: "٣",
    title: "حوّلها لمختص",
    desc: "إذا كانت الحالة تحتاج مراجعة أعمق، يمكنك إرسالها لمحامٍ مختص.",
    icon: Gavel,
    color: "#17B26A",
  },
];

const LEGAL_SYSTEMS = [
  { name: "نظام التنفيذ",                         status: "available" as const },
  { name: "نظام العمل",                            status: "available" as const },
  { name: "نظام مكافحة المخدرات والمؤثرات العقلية", status: "available" as const },
  { name: "نظام الأحوال الشخصية",                  status: "available" as const },
  { name: "نظام الإجراءات الجزائية",               status: "available" as const },
  { name: "نظام مكافحة التزوير",                   status: "available" as const },
  { name: "نظام السجون والتوقيف",                  status: "available" as const },
  { name: "نظام مكافحة الجرائم المعلوماتية",        status: "coming"    as const },
  { name: "نظام الشركات",                          status: "coming"    as const },
];

const HOME_QUICK_PROMPTS = [
  { text: "عندي منع سفر بسبب تنفيذ، وش الخيارات المتاحة؟",   icon: Scale },
  { text: "تم فصلي من العمل بدون إنذار، ما موقفي؟",           icon: Briefcase },
  { text: "تعرضت لابتزاز إلكتروني، وش الخطوة النظامية؟",      icon: Shield },
  { text: "عندي خلاف مع شريك في شركة، كيف أبدأ؟",            icon: FileSearch },
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
  const navigate = useNavigate();
  const heroRef     = useRef<HTMLElement>(null!);
  const titleRef    = useRef<HTMLDivElement>(null!);
  const statsRef    = useRef<HTMLDivElement>(null!);
  const featureRef  = useRef<HTMLDivElement>(null!);
  const ctaRef      = useRef<HTMLDivElement>(null!);

  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY    = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpac = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.from(".hero-word", {
        y: 80, opacity: 0, duration: 1, stagger: 0.12,
        ease: "power3.out", delay: 0.3,
      });
      gsap.from(".hero-sub", {
        y: 30, opacity: 0, duration: 0.9, ease: "power2.out", delay: 0.9,
      });
      gsap.from(".hero-cta", {
        y: 20, opacity: 0, duration: 0.7, ease: "power2.out", delay: 1.2, stagger: 0.1,
      });

      gsap.utils.toArray<Element>(".section-label").forEach((el) => {
        gsap.from(el, {
          clipPath: "inset(0 100% 0 0)", opacity: 0, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<Element>(".section-heading").forEach((el) => {
        gsap.from(el, {
          y: 55, opacity: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 84%", once: true },
        });
      });

      gsap.utils.toArray<Element>(".section-subtext").forEach((el) => {
        gsap.from(el, {
          y: 25, opacity: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });

      gsap.utils.toArray<Element>(".reveal-line").forEach((el) => {
        gsap.from(el, {
          scaleX: 0, transformOrigin: "center center", duration: 1.2, ease: "power2.inOut",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      gsap.from(statsRef.current?.querySelectorAll(".stat-card") ?? [], {
        y: 60, opacity: 0, scale: 0.93, duration: 0.9, stagger: 0.13, ease: "power3.out",
        scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
      });

      gsap.set(".service-card", { opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" });
      ScrollTrigger.batch(".service-card", {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)",
            stagger: 0.1, duration: 0.72, ease: "power3.out",
          }),
        start: "top 88%",
      });

      gsap.from(".feature-item", {
        x: 45, opacity: 0, duration: 0.65, stagger: 0.09, ease: "power2.out",
        scrollTrigger: { trigger: featureRef.current, start: "top 76%" },
      });

      gsap.from(".case-review-box", {
        clipPath: "inset(0 0 0 100%)", duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: ".case-review-box", start: "top 83%" },
      });

      gsap.from(".case-mini-card", {
        scale: 0.85, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)",
        scrollTrigger: { trigger: ".case-review-box", start: "top 75%" },
      });

      gsap.set(".testimonial-card", { opacity: 0, y: 45 });
      ScrollTrigger.batch(".testimonial-card", {
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, duration: 0.85, ease: "power3.out" }),
        start: "top 87%",
      });

      gsap.from(ctaRef.current, {
        scale: 0.93, opacity: 0, y: 35, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: ctaRef.current, start: "top 82%" },
      });

      gsap.utils.toArray<Element>(".parallax-layer").forEach((el, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.to(el, {
          yPercent: 18 * dir, ease: "none",
          scrollTrigger: {
            trigger: (el as HTMLElement).closest("section") ?? el,
            start: "top bottom", end: "bottom top", scrub: 1.5,
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", overflowX: "hidden" }}>
      <SEO
        title="مسؤول — مستشارك القانوني الذكي للأنظمة السعودية"
        description="اسأل مستشارك القانوني الذكي واحصل على تحليل أولي منظم مبني على الأنظمة السعودية، مع إمكانية مراجعة الحالة من قبل مختص."
        path="/"
      />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="parallax-layer absolute inset-0" style={{
            background: "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(201,168,76,0.07) 0%, transparent 60%)",
          }} />
          <div className="parallax-layer absolute inset-0" style={{
            background: "radial-gradient(ellipse 60% 80% at 20% 80%, rgba(30,58,138,0.12) 0%, transparent 55%)",
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

            <motion.div style={{ y: heroY, opacity: heroOpac }} ref={titleRef} className="relative z-10 order-2 lg:order-1">
              <div className="hero-word inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}>
                <Star className="w-3 h-3 fill-current" />
                المستشار القانوني الذكي للأنظمة السعودية
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "'EB Garamond', serif" }}>
                <span className="hero-word block" style={{ color: "var(--text-primary)" }}>مستشارك</span>
                <span className="hero-word block" style={{
                  background: "linear-gradient(135deg, #C9A84C 0%, #F0D78A 50%, #C9A84C 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>القانوني</span>
                <span className="hero-word block" style={{ color: "var(--text-primary)" }}>الذكي</span>
              </h1>

              <p className="hero-sub text-lg leading-relaxed mb-4 max-w-lg"
                style={{ color: "var(--text-muted)", fontFamily: "'Lato', sans-serif" }}>
                اكتب سؤالك القانوني واحصل على تحليل أولي منظم مبني على الأنظمة السعودية، مع إمكانية تحويل الحالة لمحامٍ مختص عند الحاجة.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
                  ابدأ الاستشارة الآن
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Link>
                <Link to="/case-review"
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
                  راجع قضيتي مع مختص
                </Link>
              </div>

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

            <div className="order-1 lg:order-2 relative h-[360px] sm:h-[480px] lg:h-[600px]">
              <div className="absolute inset-0">
                <HeroScene />
              </div>
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 left-4 px-4 py-3 rounded-2xl z-10"
                style={{
                  background: "rgba(12,12,20,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}>
                <p className="text-xs font-bold" style={{ color: "#C9A84C" }}>٧ أنظمة قانونية</p>
                <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>في قاعدة المعرفة</p>
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
                <p className="text-xs font-bold" style={{ color: "#17B26A" }}>تحليل فوري</p>
                <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>بمواد نظامية محددة</p>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>
          <span className="text-xs tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>اكتشف المزيد</span>
          <ChevronDown className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
        </motion.div>
      </section>

      {/* ══ TRUST BAR ═════════════════════════════════════════════════════ */}
      <section className="py-10 relative overflow-hidden"
        style={{ background: "rgba(201,168,76,0.04)", borderTop: "1px solid rgba(201,168,76,0.12)", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_BADGES.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 group cursor-default"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.22)" }}>
                  <badge.icon className="w-4.5 h-4.5" style={{ color: "#C9A84C" }} />
                </div>
                <span className="text-sm font-medium leading-tight" style={{ color: "var(--text-secondary)" }}>
                  {badge.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ STATS ═════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-20 relative overflow-hidden">
        <div className="parallax-layer absolute inset-0" style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.03) 50%, transparent 100%)",
        }} />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i}
                className="stat-card text-center p-8 rounded-3xl relative overflow-hidden cursor-default"
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

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
              كيف يعمل مسؤول
            </p>
            <h2 className="section-heading text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>
              ثلاث خطوات{" "}
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>للوضوح القانوني</span>
            </h2>
            <p className="section-subtext text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              من وصف الحالة إلى فهم الموقف القانوني في دقائق
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 right-[calc(33%+1.5rem)] left-[calc(33%+1.5rem)] h-px"
              style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.4), rgba(201,168,76,0.1), rgba(201,168,76,0.4))" }} />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative text-center p-8 rounded-3xl group cursor-default"
                style={{
                  background: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 50px ${step.color}18`;
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${step.color}35`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.12)";
                }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                  style={{ background: `${step.color}14`, border: `1.5px solid ${step.color}30` }}>
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                  <span className="absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: step.color, color: "#0A0A0A" }}>
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/ai-advisor"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 cursor-pointer"
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
              ابدأ الآن مجاناً
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ MINI AI PREVIEW ═══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="parallax-layer absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(30,58,138,0.07) 0%, transparent 65%)",
        }} />
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="section-label text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
              جرّب الآن
            </p>
            <h2 className="section-heading text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>
              جرّب سؤالاً{" "}
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>قانونياً</span>
            </h2>
            <p className="section-subtext text-base" style={{ color: "var(--text-muted)" }}>
              اختر أحد الأسئلة الشائعة أو ابدأ في المستشار مباشرةً
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {HOME_QUICK_PROMPTS.map((prompt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/ai-advisor?q=${encodeURIComponent(prompt.text)}`)}
                className="flex items-center gap-4 p-5 rounded-2xl text-right cursor-pointer text-sm font-medium transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.80)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.40)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,248,230,0.85)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(201,168,76,0.12)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.15)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.80)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)";
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.20)" }}>
                  <prompt.icon className="w-4.5 h-4.5" style={{ color: "#C9A84C" }} />
                </div>
                <span className="flex-1 leading-relaxed">{prompt.text}</span>
                <ArrowLeft className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A84C", opacity: 0.7 }} />
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <Link to="/ai-advisor"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
              style={{ color: "var(--accent-gold)" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              <MessageSquare className="w-4 h-4" />
              أو ابدأ سؤالك الخاص في المستشار
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ SERVICES ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
              مجالات التخصص
            </p>
            <h2 className="section-heading text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'EB Garamond', serif" }}>
              كل قضية لها{" "}
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>مسار</span>
            </h2>
            <p className="section-subtext text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
              نغطي أبرز أنواع القضايا في المملكة بتحليل مبني على النصوص النظامية الرسمية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <span className="absolute top-5 left-5 text-xs font-mono font-bold tracking-wider"
                  style={{ color: `${svc.color}50` }}>
                  {svc.num}
                </span>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${svc.color}18`, border: `1px solid ${svc.color}30` }}>
                  <svc.icon className="w-6 h-6" style={{ color: svc.color }} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>{svc.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{svc.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: svc.color }}>
                  <span>ابدأ الاستشارة</span>
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

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ LEGAL SYSTEMS LIBRARY ═════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="parallax-layer absolute inset-0" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,168,76,0.05) 0%, transparent 60%)",
        }} />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
              قاعدة المعرفة القانونية
            </p>
            <h2 className="section-heading text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>
              مكتبة الأنظمة{" "}
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>السعودية</span>
            </h2>
            <p className="section-subtext text-base max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
              يعتمد مسؤول على قاعدة معرفة قانونية مرتبطة بالأنظمة السعودية ذات الصلة ويتم تطويرها باستمرار
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {LEGAL_SYSTEMS.map((system, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{
                  background: system.status === "available"
                    ? "rgba(255,255,255,0.80)"
                    : "rgba(248,248,248,0.60)",
                  border: system.status === "available"
                    ? "1px solid rgba(201,168,76,0.18)"
                    : "1px solid rgba(0,0,0,0.06)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: system.status === "available" ? "rgba(201,168,76,0.12)" : "rgba(0,0,0,0.04)",
                      border: system.status === "available" ? "1px solid rgba(201,168,76,0.22)" : "1px solid rgba(0,0,0,0.06)",
                    }}>
                    <Scale className="w-3.5 h-3.5" style={{ color: system.status === "available" ? "#C9A84C" : "#94a3b8" }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: system.status === "available" ? "var(--text-primary)" : "var(--text-faint)" }}>
                    {system.name}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={system.status === "available"
                    ? { background: "rgba(23,178,106,0.10)", color: "#17B26A" }
                    : { background: "rgba(100,116,139,0.08)", color: "#94a3b8" }}>
                  {system.status === "available" ? "متاح" : "قيد الإضافة"}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/legal-library"
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
              <BookOpen className="w-4 h-4" />
              استعرض مكتبة الأنظمة
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ AI ADVISOR HIGHLIGHT ══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="parallax-layer absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(30,58,138,0.08) 0%, transparent 70%)",
        }} />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div ref={featureRef}>
              <p className="section-label text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
                المستشار القانوني الذكي
              </p>
              <h2 className="section-heading text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: "'EB Garamond', serif" }}>
                تحليل قانوني{" "}
                <span style={{
                  background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>حقيقي</span>
                <br />لا اجتهادات عامة
              </h2>
              <p className="section-subtext text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
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

            {/* Chat preview */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden p-6"
                style={{
                  background: "rgba(10,10,18,0.9)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)",
                }}>
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
            </div>
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ WHEN YOU NEED A LAWYER ════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl overflow-hidden p-10 lg:p-14 relative"
            style={{
              background: "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(20,30,60,0.96) 100%)",
              border: "1px solid rgba(201,168,76,0.20)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
            }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-80 h-80" style={{
                background: "radial-gradient(circle at top right, rgba(201,168,76,0.10) 0%, transparent 55%)",
              }} />
              <div className="absolute bottom-0 left-0 w-64 h-64" style={{
                background: "radial-gradient(circle at bottom left, rgba(30,58,138,0.15) 0%, transparent 60%)",
              }} />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
                  style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}>
                  <Gavel className="w-3.5 h-3.5" />
                  متى تحتاج محامياً؟
                </div>
                <h2 className="section-heading text-3xl lg:text-4xl font-bold mb-6 leading-tight" style={{ fontFamily: "'EB Garamond', serif", color: "#F0EAD8" }}>
                  المستشار الذكي يوضّح المشهد.<br />
                  <span style={{
                    background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>المحامي يغيّره.</span>
                </h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "#94a3b8" }}>
                  المستشار الذكي يساعدك في فهم موقفك القانوني بشكل أولي. لكن بعض الحالات تحتاج مراجعة قانونية متخصصة — خصوصاً عند وجود أحكام، جلسات، مستندات، منع سفر، مطالبات مالية، بلاغات جنائية، أو مواعيد نظامية.
                </p>
                <Link to="/case-review"
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                    color: "#0A0A0A",
                    boxShadow: "0 8px 28px rgba(201,168,76,0.35)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(201,168,76,0.55)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(201,168,76,0.35)";
                  }}>
                  <Gavel className="w-4 h-4" />
                  أرسل قضيتي للمراجعة
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  "أحكام قضائية تحتاج استئناف",
                  "منع سفر أو حجز أموال",
                  "جلسات قضائية قادمة",
                  "مطالبات مالية كبيرة",
                  "بلاغات جنائية",
                  "مواعيد نظامية ضيقة",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A84C" }} />
                    <span className="text-sm" style={{ color: "#CBD5E1" }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ CASE REVIEW HIGHLIGHT ════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="case-review-box relative rounded-3xl overflow-hidden p-12"
            style={{
              background: "linear-gradient(135deg, rgba(30,58,138,0.15) 0%, rgba(201,168,76,0.06) 100%)",
              border: "1px solid rgba(201,168,76,0.15)",
            }}>
            <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" style={{
              background: "radial-gradient(circle at top right, rgba(201,168,76,0.08) 0%, transparent 60%)",
            }} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
              <div>
                <p className="section-label text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
                  مراجعة القضايا والأحكام
                </p>
                <h2 className="section-heading text-3xl lg:text-4xl font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>
                  عندك حكم قضائي؟<br />
                  <span style={{
                    background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>نكتشف ثغراته</span>
                </h2>
                <p className="section-subtext text-base leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
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
                  <div key={i} className="case-mini-card p-5 rounded-2xl"
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
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="reveal-line h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ══ TESTIMONIALS ═════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="parallax-layer absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)",
        }} />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
              آراء العملاء
            </p>
            <h2 className="section-heading text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'EB Garamond', serif" }}>
              ماذا قالوا عن{" "}
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>مسؤول</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="testimonial-card p-7 rounded-3xl relative"
                style={{
                  background: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(201,168,76,0.10)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(201,168,76,0.10)";
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.25)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.10)";
                }}
              >
                <Quote className="w-8 h-8 mb-4" style={{ color: "rgba(201,168,76,0.35)" }} />
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                  {t.text}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-faint)" }}>{t.role}</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}>
                    {t.tag}
                  </span>
                </div>
                <div className="flex gap-1 mt-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: "#C9A84C" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
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

            <h2 className="text-4xl lg:text-5xl font-bold mb-4 relative z-10" style={{ fontFamily: "'EB Garamond', serif" }}>
              ابدأ من سؤال واحد
            </h2>
            <p className="text-base mb-3 relative z-10 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              اكتب سؤالك الآن، واحصل على تصور أولي يساعدك على فهم موقفك قبل اتخاذ الخطوة التالية.
            </p>
            <p className="text-xs mb-10 relative z-10" style={{ color: "var(--text-faint)" }}>
              المخرجات تحليل أولي ولا تُعد استشارة قانونية نهائية
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
                ابدأ الاستشارة
              </Link>
              <a
                href="https://wa.me/966550341728?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D9%85%D8%B3%D8%A4%D9%88%D9%84%20%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86%D9%8A%D8%A9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                style={{
                  border: "1px solid rgba(37,211,102,0.35)",
                  color: "#16a34a",
                  background: "rgba(37,211,102,0.06)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,0.12)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,211,102,0.55)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,211,102,0.35)";
                }}>
                <MessageSquare className="w-4 h-4" />
                تواصل عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
