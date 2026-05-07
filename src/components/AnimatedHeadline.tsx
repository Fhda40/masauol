import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

interface AnimatedHeadlineProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

/* ═══════════════════════════════════════════
   ANIMATED HEADLINE — Word-level animation
   Preserves RTL text direction by splitting
   at word boundaries, not characters.
   ═══════════════════════════════════════════ */
export default function AnimatedHeadline({ text, delay = 0, speed = 0.04, className = "" }: AnimatedHeadlineProps) {
  const mouse = useMousePosition();

  // Split into words (not letters) to preserve RTL order
  const words = text.split(/\s+/);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className={`inline ${className}`}
    >
      {words.map((word, i) => {
        const wordOffset = (i - words.length / 2) * 0.8;
        const offsetX = mouse.normalizedX * wordOffset * 3;
        const offsetY = mouse.normalizedY * wordOffset * 0.8;

        return (
          <motion.span
            key={i}
            variants={child}
            className="inline-block will-change-transform mx-[0.15em]"
            style={{
              transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans Arabic', 'Cairo', system-ui, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
              }}
            >
              {word}
            </span>
          </motion.span>
        );
      })}
    </motion.span>
  );
}
