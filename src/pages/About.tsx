import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Scale, Shield, Brain, BookOpen, Star, CheckCircle,
  ArrowLeft, Target, Globe, Lock,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const VALUES = [
  { icon: Shield,   color: "#4EA8DE", title: "الأمانة",     desc: "نقدم الحقيقة القانونية كاملة، حتى حين تكون غير مريحة. لا تجميل للوضع، لا مجاملات على حساب حقوقك." },
  { icon: Brain,    color: "#C9A84C", title: "الدقة",       desc: "كل تحليل مبني على نصوص نظامية رسمية. لا افتراضات، لا اجتهادات — فقط القانون مطبقاً على وقائعك." },
  { icon: Lock,     color: "#17B26A", title: "السرية",      desc: "ما تشاركه معنا يبقى بيننا. سرية تامة وحماية كاملة لمعلوماتك الشخصية والقانونية." },
  { icon: Globe,    color: "#9B59B6", title: "الشمولية",   desc: "من الابتزاز الإلكتروني إلى نزاعات الشركات — نغطي كل أنواع القضايا بنفس المستوى من الاحترافية." },
  { icon: Target,   color: "#E74C3C", title: "الاستراتيجية", desc: "لا نكتفي بوصف القانون — نفكر كمحامٍ ويوضع استراتيجية للفوز بالقضية أو الحد من الخسائر." },
  { icon: Star,     color: "#F39C12", title: "الاستمرارية", desc: "تطوير مستمر لقاعدة المعرفة القانونية وتحديث دوري لمواكبة أحدث الأنظمة والتعديلات." },
];

