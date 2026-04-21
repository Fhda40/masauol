import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;       // How much element moves toward cursor (0-1)
  scale?: number;          // Scale on hover
  tilt?: boolean;          // Enable 3D tilt toward cursor
  glow?: boolean;          // Enable glow on hover
  glowColor?: string;      // Custom glow color
  glowIntensity?: number;  // Glow intensity
}

/* ═══════════════════════════════════════════
   MAGNETIC WRAPPER
   Generic wrapper that makes any element
   feel alive — tilt, scale, glow, and
   magnetic attraction toward cursor
   ═══════════════════════════════════════════ */
export default function MagneticWrapper({
  children,
  className = "",
  strength = 0.25,
  scale = 1.03,
  tilt = true,
  glow = true,
  glowColor = "var(--accent-gold)",
  glowIntensity = 0.15,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Magnetic offset
    const offsetX = (e.clientX - cx) * strength;
    const offsetY = (e.clientY - cy) * strength;

    if (tilt) {
      // 3D tilt based on cursor position relative to center
      const percentX = (e.clientX - rect.left) / rect.width;
      const percentY = (e.clientY - rect.top) / rect.height;
      const rotateY = (percentX - 0.5) * 12; // -6 to +6 degrees
      const rotateX = (0.5 - percentY) * 12; // -6 to +6 degrees (inverted)

      setTransform({ x: offsetX, y: offsetY, rotateX, rotateY });
    } else {
      setTransform({ x: offsetX, y: offsetY, rotateX: 0, rotateY: 0 });
    }
  }, [strength, tilt]);

  const handleEnter = () => setIsHovered(true);

  const handleLeave = () => {
    setIsHovered(false);
    setTransform({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      animate={{
        x: transform.x,
        y: transform.y,
        rotateX: transform.rotateX,
        rotateY: transform.rotateY,
        scale: isHovered ? scale : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.5,
      }}
      className={`relative ${className}`}
      style={{
        perspective: tilt ? 800 : undefined,
        transformStyle: tilt ? "preserve-3d" : undefined,
        willChange: "transform",
      }}
    >
      {/* Glow effect behind */}
      {glow && (
        <motion.div
          className="absolute -inset-3 rounded-xl pointer-events-none"
          animate={{
            opacity: isHovered ? glowIntensity : 0,
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            background: `radial-gradient(circle at center, ${glowColor}40 0%, transparent 70%)`,
            filter: "blur(16px)",
            zIndex: -1,
          }}
        />
      )}

      {/* Shine sweep on hover */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 1 }}
        >
          <div
            className="absolute inset-0 shine-sweep"
            style={{
              background: `linear-gradient(
                105deg,
                transparent 40%,
                ${glowColor}15 50%,
                transparent 60%
              )`,
              backgroundSize: "200% 100%",
            }}
          />
        </motion.div>
      )}

      {children}
    </motion.div>
  );
}
