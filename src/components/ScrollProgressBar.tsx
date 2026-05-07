import { motion, useScroll, useSpring } from "framer-motion";

/* ═══════════════════════════════════════════
   SCROLL PROGRESS BAR
   Golden thin bar at top of page showing
   scroll progress with spring physics
   ═══════════════════════════════════════════ */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-right"
      style={{
        scaleX,
        background: "linear-gradient(to left, var(--accent-gold), var(--accent-gold-dark), var(--accent-blue))",
        boxShadow: "0 0 8px var(--glow-gold), 0 0 16px var(--glow-gold)",
      }}
    />
  );
}