const TIMELINE = [
  { year: "٢٠٢٠", title: "الفكرة",      desc: "بدأت الفكرة من حاجة حقيقية: كثير من الناس يجهلون حقوقهم القانونية ويدفعون ثمناً باهظاً لهذا الجهل." },
  { year: "٢٠٢٢", title: "قاعدة المعرفة", desc: "بناء قاعدة معرفية قانونية شاملة من الأنظمة السعودية الرسمية — أكثر من ٥٠٠ مادة قانونية موثقة." },
  { year: "٢٠٢٣", title: "الإطلاق",     desc: "إطلاق النسخة التجريبية الأولى من مسؤول مع التركيز على جودة التحليل قبل التوسع." },
  { year: "٢٠٢٤", title: "التطور",      desc: "تطوير نظام التحليل الثلاثي المراحل ودمج كشف ثغرات الأحكام القضائية تلقائياً." },
  { year: "٢٠٢٥", title: "الراهن",      desc: "أكثر من ٥٠٠ قضية محللة، ٨ تخصصات قانونية، وفريق متخصص من القانونيين والمطورين." },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null!);
  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 2.2, ease: "power2.out",
      scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val) + suffix;
      },
    });
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function About() {
  const statsRef    = useRef<HTMLDivElement>(null!);
  const valuesRef   = useRef<HTMLDivElement>(null!);
  const timelineRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-hero-line", {
        y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out",
      });
      ScrollTrigger.batch(".value-card", {
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power2.out" }),
        start: "top 88%",
      });
      gsap.set(".value-card", { opacity: 0, y: 40 });

      gsap.from(".timeline-item", {
        x: -40, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: timelineRef.current, start: "top 75%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)",
          }} />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="about-hero-line">
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-5" style={{ color: "var(--accent-gold)" }}>
              عن مسؤول
            </p>
          </div>
          <h1 className="about-hero-line text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "'EB Garamond', serif" }}>
            حين يلتقي الذكاء الاصطناعي<br />
            <span style={{
              background: "linear-gradient(135deg, #C9A84C, #F0D78A, #C9A84C)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              بالخبرة القانونية
            </span>
          </h1>
          <p className="about-hero-line text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: "var(--text-muted)" }}>
            مسؤول ليس مجرد أداة — هو خبير قانوني متخصص في الأنظمة السعودية، يحلل قضيتك بدقة ويضع استراتيجية للتعامل معها.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} className="py-16 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { v: 500, s: "+", l: "قضية محللة" },
              { v: 80,  s: "+", l: "مادة قانونية موثقة" },
              { v: 8,   s: "",  l: "تخصصات قانونية" },
              { v: 98,  s: "%", l: "رضا المستخدمين" },
            ].map((s, i) => (
              <div key={i}
                className="p-6 rounded-3xl text-center"
                style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(201,168,76,0.12)", backdropFilter: "blur(12px)" }}>
                <div className="text-4xl font-bold mb-2" style={{
                  background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  fontFamily: "'EB Garamond', serif",
                }}>
                  <Counter target={s.v} suffix={s.s} />
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}>
              <div className="relative p-10 rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(30,58,138,0.06) 100%)",
                  border: "1px solid rgba(201,168,76,0.15)",
                }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 8px 24px rgba(201,168,76,0.3)" }}>
                  <Scale className="w-8 h-8" style={{ color: "#0A0A0A" }} />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'EB Garamond', serif" }}>مهمتنا</h3>
                <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  نؤمن بأن كل شخص يستحق الوصول إلى معلومات قانونية دقيقة، بغض النظر عن قدرته المالية على توكيل محامٍ.
                  مسؤول يجسر الهوة بين المواطن والقانون بلغة واضحة ومباشرة.
                </p>
                <div className="mt-6 space-y-3">
                  {["تحليل مجاني للاستشارة الأولى", "استشهاد بالمواد النظامية الرسمية", "استراتيجية واضحة وخطة عمل"].map(f => (
                    <div key={f} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#17B26A" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
                ما يميزنا
              </p>
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "'EB Garamond', serif" }}>
                ليس مجرد <span style={{
                  background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>استشارة</span>
              </h2>
              <div className="space-y-5">
                {[
                  { t: "تحليل ثلاثي المراحل",    d: "وقائع → استراتيجية → خطة عمل. كل مرحلة مبنية على الأخرى لنتيجة متكاملة." },
                  { t: "قاعدة معرفة قانونية",     d: "80+ مادة قانونية موثقة من 7 أنظمة رسمية، محدّثة باستمرار." },
                  { t: "كشف ثغرات الأحكام",       d: "تحليل تلقائي للأحكام القضائية للبحث عن أخطاء إجرائية وفرص الاستئناف." },
                  { t: "استجابة فورية",            d: "تحليل في ثوانٍ، لا انتظار ولا مواعيد مسبقة." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <BookOpen className="w-4 h-4" style={{ color: "#C9A84C" }} />
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{item.t}</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section ref={valuesRef} className="py-24 relative">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(30,58,138,0.05) 0%, transparent 70%)",
        }} />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold tracking-[0.35em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>قيمنا</p>
              <h2 className="text-4xl font-bold" style={{ fontFamily: "'EB Garamond', serif" }}>
                مبادئنا لا تتغير
              </h2>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <div key={i}
                className="value-card p-7 rounded-3xl group cursor-default"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(201,168,76,0.10)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${v.color}40`;
                  (e.currentTarget as HTMLElement).style.background = `${v.color}0A`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${v.color}12`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.10)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.75)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${v.color}18`, border: `1px solid ${v.color}30` }}>
                  <v.icon className="w-5 h-5" style={{ color: v.color }} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section ref={timelineRef} className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>رحلتنا</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: "'EB Garamond', serif" }}>من فكرة إلى واقع</h2>
          </div>
          <div className="relative">
            {/* Line */}
            <div className="absolute right-6 top-0 bottom-0 w-px" style={{ background: "rgba(201,168,76,0.15)" }} />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div key={i} className="timeline-item flex gap-8 items-start">
                  {/* Dot */}
                  <div className="relative flex-shrink-0 w-12 flex justify-center">
                    <div className="w-3 h-3 rounded-full mt-1.5 relative z-10"
                      style={{ background: "#C9A84C", boxShadow: "0 0 0 4px rgba(201,168,76,0.15), 0 0 12px rgba(201,168,76,0.3)" }} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs px-3 py-1 rounded-full font-mono font-bold"
                        style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                        {item.year}
                      </span>
                      <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="p-14 rounded-3xl relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(201,168,76,0.15)", backdropFilter: "blur(20px) saturate(160%)", boxShadow: "0 8px 32px rgba(201,168,76,0.08)" }}>
            <div className="absolute inset-0" style={{
              background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)",
            }} />
            <h2 className="text-3xl font-bold mb-4 relative z-10" style={{ fontFamily: "'EB Garamond', serif" }}>
              جاهز للبدء؟
            </h2>
            <p className="mb-8 relative z-10" style={{ color: "var(--text-muted)" }}>
              استشارة مجانية، تحليل فوري، أنظمة سعودية رسمية.
            </p>
            <Link to="/ai-advisor"
              className="relative z-10 inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                color: "#0A0A0A",
                boxShadow: "0 8px 28px rgba(201,168,76,0.4)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(201,168,76,0.55)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(201,168,76,0.4)";
              }}>
              <Brain className="w-5 h-5" />
              ابدأ استشارتك الآن
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
