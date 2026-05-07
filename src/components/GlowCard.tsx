import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/* ═══════════════════════════════════════════
   CLEAN CARD — Apple style
   Simple bordered card with subtle hover shadow
   ═══════════════════════════════════════════ */
export default function GlowCard({ children, className = "", delay = 0 }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const percentX = (e.clientX - rect.left) / rect.width;
    const percentY = (e.clientY - rect.top) / rect.height;
    const rotateY = (percentX - 0.5) * 4;
    const rotateX = (0.5 - percentY) * 4;
    setTilt({ rotateX, rotateY });
  }, []);

    const handleMouseLeave = () => setTilt({ rotateX: 0, rotateY: 0 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
      className={`card-apple ${className}`}
      style={{ perspective: 600 }}
    >
      <motion.div
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
