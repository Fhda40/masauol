import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Menu, X, ChevronLeft, Sparkles, Shield, Phone, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ParticleNetwork from "./ParticleNetwork";
import CursorGlow from "./CursorGlow";
import SpotlightOverlay from "./SpotlightOverlay";
import MagneticWrapper from "./MagneticWrapper";
import Lenis from "@studio-freight/lenis";

const navLinks = [
  { path: "/", label: "الرئيسية" },
  { path: "/services", label: "الخدمات" },
  { path: "/ai-advisor", label: "المستشار الذكي", highlight: true },
  { path: "/case-review", label: "مراجعة قضية" },
  { path: "/about", label: "عن مسؤول" },
  { path: "/contact", label: "تواصل" },
];

/* ═══════════════════════════════════════════
   THEME TRANSITION OVERLAY
   ═══════════════════════════════════════════ */
function ThemeTransitionOverlay() {
  const { isTransitioning, theme } = useTheme();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: theme === "dark"
                ? "linear-gradient(90deg, transparent 0%, rgba(245,240,232,0.15) 50%, transparent 100%)"
                : "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.12) 50%, transparent 100%)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <motion.div
            className="absolute inset-0"
            style={{ backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.6 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   NAV LINK — magnetic hover effect
   ═══════════════════════════════════════════ */
function NavLink({ link, isActive }: { link: typeof navLinks[0]; isActive: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setOffset({
      x: (e.clientX - cx) * 0.15,
      y: (e.clientY - cy) * 0.15,
    });
  }, []);

  const handleLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return (
    <motion.div
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.2 }}
    >
      <Link
        ref={ref}
        to={link.path}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={`relative px-3 py-2 text-xs font-medium rounded-sm transition-all duration-300 ${
          isActive
            ? "text-[var(--accent-gold)]"
            : link.highlight
              ? "text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 hover:bg-[var(--accent-gold)]/20"
              : "hover:text-[var(--text-primary)] hover:bg-[var(--text-faint)]/30"
        }`}
        style={{ color: isActive ? undefined : link.highlight ? undefined : "var(--text-muted)" }}
      >
        {link.highlight && <Sparkles className="w-3 h-3 inline-block ml-1 -mt-0.5" />}
        {link.label}
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute bottom-0 left-2 right-2 h-px"
            style={{ backgroundColor: "var(--accent-gold)" }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        )}
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   THEME TOGGLE BUTTON
   ═══════════════════════════════════════════ */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <MagneticWrapper strength={0.3} scale={1.08} tilt={false} glow={false}>
      <motion.button
        onClick={toggleTheme}
        className="relative p-2 rounded-lg transition-all duration-300"
        style={{
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-default)",
        }}
        title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === "dark" ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </MagneticWrapper>
  );
}

/* ═══════════════════════════════════════════
   MAIN LAYOUT
   ═══════════════════════════════════════════ */
