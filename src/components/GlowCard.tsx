import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
  delay?: number;
}

export default function GlowCard({
  children,
  className = "",
  glowColor = "#c9a84c",
  intensity = 0.6,
  delay = 0,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const { theme } = useTheme();

  // 3D tilt state
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Conic gradient border animation
  useEffect(() => {
    const gradient = gradientRef.current;
    if (!gradient) return;

    const animate = () => {
      angleRef.current += 1.2;
      const alpha1 = Math.round(intensity * (theme === "dark" ? 40 : 25)).toString(16).padStart(2, "0");
      const alpha2 = Math.round(intensity * (theme === "dark" ? 30 : 18)).toString(16).padStart(2, "0");
      gradient.style.background = `conic-gradient(from ${angleRef.current}deg at 50% 50%, transparent 0deg, ${glowColor}${alpha1} 60deg, transparent 120deg, transparent 240deg, ${glowColor}${alpha2} 300deg, transparent 360deg)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [glowColor, intensity, theme]);

  // Mouse-based 3D tilt
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const percentX = (e.clientX - rect.left) / rect.width;
    const percentY = (e.clientY - rect.top) / rect.height;
    const rotateY = (percentX - 0.5) * 8; // -4 to +4 degrees
    const rotateX = (0.5 - percentY) * 8; // -4 to +4 degrees
    setTilt({ rotateX, rotateY });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.7,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group ${className}`}
      style={{
        perspective: 800,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Animated rotating border glow */}
      <div
        ref={gradientRef}
        className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          filter: `blur(${theme === "dark" ? 1 : 2}px) brightness(${theme === "dark" ? 1 + intensity : 1 + intensity * 0.5})`,
        }}
      />

      {/* Static subtle border */}
      <div
        className="absolute inset-0 rounded-xl transition-colors duration-500"
        style={{ border: "1px solid var(--border-default)" }}
      />

      {/* Shine sweep effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-[2]"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="absolute inset-0 shine-sweep"
          style={{
            background: `linear-gradient(
              105deg,
              transparent 40%,
              ${glowColor}12 50%,
              transparent 60%
            )`,
            backgroundSize: "200% 100%",
          }}
        />
      </motion.div>

      {/* Card content with 3D tilt */}
      <motion.div
        className="relative z-10 rounded-xl h-full"
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        style={{
          background: "linear-gradient(to bottom, var(--bg-card-hover), var(--bg-card))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
