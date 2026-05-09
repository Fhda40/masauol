import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, FileText, Shield, Brain, CheckCircle } from "lucide-react";

/* ── Mouse-tracking tilt ── */
function useMouseTilt(intensity = 7) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setTilt({
        x: -((e.clientY - cy) / rect.height) * intensity,
        y: ((e.clientX - cx) / rect.width) * intensity,
      });
    };
    const reset = () => setTilt({ x: 0, y: 0 });
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", reset);
    };
  }, [intensity]);

  return { ref, tilt };
}

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A84C" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

/* ── Stat pill ── */
function StatPill({
  text, color, bg, border, delay, amp, style,
}: {
  text: string; color: string; bg: string; border: string;
  delay: number; amp: number; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={{ y: [-amp, amp, -amp] }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        padding: "6px 14px", borderRadius: 20,
        background: bg, border: `1px solid ${border}`,
        color, fontSize: 11, fontWeight: 700,
        whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {text}
    </motion.div>
  );
}

/* ── Main export ── */
export default function HeroScene() {
  const { ref, tilt } = useMouseTilt(6);
  const [step, setStep] = useState(0);

  /* Animate chat sequence once on mount */
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 700);
    const t2 = setTimeout(() => setStep(2), 1900);
    const t3 = setTimeout(() => setStep(3), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      ref={ref}
      className="w-full h-full flex items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{ transformStyle: "preserve-3d", width: "100%", maxWidth: 360 }}
        className="relative"
      >

        {/* ── Main chat card ── */}
        <motion.div
          initial={{ opacity: 0, y: 44, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "rgba(7,7,14,0.94)",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow:
              "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.07), 0 0 100px rgba(201,168,76,0.05)",
          }}
        >

          {/* Title bar */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(201,168,76,0.08)",
              background: "rgba(201,168,76,0.025)",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {(["#FF5F57", "#FEBC2E", "#28C840"] as const).map((c) => (
                <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.8 }} />
              ))}
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: 10.5, color: "#4A4540", letterSpacing: "0.04em" }}>
                مسؤول • المستشار القانوني الذكي
              </span>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#28C840" }}
            />
          </div>

          {/* Chat body */}
          <div
            style={{
              padding: "16px 14px", minHeight: 270,
              display: "flex", flexDirection: "column", gap: 10,
              direction: "rtl",
            }}
          >
            {/* User message */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  key="user"
                  initial={{ opacity: 0, x: -20, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ alignSelf: "flex-end", maxWidth: "82%" }}
                >
                  <div
                    style={{
                      background: "rgba(201,168,76,0.09)",
                      border: "1px solid rgba(201,168,76,0.16)",
                      borderRadius: "14px 14px 4px 14px",
                      padding: "8px 13px",
                      fontSize: 12, color: "#E8DFC8", lineHeight: 1.65, textAlign: "right",
                    }}
                  >
                    تعرضت لابتزاز إلكتروني ولديّ الأدلة كاملة
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {step === 2 && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{ alignSelf: "flex-start", display: "flex", gap: 8, alignItems: "center" }}
                >
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "linear-gradient(135deg,#C9A84C,#A8893A)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Scale style={{ width: 13, height: 13, color: "#000" }} />
                  </div>
                  <div
                    style={{
                      background: "#181818",
                      border: "1px solid rgba(201,168,76,0.10)",
                      borderRadius: 14, padding: "10px 14px",
                    }}
                  >
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI response */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ alignSelf: "flex-start", maxWidth: "95%", display: "flex", gap: 8 }}
                >
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "linear-gradient(135deg,#C9A84C,#A8893A)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}
                  >
                    <Scale style={{ width: 13, height: 13, color: "#000" }} />
                  </div>

                  <div>
                    {/* Article reference badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      style={{
                        marginBottom: 6,
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 20,
                        background: "rgba(201,168,76,0.10)",
                        border: "1px solid rgba(201,168,76,0.20)",
                      }}
                    >
                      <FileText style={{ width: 9, height: 9, color: "#C9A84C" }} />
                      <span style={{ fontSize: 9.5, color: "#C9A84C", fontWeight: 700 }}>
                        المادة ٣ — نظام مكافحة الجرائم المعلوماتية
                      </span>
                    </motion.div>

                    {/* Response bubble */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      style={{
                        background: "#141414",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "4px 14px 14px 14px",
                        padding: "9px 12px",
                        fontSize: 11.5, color: "#CEC4B0",
                        lineHeight: 1.75, textAlign: "right",
                      }}
                    >
                      ابتزاز إلكتروني — عقوبته{" "}
                      <span style={{ color: "#F0D78A", fontWeight: 700 }}>
                        سجن سنة وغرامة مليون ريال
                      </span>
                      . أبلغ هيئة الأمن السيبراني فوراً مع كامل الأدلة.
                    </motion.div>

                    {/* Classification tags */}
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}
                    >
                      {[
                        { label: "خطر عالٍ",    color: "#ef4444", bg: "rgba(220,38,38,0.09)",  border: "rgba(220,38,38,0.18)" },
                        { label: "٣ مواد",       color: "#16a34a", bg: "rgba(22,163,74,0.07)",  border: "rgba(22,163,74,0.15)" },
                        { label: "جريمة إلكترونية", color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.15)" },
                      ].map((t) => (
                        <span
                          key={t.label}
                          style={{
                            fontSize: 9, padding: "2px 8px", borderRadius: 20,
                            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
                            fontWeight: 600,
                          }}
                        >
                          {t.label}
                        </span>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid rgba(201,168,76,0.07)",
              background: "rgba(0,0,0,0.25)",
              display: "flex", gap: 8, alignItems: "center", direction: "rtl",
            }}
          >
            <div
              style={{
                flex: 1, height: 34, borderRadius: 17,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,168,76,0.09)",
                display: "flex", alignItems: "center", padding: "0 12px",
              }}
            >
              <span style={{ fontSize: 10, color: "#3A3530" }}>صف قضيتك...</span>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#C9A84C,#A8893A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(201,168,76,0.35)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Floating stat pills ── */}
        <StatPill
          text="٣ مراحل تحليل ذكي"
          color="#000"
          bg="linear-gradient(135deg,#C9A84C,#A8893A)"
          border="transparent"
          delay={0.3} amp={6}
          style={{ position: "absolute", top: -18, right: -8, boxShadow: "0 10px 28px rgba(201,168,76,0.50)" }}
        />

        <StatPill
          text="٨ أنظمة سعودية ✓"
          color="#17B26A"
          bg="rgba(7,7,14,0.92)"
          border="rgba(23,178,106,0.25)"
          delay={1} amp={5}
          style={{ position: "absolute", bottom: -16, left: -8 }}
        />

        {/* ── Side feature cards ── */}
        <motion.div
          animate={{ x: [-4, 4, -4], y: [3, -3, 3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          style={{
            position: "absolute", top: "25%", left: -100,
            padding: "9px 12px", borderRadius: 14,
            background: "rgba(7,7,14,0.88)",
            border: "1px solid rgba(201,168,76,0.14)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <Shield style={{ width: 11, height: 11, color: "#C9A84C" }} />
            <span style={{ fontSize: 10, color: "#C9A84C", fontWeight: 700 }}>سرية تامة</span>
          </div>
          <div style={{ fontSize: 9, color: "#4A4540" }}>بياناتك محمية</div>
        </motion.div>

        <motion.div
          animate={{ x: [4, -4, 4], y: [-3, 3, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{
            position: "absolute", top: "55%", right: -92,
            padding: "9px 12px", borderRadius: 14,
            background: "rgba(7,7,14,0.88)",
            border: "1px solid rgba(23,178,106,0.15)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <CheckCircle style={{ width: 11, height: 11, color: "#17B26A" }} />
            <span style={{ fontSize: 10, color: "#17B26A", fontWeight: 700 }}>تحليل فوري</span>
          </div>
          <div style={{ fontSize: 9, color: "#4A4540" }}>ثوانٍ لا ساعات</div>
        </motion.div>

        {/* ── Background glow ── */}
        <div
          style={{
            position: "absolute", inset: -40, borderRadius: 40,
            background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)",
            zIndex: -1, pointerEvents: "none",
          }}
        />
      </motion.div>
    </div>
  );
}
