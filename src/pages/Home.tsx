import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Scale, Brain, Shield, Zap, Target, AlertTriangle,
  FileSearch, Gavel, BookOpen, Lightbulb, ChevronRight,
  Sparkles, Activity, TrendingUp,
  Clock, Database, CheckCircle2, Plus,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { useMousePosition } from "@/hooks/useMousePosition";
import AnimatedHeadline from "@/components/AnimatedHeadline";
import MagneticButton from "@/components/MagneticButton";
import GlowCard from "@/components/GlowCard";
import MagneticWrapper from "@/components/MagneticWrapper";
import { useTheme } from "@/contexts/ThemeContext";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
interface AnalysisSection {
  key: string;
  label: string;
  content: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

interface ClassificationData {
  caseType: string;
  caseSubtype?: string;
  riskLevel: string;
  urgencyLevel: string;
}

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */
const SECTION_DEFS: Omit<AnalysisSection, "content">[] = [
  { key: "فهم_الحالة",         label: "فهم الحالة",         icon: <FileSearch className="w-5 h-5" />,  color: "border-[#4EA8DE]/40", glowColor: "#4EA8DE" },
  { key: "التكييف_القانوني",   label: "التكييف القانوني",   icon: <Gavel className="w-5 h-5" />,       color: "border-[#4EA8DE]/40", glowColor: "#4EA8DE" },
  { key: "العناصر_النظامية",   label: "العناصر النظامية",   icon: <BookOpen className="w-5 h-5" />,    color: "border-[#17B26A]/40", glowColor: "#17B26A" },
  { key: "نقاط_القوة",         label: "نقاط القوة",         icon: <Shield className="w-5 h-5" />,      color: "border-[#17B26A]/40", glowColor: "#17B26A" },
  { key: "نقاط_الضعف",         label: "نقاط الضعف",         icon: <AlertTriangle className="w-5 h-5" />, color: "border-[#F59E0B]/40", glowColor: "#F59E0B" },
  { key: "المخاطر_القانونية",  label: "المخاطر القانونية",  icon: <Zap className="w-5 h-5" />,        color: "border-[#F04438]/40", glowColor: "#F04438" },
  { key: "السيناريوهات_المحتملة", label: "السيناريوهات",  icon: <TrendingUp className="w-5 h-5" />,  color: "border-[#4EA8DE]/40", glowColor: "#4EA8DE" },
  { key: "الاستراتيجية_الموصى_بها", label: "الاستراتيجية", icon: <Target className="w-5 h-5" />,      color: "border-[#c9a84c]/40", glowColor: "#c9a84c" },
  { key: "الإثباتات_المطلوبة", label: "الإثباتات المطلوبة", icon: <Database className="w-5 h-5" />,    color: "border-[#4EA8DE]/40", glowColor: "#4EA8DE" },
  { key: "خطة_العمل",          label: "خطة العمل",          icon: <Activity className="w-5 h-5" />,    color: "border-[#c9a84c]/40", glowColor: "#c9a84c" },
  { key: "رؤى_استراتيجية",     label: "رؤى استراتيجية",     icon: <Lightbulb className="w-5 h-5" />,   color: "border-[#c9a84c]/50", glowColor: "#c9a84c" },
  { key: "التوجيه_الاحترافي",  label: "التوجيه الاحترافي",  icon: <Sparkles className="w-5 h-5" />,   color: "border-white/20",     glowColor: "#c9a84c" },
];

const QUICK_PROMPTS = [
  "تعرضت لابتزاز إلكتروني عبر واتساب ويهدد بنشر صوري",
  "شركتي فصلتني بدون سبب بعد ٣ سنوات عمل",
  "لدي ديون مستحقة وتم حجز راتبي من قبل التنفيذ",
  "شخص سرق حسابي البنكي وسحب مبالغ كبيرة",
];

const RISK_LABELS: Record<string, string> = { low: "منخفض", medium: "متوسط", high: "عالي", critical: "حرج" };
const URGENCY_LABELS: Record<string, string> = { low: "عادي", medium: "متوسط", high: "عاجل", urgent: "حرج" };
const CASE_TYPE_LABELS: Record<string, string> = {
  enforcement: "تنفيذ / ديون", cybercrime: "جرائم إلكترونية", drugs: "مخدرات",
  labor: "عمالي", civil: "مدني", criminal: "جنائي", commercial: "تجاري", family: "أحوال شخصية", general: "عام",
};

/* ═══════════════════════════════════════════
   CINEMATIC PARTICLE BACKGROUND
   ═══════════════════════════════════════════ */
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas!.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 200;
    const MOUSE_RADIUS = 300;
    const MOUSE_FORCE = 0.8;

