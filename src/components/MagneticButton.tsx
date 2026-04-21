import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
}

export default function MagneticButton({ children, onClick, className = "", strength = 0.3 }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  };

  const handleLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative overflow-hidden group ${className}`}
    >
      {/* Ripple on click */}
      <span className="absolute inset-0 scale-0 group-active:scale-100 group-active:opacity-0 transition-all duration-500 rounded-inherit"
        style={{ backgroundColor: "var(--text-faint)" }}
      />
      {/* Glow */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"
        style={{
          background: "linear-gradient(to right, var(--glow-gold), rgba(78,168,222,0.1))",
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
