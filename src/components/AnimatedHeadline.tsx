import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

interface AnimatedHeadlineProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

export default function AnimatedHeadline({ text, delay = 0, speed = 0.04, className = "" }: AnimatedHeadlineProps) {
  const mouse = useMousePosition();

  const letters = text.split("");

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
      className={`inline-block ${className}`}
    >
      {letters.map((letter, i) => {
        const letterOffset = (i - letters.length / 2) * 0.8;
        const offsetX = mouse.normalizedX * letterOffset * 2;
        const offsetY = mouse.normalizedY * letterOffset * 0.5;

        return (
          <motion.span
            key={i}
            variants={child}
            className="inline-block will-change-transform"
            style={{
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              fontFamily: "'IBM Plex Sans Arabic', 'Cairo', system-ui, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