    const resize = () => {
      w = canvas!.width = canvas!.offsetWidth;
      h = canvas!.height = canvas!.offsetHeight;
    };
    resize();

    interface Particle {
      x: number; y: number; baseX: number; baseY: number;
      vx: number; vy: number; size: number; alpha: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      particles.push({
        x, y, baseX: x, baseY: y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const particleColor = theme === "dark"
      ? { r: 201, g: 168, b: 76 }
      : { r: 139, g: 105, b: 20 };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    canvas.addEventListener("mousemove", handleMouse, { passive: true });
    canvas.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", resize);

    let frameId: number;
    const draw = () => {
      ctx!.clearRect(0, 0, w, h);
      const mouse = mouseRef.current;
      const { r, g, b } = particleColor;

      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx += (p.baseX - p.x) * 0.006;
        p.vy += (p.baseY - p.y) * 0.006;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
        if (p.x > w) { p.x = w; p.vx *= -0.5; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
        if (p.y > h) { p.y = h; p.vy *= -0.5; }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        ctx!.fill();

        if (p.size > 1.2) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.2})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx!.fillStyle = grad;
          ctx!.fill();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            const alpha = (1 - d / CONNECTION_DIST) * 0.1;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      frameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ opacity: theme === "dark" ? 0.8 : 0.5 }}
    />
  );
}

/* ═══════════════════════════════════════════
   TYPEWRITER TEXT
   ═══════════════════════════════════════════ */
function TypewriterText({ text, speed = 60, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-[2px] h-[1em] align-middle"
          style={{ backgroundColor: "var(--accent-gold)", marginLeft: "4px" }}
        />
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════
   CONFIDENCE GAUGE
   ═══════════════════════════════════════════ */
function ConfidenceGauge({ level }: { level: number }) {
  const colors = ["#F04438", "#F59E0B", "#4EA8DE", "#17B26A"];
  const color = colors[Math.min(Math.floor(level / 25), 3)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="flex items-center gap-3 p-4"
      style={{
        background: "linear-gradient(to bottom, var(--bg-card-hover), var(--bg-card))",
        border: "1px solid var(--border-default)",
        borderRadius: "0.5rem",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border-default)" strokeWidth="4" />
          <motion.circle
            cx="28" cy="28" r="24" fill="none" stroke={color}
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 24}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - level / 100) }}
            transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{level}%</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono-ar mb-0.5" style={{ color: "var(--text-faint)" }}>تقدير قوة الموقف القانوني</div>
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          {level >= 75 ? "موقف قوي" : level >= 50 ? "موقف متوسط" : level >= 25 ? "موقف ضعيف" : "موقف حرج"}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   ANALYSIS CARD (cinematic)
   ═══════════════════════════════════════════ */
function AnalysisCard({ section, index }: { section: AnalysisSection; index: number }) {
  return (
    <MagneticWrapper strength={0.15} scale={1.03} tilt={true} glow={true} glowColor={section.glowColor} glowIntensity={0.1}>
      <GlowCard
        glowColor={section.color.includes("F04438") ? "#F04438" : section.color.includes("F59E0B") ? "#F59E0B" : section.color.includes("4EA8DE") ? "#4EA8DE" : "#c9a84c"}
        delay={index * 0.08}
        className={section.color}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--accent-gold)/20, var(--accent-gold)/5)",
                border: "1px solid var(--accent-gold)/15",
                color: "var(--accent-gold)",
              }}
            >
              {section.icon}
            </motion.div>
            <h3
              className="text-sm font-bold tracking-wide"
              style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              {section.label}
            </h3>
          </div>
          <p className="text-sm leading-[1.9] body-text" style={{ color: "var(--text-secondary)" }}>{section.content}</p>
        </div>
      </GlowCard>
    </MagneticWrapper>
  );
}

