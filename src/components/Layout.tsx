import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Menu, X, Sparkles, LogOut } from "lucide-react";
import { useAuth, GoogleLoginButton } from "@/providers/AuthProvider";

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
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0A", color: "#F0EAD8" }} dir="rtl">

      {/* Navigation */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                  boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
                }}
              >
                <Scale className="w-4.5 h-4.5" style={{ color: "#0A0A0A" }} />
              </div>
              <span className="text-base font-bold tracking-wide" style={{ color: "#F0EAD8" }}>
                مسؤول
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200"
                  style={{
                    color: isActive(link.path) ? "#C9A84C" : "#9A8F7A",
                    backgroundColor: isActive(link.path) ? "rgba(201,168,76,0.1)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.path)) {
                      (e.currentTarget as HTMLElement).style.color = "#F0EAD8";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.path)) {
                      (e.currentTarget as HTMLElement).style.color = "#9A8F7A";
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
                  <span className="text-sm" style={{ color: "#9A8F7A" }}>{user.name.split(" ")[0]}</span>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: "#9A8F7A" }}
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowLoginPopup(!showLoginPopup)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                      color: "#0A0A0A",
                      boxShadow: "0 4px 16px rgba(201,168,76,0.25)",
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    دخول بـ Google
                  </button>
                  {showLoginPopup && (
                    <div
                      className="absolute top-12 left-0 p-4 rounded-2xl z-50 shadow-2xl"
                      style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.2)", minWidth: 280 }}
                    >
                      <p className="text-sm mb-3 text-center" style={{ color: "#9A8F7A" }}>
                        سجّل دخولك للحصول على استشارتك المجانية
                      </p>
                      <GoogleLoginButton onSuccess={() => setShowLoginPopup(false)} />
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg transition-colors"
                style={{ color: "#9A8F7A" }}
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
            style={{ backgroundColor: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)" }}
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
                    className="flex items-center justify-between py-4 text-lg font-medium border-b transition-colors"
                    style={{
                      color: isActive(link.path) ? "#C9A84C" : "#9A8F7A",
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-8">
              <Link
                to="/ai-advisor"
                className="btn-apple w-full justify-center text-base"
              >
                <Sparkles className="w-4 h-4" />
                جرب المستشار الذكي
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(201,168,76,0.12)", backgroundColor: "#080808" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 4px 16px rgba(201,168,76,0.25)" }}
                >
                  <Scale className="w-4 h-4" style={{ color: "#0A0A0A" }} />
                </div>
                <span className="text-base font-bold" style={{ color: "#F0EAD8" }}>مسؤول</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#5A5248" }}>
                المستشار القانوني الذكي. تحليل دقيق، فوري، مبني على الأنظمة السعودية.
              </p>
              <div className="mt-6 h-px" style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.3), transparent)" }} />
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase mb-4 tracking-widest" style={{ color: "#C9A84C" }}>الصفحات</h4>
              <div className="space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-sm transition-colors"
                    style={{ color: "#5A5248" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5248")}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase mb-4 tracking-widest" style={{ color: "#C9A84C" }}>التواصل</h4>
              <div className="space-y-3 text-sm" style={{ color: "#5A5248" }}>
                <p>الرياض، المملكة العربية السعودية</p>
                <p>info@masoul-law.sa</p>
                <p>للتواصل عبر الموقع</p>
              </div>
            </div>
          </div>

          <div
            className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-xs" style={{ color: "#3A3530" }}>
              شركة مسؤول للمحاماة {new Date().getFullYear()}
            </p>
            <p className="text-xs" style={{ color: "#3A3530" }}>جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