export default function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);
  const { theme } = useTheme();

  /* ── Lenis smooth scroll ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  /* ── Scroll listener ── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Route change ── */
  useEffect(() => {
    setMobileOpen(false);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const isHome = location.pathname === "/";

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "'Cairo', 'Noto Sans Arabic', system-ui, sans-serif",
      }}
    >
      {/* Advanced Cursor System */}
      <CursorGlow />

      {/* Cinematic Spotlight Overlay */}
      <SpotlightOverlay />

      {/* Theme Transition Animation */}
      <ThemeTransitionOverlay />

      {/* Global Effects */}
      {!isHome && <ParticleNetwork />}

      {/* Scan line subtle texture */}
      <div
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(128,128,128,0.015) 2px, rgba(128,128,128,0.015) 4px)",
          backgroundSize: "100% 4px",
          opacity: theme === "dark" ? 0.6 : 0.4,
        }}
      />

      {/* Navigation */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? (theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(245,240,232,0.9)") : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <MagneticWrapper strength={0.2} scale={1.05} tilt={false} glow={false}>
              <Link to="/" className="flex items-center gap-2.5 group">
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="w-9 h-9 rounded-sm flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))",
                  }}
                >
                  <Scale className="w-5 h-5" style={{ color: "var(--bg-primary)" }} />
                </motion.div>
                <div className="hidden sm:block">
                  <h1
                    className="text-sm font-bold leading-none transition-colors duration-300 group-hover:text-[var(--accent-gold)]"
                    style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    مسؤول
                  </h1>
                  <p
                    className="text-[9px] tracking-widest leading-tight"
                    style={{ color: "var(--text-faint)", fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    شركة مسؤول للمحاماة
                  </p>
                </div>
              </Link>
            </MagneticWrapper>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink key={link.path} link={link} isActive={isActive(link.path)} />
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              <MagneticWrapper strength={0.15} scale={1.04} tilt={false} glow={true} glowIntensity={0.2}>
                <Link
                  to="/case-review"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-sm transition-all duration-300 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))",
                    color: "var(--bg-primary)",
                  }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  اطلب مراجعة
                </Link>
              </MagneticWrapper>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              backgroundColor: theme === "dark" ? "rgba(0,0,0,0.98)" : "rgba(245,240,232,0.98)",
              backdropFilter: "blur(24px)",
              paddingTop: "5rem",
            }}
          >
            <div className="px-6">
              <div className="mb-4 flex items-center justify-between">
                <span style={{ color: "var(--text-muted)", fontSize: "11px", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  الوضع
                </span>
                <ThemeToggle />
              </div>
            </div>
            <nav className="px-6 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
                >
                  <Link
                    to={link.path}
                    className="flex items-center justify-between p-4 rounded-sm text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: isActive(link.path) ? "var(--accent-gold)/10" : link.highlight ? "var(--accent-gold)/5" : "transparent",
                      color: isActive(link.path) || link.highlight ? "var(--accent-gold)" : "var(--text-secondary)",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {link.highlight && <Sparkles className="w-4 h-4" />}
                      {link.label}
                    </span>
                    <ChevronLeft className="w-4 h-4" style={{ color: "var(--text-faint)" }} />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-8 pt-8 px-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <Link
                to="/case-review"
                className="flex items-center justify-center gap-2 w-full p-4 font-semibold rounded-sm transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))",
                  color: "var(--bg-primary)",
                }}
              >
                <Shield className="w-5 h-5" />
                اطلب مراجعة قضيتك
              </Link>
              <a
                href="tel:920012345"
                className="flex items-center justify-center gap-2 w-full p-4 mt-2 rounded-sm transition-all"
                style={{
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                <Phone className="w-4 h-4" />
                9200XXXXX
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 relative z-10">{children}</main>

      {/* Footer */}
      <footer
        className="relative border-t"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, var(--glow-gold) 0%, transparent 70%)",
            opacity: 0.3,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-1"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-sm flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))" }}
                >
                  <Scale className="w-4 h-4" style={{ color: "var(--bg-primary)" }} />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    مسؤول
                  </h3>
                  <p
                    className="text-[9px]"
                    style={{ color: "var(--text-faint)", fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    شركة مسؤول للمحاماة
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed body-text" style={{ color: "var(--text-muted)" }}>
                شريكك القانوني الذكي. نجمع بين الخبرة القانونية العميقة
                والتقنية المتقدمة لتقديم استشارات قانونية استثنائية.
              </p>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                الخدمات
              </h4>
              <div className="space-y-2">
                {["الاستشارات القانونية", "القضايا التنفيذية", "الجرائم الإلكترونية", "القضايا العمالية", "القضايا المدنية", "القضايا الجنائية"].map((s, i) => (
                  <motion.p
                    key={s}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className="text-xs cursor-default transition-colors duration-300"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {s}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                روابط
              </h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-xs transition-all duration-300 hover:translate-x-1"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                تواصل
              </h4>
              <div className="space-y-2 text-xs">
                <p style={{ color: "var(--text-faint)" }}>الرياض، المملكة العربية السعودية</p>
                <p style={{ color: "var(--text-faint)" }}>البريد: info@masoul-law.sa</p>
                <p style={{ color: "var(--text-faint)" }}>الهاتف: 9200XXXXX</p>
              </div>
            </motion.div>
          </div>

          <div
            className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <p className="text-[10px]" style={{ color: "var(--text-faint)", fontFamily: "'IBM Plex Mono', monospace" }}>
              شركة مسؤول للمحاماة {new Date().getFullYear()}. جميع الحقوق محفوظة.
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-faint)", fontFamily: "'IBM Plex Mono', monospace" }}>
              مسؤول — المستشار القانوني الذكي
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