/* ═══════════════════════════════════════════
   MAIN HOME PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
  const [view, setView] = useState<"hero" | "thinking" | "analysis">("hero");
  const [input, setInput] = useState("");
  const [sections, setSections] = useState<AnalysisSection[]>([]);
  const [classification, setClassification] = useState<ClassificationData | null>(null);
  const [kbUsed, setKbUsed] = useState(false);
  const [kbCount, setKbCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [aiResponse, setAiResponse] = useState("");
  const analysisRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();
  const fingerprint = getDeviceFingerprint();
  const { theme } = useTheme();

  const createConversation = trpc.conversation.create.useMutation();
  const chatMutation = trpc.chat.send.useMutation();

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || chatMutation.isPending) return;
    const text = input.trim();

    setView("thinking");

    const conv = await createConversation.mutateAsync({
      deviceFingerprint: fingerprint,
      title: text.slice(0, 50) + "...",
    });

    chatMutation.mutate(
      { conversationId: conv.id, message: text },
      {
        onSuccess: (data: any) => {
          if (!data) return;

          setAiResponse(data.content || "");
          setClassification(data.classification);
          setKbUsed(data.kbUsed);
          setKbCount(data.kbChunksCount);

          const confMap: Record<string, number> = { low: 30, medium: 55, high: 75, critical: 90 };
          setConfidence(confMap[data.classification?.riskLevel] ?? 50);

          if (data.analysis) {
            const analysisEntries = Object.entries(data.analysis as Record<string, string>)
              .filter(([k]) => !k.startsWith("_"))
              .filter(([k]) => SECTION_DEFS.find((d) => d.key === k));

            const builtSections: AnalysisSection[] = analysisEntries
              .map(([key, content]) => {
                const def = SECTION_DEFS.find((d) => d.key === key);
                if (!def) return null;
                return { key, label: def.label, content, icon: def.icon, color: def.color, glowColor: def.glowColor };
              })
              .filter(Boolean) as AnalysisSection[];

            const orderMap = Object.fromEntries(SECTION_DEFS.map((d, i) => [d.key, i]));
            builtSections.sort((a, b) => (orderMap[a.key] ?? 99) - (orderMap[b.key] ?? 99));

            setSections(builtSections);
          }

          setTimeout(() => {
            setView("analysis");
            setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          }, 2500);
        },
        onError: () => setView("hero"),
      }
    );
  }, [input, chatMutation, createConversation, fingerprint]);

  /* ═════ HERO VIEW ═════ */
  if (view === "hero") {
    return (
      <div
        className="relative min-h-screen overflow-hidden"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        <ParticleBackground />

        {/* Ambient radial gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--grad-radial)" }} />

        {/* Parallax grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,168,76,${theme === "dark" ? 0.015 : 0.008}) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,${theme === "dark" ? 0.015 : 0.008}) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
            transform: `translate(${mouse.normalizedX * -15}px, ${mouse.normalizedY * -15}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />

        {/* Header */}
        <header className="relative z-20 flex items-center justify-between px-6 py-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2.5"
          >
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))" }}
            >
              <Scale className="w-4 h-4" style={{ color: "var(--bg-primary)" }} />
            </motion.div>
            <span
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              مسؤول
            </span>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:flex items-center gap-1"
          >
            {[
              { to: "/services", label: "الخدمات" },
              { to: "/about", label: "عن مسؤول" },
              { to: "/contact", label: "تواصل" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-xs rounded-lg transition-all duration-300"
                style={{ color: "var(--text-faint)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/ai-advisor"
              className="px-3 py-2 text-xs rounded-lg transition-all duration-300 ml-2 flex items-center gap-1"
              style={{
                color: "var(--accent-gold)",
                backgroundColor: "var(--accent-gold)/10",
              }}
            >
              <Brain className="w-3 h-3" />
              المحترف
            </Link>
          </motion.nav>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-8 pb-20 min-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full"
              style={{
                background: "linear-gradient(to bottom, var(--bg-card-hover), var(--bg-card))",
                border: "1px solid var(--accent-gold)/20",
                backdropFilter: "blur(16px)",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent-gold)" }} />
              </motion.div>
              <span
                className="text-[11px] tracking-wider"
                style={{ color: "var(--accent-gold)", opacity: 0.7, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                أول مستشار قانوني ذكي في السعودية
              </span>
            </motion.div>

            {/* Premium Hero Headline with magnetic tilt + shimmer */}
            <MagneticWrapper strength={0.1} scale={1.02} tilt={true} glow={false}>
              <div className="mb-4" style={{ perspective: 1000 }}>
                <h1 className="hero-headline text-4xl sm:text-5xl lg:text-7xl">
                  <span className="block mb-2 text-shimmer-hover" style={{ color: "var(--text-primary)", transition: "all 0.3s ease" }}>
                    <AnimatedHeadline text="المستقبل يحتاج" delay={0.8} speed={0.04} />
                  </span>
                  <span className="block text-gradient mt-2">
                    <AnimatedHeadline text="وكيلاً ذكياً" delay={1.6} speed={0.04} />
                  </span>
                </h1>
              </div>
            </MagneticWrapper>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.8 }}
              className="text-sm sm:text-base max-w-lg mx-auto mb-10 leading-relaxed body-text"
              style={{ color: "var(--text-muted)" }}
            >
              اكتب قضيتك بالعربية — وسيقوم مسؤول بتحليلها قانونياً
              من خلال 3 مراحل ذكية، مع الاستشهاد بالأنظمة السعودية
            </motion.p>

            {/* Main Input with glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.2, duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative group input-glow-animated">
                <div
                  className="absolute -inset-[1px] rounded-xl opacity-40 group-hover:opacity-70 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm group-hover:blur-md"
                  style={{
                    background: "linear-gradient(to right, var(--accent-gold)/40, var(--accent-blue)/20, var(--accent-gold)/40)",
                  }}
                />
                <div
                  className="relative rounded-xl p-1 transition-all duration-500"
                  style={{
                    background: "linear-gradient(to bottom, var(--bg-card-hover), var(--bg-card))",
                    border: "1px solid var(--border-default)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                    placeholder="اكتب قضيتك الآن... اصف الوقائع، التواريخ، والأطراف المعنية"
                    rows={3}
                    className="w-full bg-transparent text-base text-right placeholder:text-[var(--text-faint)] focus:outline-none resize-none p-4 pb-14 leading-relaxed"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <div className="absolute left-3 bottom-3 flex items-center gap-2">
                    <MagneticButton
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg"
                      strength={0.2}
                    >
                      <span
                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))",
                          color: "var(--bg-primary)",
                        }}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        حلل قضيتي
                      </span>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Prompts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.6, duration: 0.8 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
              <span
                className="text-[10px] ml-2"
                style={{ color: "var(--text-faint)", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                أمثلة:
              </span>
              {QUICK_PROMPTS.map((prompt, i) => (
                <MagneticWrapper key={i} strength={0.2} scale={1.06} tilt={false} glow={true} glowIntensity={0.12}>
                  <motion.button
                    onClick={() => setInput(prompt)}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.8 + i * 0.1 }}
                    className="px-3 py-1.5 text-[11px] rounded-md transition-all duration-300"
                    style={{
                      color: "var(--text-muted)",
                      backgroundColor: "var(--text-faint)",
                      border: "1px solid var(--border-subtle)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.borderColor = "var(--accent-gold)/20";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                    }}
                  >
                    {prompt.slice(0, 35)}...
                  </motion.button>
                </MagneticWrapper>
              ))}
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4.2, duration: 0.8 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-[10px]"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--text-faint)" }}
            >
              {[
                { icon: <Database className="w-3 h-3" />, text: "80+ مادة قانونية" },
                { icon: <Shield className="w-3 h-3" />, text: "4 أنظمة سعودية" },
                { icon: <Zap className="w-3 h-3" />, text: "3 مراحل تحليل" },
                { icon: <CheckCircle2 className="w-3 h-3" />, text: "تحليل فوري" },
              ].map((item, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05, color: "var(--accent-gold)" }}
                  className="flex items-center gap-1.5 transition-colors duration-300"
                >
                  {item.icon}
                  {item.text}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full flex items-start justify-center p-1"
              style={{ border: "1px solid var(--border-default)" }}
            >
              <div className="w-1 h-2 rounded-full" style={{ backgroundColor: "var(--text-muted)" }} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═════ THINKING VIEW ═════ */
  if (view === "thinking") {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        <ParticleBackground />
        <div className="absolute inset-0" style={{ background: "var(--grad-radial)" }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 text-center"
        >
          {/* Cinematic orbital system */}
          <div className="relative w-40 h-40 mx-auto mb-10" style={{ perspective: 800 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="w-full h-full rounded-full border border-dashed" style={{ borderColor: "var(--accent-gold)/15" }} />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-4"
            >
              <div className="w-full h-full rounded-full border border-dashed" style={{ borderColor: "var(--accent-blue)/10" }} />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute inset-8"
            >
              <div className="w-full h-full rounded-full border border-dashed" style={{ borderColor: "var(--accent-gold)/8" }} />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm"
                style={{
                  background: "linear-gradient(135deg, var(--accent-gold)/20, var(--accent-gold)/5)",
                  border: "1px solid var(--accent-gold)/25",
                }}
              >
                <Brain className="w-7 h-7" style={{ color: "var(--accent-gold)" }} />
              </div>
            </motion.div>

            {[0, 72, 144, 216, 288].map((deg, i) => (
              <motion.div
                key={deg}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "linear", delay: i * 0.3 }}
                className="absolute inset-0"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className="absolute w-2.5 h-2.5 rounded-full shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))",
                    boxShadow: "0 0 12px var(--glow-gold)",
                    top: "50%",
                    left: "100%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </motion.div>
            ))}
          </div>

          <h2
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            <TypewriterText text="جاري التحليل القانوني..." speed={50} />
          </h2>
          <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
            يتم المرور على المراحل الثلاث للتحليل العميق
          </p>

          <div className="flex items-center justify-center gap-8 sm:gap-10">
            {[
              { label: "تحليل القضية", icon: <FileSearch className="w-4 h-4" />, delay: 0, accent: "var(--accent-gold)" },
              { label: "التفكير الاستراتيجي", icon: <Brain className="w-4 h-4" />, delay: 0.8, accent: "var(--accent-blue)" },
              { label: "صياغة الرد", icon: <Sparkles className="w-4 h-4" />, delay: 1.6, accent: "var(--accent-gold)" },
            ].map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stage.delay, type: "spring", stiffness: 200 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  animate={i === 0 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, delay: stage.delay }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${stage.accent}15`,
                    borderColor: `${stage.accent}25`,
                    color: stage.accent,
                  }}
                >
                  {stage.icon}
                </motion.div>
                <span className="text-[10px]" style={{ color: "var(--text-faint)", fontFamily: "'IBM Plex Mono', monospace" }}>
                  {stage.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ═════ ANALYSIS VIEW ═════ */
  return (
    <div className="min-h-screen relative" ref={analysisRef} style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <ParticleBackground />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: theme === "dark"
            ? "radial-gradient(ellipse at top, rgba(201,168,76,0.03) 0%, transparent 50%)"
            : "radial-gradient(ellipse at top, rgba(139,105,20,0.03) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          backgroundColor: theme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(245,240,232,0.8)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))" }}
          >
            <Scale className="w-4 h-4" style={{ color: "var(--bg-primary)" }} />
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            مسؤول
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setView("hero"); setInput(""); setSections([]); setClassification(null); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-all duration-300"
          style={{ color: "var(--text-faint)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
        >
          <Plus className="w-3.5 h-3.5" />
          قضية جديدة
        </motion.button>
      </motion.header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Classification Bar */}
        {classification && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-xs font-mono-ar px-3 py-1.5 rounded-lg border"
              style={{ backgroundColor: "var(--accent-gold)/15", color: "var(--accent-gold)", borderColor: "var(--accent-gold)/20" }}
            >
              {CASE_TYPE_LABELS[classification.caseType] || classification.caseType}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`text-xs font-mono-ar px-3 py-1.5 rounded-lg border ${
                classification.riskLevel === "high" || classification.riskLevel === "critical"
                  ? "bg-[#F04438]/10 text-[#F04438] border-[#F04438]/20"
                  : classification.riskLevel === "medium"
                  ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                  : "bg-[#17B26A]/10 text-[#17B26A] border-[#17B26A]/20"
              }`}
            >
              المخاطر: {RISK_LABELS[classification.riskLevel]}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`text-xs font-mono-ar px-3 py-1.5 rounded-lg border ${
                classification.urgencyLevel === "urgent" || classification.urgencyLevel === "high"
                  ? "bg-[#F04438]/10 text-[#F04438] border-[#F04438]/20"
                  : classification.urgencyLevel === "medium"
                  ? "bg-[#4EA8DE]/10 text-[#4EA8DE] border-[#4EA8DE]/20"
                  : "bg-white/5 text-white/40 border-white/10"
              }`}
            >
              العجلة: {URGENCY_LABELS[classification.urgencyLevel]}
            </motion.span>
            {classification.caseSubtype && (
              <span className="text-[10px] font-mono-ar" style={{ color: "var(--text-faint)" }}>{classification.caseSubtype}</span>
            )}
          </motion.div>
        )}

        {/* KB Badge */}
        {kbUsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex items-center gap-2 p-4 mb-8 rounded-lg border"
            style={{ backgroundColor: "#17B26A/8", borderColor: "#17B26A/20" }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Database className="w-4 h-4 text-[#17B26A]" />
            </motion.div>
            <span className="text-xs text-[#17B26A] font-mono-ar">
              التحليل مبني على {kbCount} مادة قانونية من قاعدة المعرفة السعودية
            </span>
          </motion.div>
        )}

        {/* Confidence + Stats Row */}
        {classification && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <ConfidenceGauge level={confidence} />

            <GlowCard glowColor="#4EA8DE" intensity={0.3}>
              <div className="p-4 flex items-center gap-3">
                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#4EA8DE/10" }}>
                  <Shield className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
                </motion.div>
                <div>
                  <div className="text-[10px] font-mono-ar" style={{ color: "var(--text-faint)" }}>الأنظمة المطبقة</div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                    {classification.caseType === "enforcement" ? "نظام التنفيذ" :
                     classification.caseType === "cybercrime" ? "الجرائم المعلوماتية" :
                     classification.caseType === "drugs" ? "مكافحة المخدرات" :
                     classification.caseType === "labor" ? "نظام العمل" : "أنظمة متعددة"}
                  </div>
                </div>
              </div>
            </GlowCard>

            <GlowCard glowColor="#c9a84c" intensity={0.3}>
              <div className="p-4 flex items-center gap-3">
                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold)/10" }}>
                  <Clock className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
                </motion.div>
                <div>
                  <div className="text-[10px] font-mono-ar" style={{ color: "var(--text-faint)" }}>مدة التحليل</div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>فوري</div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        )}

        {/* AI Response Summary */}
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-8"
          >
            <GlowCard glowColor="#c9a84c" intensity={0.4}>
              <div className="p-6 border-r-2" style={{ borderRightColor: "var(--accent-gold)/40", background: "linear-gradient(to left, var(--accent-gold)/5, transparent)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Brain className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                  </motion.div>
                  <span className="text-xs font-mono-ar" style={{ color: "var(--accent-gold)" }}>ملخص التحليل</span>
                </div>
                <p className="text-sm leading-[1.9] body-text" style={{ color: "var(--text-secondary)" }}>{aiResponse}</p>
              </div>
            </GlowCard>
          </motion.div>
        )}

        {/* Analysis Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section, i) => (
            <AnalysisCard key={section.key} section={section} index={i} />
          ))}
        </div>

        {/* Action Layer */}
        {classification && (classification.riskLevel === "high" || classification.riskLevel === "critical" || classification.urgencyLevel === "urgent") && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sections.length * 0.08 + 0.3, type: "spring", stiffness: 100 }}
            className="mt-8"
          >
            <GlowCard glowColor="#F04438" intensity={0.5}>
              <div className="p-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border"
                  style={{ backgroundColor: "#F04438/10", borderColor: "#F04438/20" }}
                >
                  <AlertTriangle className="w-8 h-8 text-[#F04438]" />
                </motion.div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  ننصحك بالتواصل مع محامٍ مختص
                </h3>
                <p className="text-sm max-w-md mx-auto mb-6 body-text" style={{ color: "var(--text-muted)" }}>
                  هذه القضية تحمل مخاطر {RISK_LABELS[classification.riskLevel]} ودرجة عجلة {URGENCY_LABELS[classification.urgencyLevel]}.
                  فريق مسؤول للمحاماة جاهز لمراجعة قضيتك بشكل مفصل.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <MagneticButton className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold rounded-lg" strength={0.15}>
                    <Link to="/case-review" className="contents">
                      <span
                        className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))",
                          color: "var(--bg-primary)",
                        }}
                      >
                        <Shield className="w-4 h-4" />
                        اطلب مراجعة خبير
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </MagneticButton>
                  <Link
                    to="/ai-advisor"
                    className="flex items-center gap-2 px-8 py-3.5 text-sm font-medium rounded-lg transition-all duration-300"
                    style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                  >
                    <Brain className="w-4 h-4" />
                    استمر في المحادثة
                  </Link>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        )}

        {/* Footer — Try Again */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sections.length * 0.08 + 0.6 }}
          className="mt-12 text-center pb-10"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setView("hero"); setInput(""); setSections([]); setClassification(null); }}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs rounded-lg transition-all duration-300"
            style={{ color: "var(--text-faint)", border: "1px solid var(--border-subtle)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
          >
            <Plus className="w-3.5 h-3.5" />
            تحليل قضية جديدة
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
