import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X, Sparkles, LogOut, Shield, MessageCircle } from "lucide-react";
import { useAuth, GoogleLoginButton } from "@/providers/AuthProvider";
import MasoulLogo from "@/components/MasoulLogo";

const WHATSAPP_NUMBER = "966550341728";

const navLinks = [
  { path: "/", label: "الرئيسية" },
  { path: "/services", label: "الخدمات" },
  { path: "/ai-advisor", label: "المستشار الذكي" },
  { path: "/case-review", label: "مراجعة قضية" },
  { path: "/about", label: "عن مسؤول" },
  { path: "/contact", label: "تواصل" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }} dir="rtl">

      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[70] origin-right"
        style={{
          scaleX,
          height: "2px",
          background: "linear-gradient(to left, #C9A84C, #F0D78A, #1E3A8A)",
          boxShadow: "0 0 10px rgba(201,168,76,0.5)",
        }}
      />

      {/* Navigation */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "1px solid transparent",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="cursor-pointer">
              <MasoulLogo size={34} id="navbar" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer"
                  style={{
                    color: isActive(link.path) ? "#C9A84C" : "#475569",
                    backgroundColor: isActive(link.path) ? "rgba(201,168,76,0.10)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.path)) {
                      (e.currentTarget as HTMLElement).style.color = "#0F172A";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(15,23,42,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.path)) {
                      (e.currentTarget as HTMLElement).style.color = "#475569";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 right-3 left-3 h-px"
                      style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <img
                    src={user.picture ?? ""}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>{user.name.split(" ")[0]}</span>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer"
                    style={{ color: "var(--text-muted)" }}
                    title="تسجيل الخروج"
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F04438")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowLoginPopup(!showLoginPopup)}
                    className="btn-apple text-xs px-4 py-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    دخول بـ Google
                  </button>
                  {showLoginPopup && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="absolute top-12 left-0 p-4 rounded-2xl z-50 shadow-2xl"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-default)",
                        minWidth: 280,
                      }}
                    >
                      <p className="text-sm mb-3 text-center" style={{ color: "var(--text-muted)" }}>
                        سجّل دخولك للحصول على استشارتك المجانية
                      </p>
                      <GoogleLoginButton onSuccess={() => setShowLoginPopup(false)} />
                    </motion.div>
                  )}
                </div>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg transition-colors cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden pt-20 px-8"
            style={{ backgroundColor: "rgba(247,244,238,0.97)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)" }}
          >
            <nav className="space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className="flex items-center justify-between py-4 text-lg font-medium border-b transition-colors cursor-pointer"
                    style={{
                      color: isActive(link.path) ? "#C9A84C" : "var(--text-muted)",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-8">
              <Link to="/ai-advisor" className="btn-apple w-full justify-center text-base">
                <Sparkles className="w-4 h-4" />
                جرّب المستشار الذكي
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="pt-16">{children}</main>

      {/* WhatsApp Floating Button */}
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن خدمات مسؤول القانونية")}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5, type: "spring" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #25D366, #128C7E)",
          color: "#fff",
          boxShadow: "0 8px 28px rgba(37,211,102,0.40)",
        }}
        title="تواصل عبر واتساب"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-sm font-semibold hidden sm:block">واتساب</span>
      </motion.a>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-secondary)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            <div className="md:col-span-1">
              <div className="mb-5">
                <MasoulLogo size={30} id="footer" />
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-faint)" }}>
                المستشار القانوني الذكي. تحليل دقيق وفوري مبني على الأنظمة السعودية.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Shield className="w-3.5 h-3.5" style={{ color: "var(--accent-green)" }} />
                <span className="text-xs" style={{ color: "var(--accent-green)" }}>سرية تامة لجميع الاستفسارات</span>
              </div>
              <div className="mt-5 h-px" style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.3), transparent)" }} />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase mb-4 tracking-widest" style={{ color: "var(--accent-gold)" }}>الصفحات</h4>
              <div className="space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-sm transition-colors duration-200 cursor-pointer"
                    style={{ color: "var(--text-faint)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/faq"
                  className="block text-sm transition-colors duration-200 cursor-pointer"
                  style={{ color: "var(--text-faint)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
                >
                  الأسئلة الشائعة
                </Link>
                <Link
                  to="/privacy"
                  className="block text-sm transition-colors duration-200 cursor-pointer"
                  style={{ color: "var(--text-faint)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
                >
                  سياسة الخصوصية
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase mb-4 tracking-widest" style={{ color: "var(--accent-gold)" }}>التواصل</h4>
              <div className="space-y-3 text-sm" style={{ color: "var(--text-faint)" }}>
                <p>الرياض - حي السليمانية - طريق صلاح الدين الأيوبي</p>
                <p>law2030m@gmail.com</p>
                <p dir="ltr" style={{ textAlign: "right" }}>+966 550 341 728 | +966 504 244 498</p>
                <p>السبت — الخميس: ٩ ص — ٦ م</p>
              </div>
              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                {[
                  {
                    label: "تويتر / X",
                    href: "https://x.com/masaoul.sa",
                    svg: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                  {
                    label: "تيك توك",
                    href: "https://www.tiktok.com/@masaoul.sa",
                    svg: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      background: "rgba(201,168,76,0.08)",
                      border: "1px solid rgba(201,168,76,0.15)",
                      color: "var(--text-faint)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#C9A84C";
                      (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.15)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-faint)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.08)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.15)";
                    }}
                  >
                    {social.svg}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div
            className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              © {new Date().getFullYear()} شركة مسؤول للمحاماة — جميع الحقوق محفوظة
            </p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              مرخّصة وفق أنظمة المملكة العربية السعودية
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
