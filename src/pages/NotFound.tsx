import { Link } from "react-router";
import { motion } from "framer-motion";
import { Scale, Home, ArrowLeft, Brain } from "lucide-react";

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-[calc(100dvh-64px)] flex items-center justify-center px-6 py-16"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-lg"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
          style={{
            background: "rgba(255,255,255,0.80)",
            border: "1px solid rgba(201,168,76,0.25)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 40px rgba(201,168,76,0.12)",
          }}
        >
          <Scale className="w-12 h-12" style={{ color: "#C9A84C" }} />
        </motion.div>

        {/* 404 */}
        <h1
          className="text-8xl font-bold mb-4 leading-none"
          style={{
            fontFamily: "'EB Garamond', serif",
            background: "linear-gradient(135deg, #C9A84C, #F0D78A, #C9A84C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ٤٠٤
        </h1>

        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'EB Garamond', serif" }}>
          الصفحة غير موجودة
        </h2>
        <p className="mb-10 text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
          يبدو أن هذه الصفحة انتقلت أو لم تعد موجودة. تحقق من الرابط أو عُد للرئيسية.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
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
            }}
          >
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
          </Link>

          <Link
            to="/ai-advisor"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
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
            }}
          >
            <Brain className="w-4 h-4" />
            استشارة مجانية
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
