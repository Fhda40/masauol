import { motion } from "framer-motion";

interface PulseGlowProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
  delay?: number;
}

/* ═══════════════════════════════════════════
   PULSE GLOW
   Ambient pulsing glow behind elements.
   Creates a "breathing" golden light effect.
   ═══════════════════════════════════════════ */
export default function PulseGlow({
  children,
  className = "",
  color = "var(--accent-gold)",
  intensity = 0.15,
  delay = 0,
}: PulseGlowProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Pulsing glow rings */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [intensity * 0.3, intensity, intensity * 0.3],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          filter: "blur(24px)",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [intensity * 0.15, intensity * 0.5, intensity * 0.15],
          scale: [1.02, 1, 1.02],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 1.5,
        }}
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
