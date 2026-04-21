import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

/* ═══════════════════════════════════════════
   ADVANCED CURSOR GLOW SYSTEM
   Multi-layer cursor with inertia, trail,
   and light sweep effects
   ═══════════════════════════════════════════ */
export default function CursorGlow() {
  const { theme } = useTheme();

  // Refs for each layer — different lerp speeds create depth
  const coreRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  // Position refs — target (tx, ty) and current (x, y)
  const corePos = useRef({ x: -200, y: -200, tx: -200, ty: -200 });
  const glowPos = useRef({ x: -200, y: -200, tx: -200, ty: -200 });
  const auraPos = useRef({ x: -200, y: -200, tx: -200, ty: -200 });
  const trailPos = useRef({ x: -200, y: -200, tx: -200, ty: -200 });
  const sweepPos = useRef({ x: -200, y: -200, tx: -200, ty: -200 });

  // Velocity for sweep effect
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      corePos.current.tx = e.clientX;
      corePos.current.ty = e.clientY;
      glowPos.current.tx = e.clientX;
      glowPos.current.ty = e.clientY;
      auraPos.current.tx = e.clientX;
      auraPos.current.ty = e.clientY;
      trailPos.current.tx = e.clientX;
      trailPos.current.ty = e.clientY;
      sweepPos.current.tx = e.clientX;
      sweepPos.current.ty = e.clientY;

      // Calculate velocity for sweep intensity
      velocityRef.current.x = e.clientX - lastMouseRef.current.x;
      velocityRef.current.y = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current.x = e.clientX;
      lastMouseRef.current.y = e.clientY;
    };

    const handleLeave = () => {
      corePos.current.tx = -200;
      corePos.current.ty = -200;
      glowPos.current.tx = -200;
      glowPos.current.ty = -200;
      auraPos.current.tx = -200;
      auraPos.current.ty = -200;
      trailPos.current.tx = -200;
      trailPos.current.ty = -200;
      sweepPos.current.tx = -200;
      sweepPos.current.ty = -200;
    };

    let raf: number;
    const loop = () => {
      // Core: fast follow (0.18 lerp)
      corePos.current.x += (corePos.current.tx - corePos.current.x) * 0.18;
      corePos.current.y += (corePos.current.ty - corePos.current.y) * 0.18;

      // Glow: medium lag (0.10 lerp)
      glowPos.current.x += (glowPos.current.tx - glowPos.current.x) * 0.10;
      glowPos.current.y += (glowPos.current.ty - glowPos.current.y) * 0.10;

      // Aura: more lag (0.06 lerp)
      auraPos.current.x += (auraPos.current.tx - auraPos.current.x) * 0.06;
      auraPos.current.y += (auraPos.current.ty - auraPos.current.y) * 0.06;

      // Trail: heavy lag (0.03 lerp) — creates the "tail"
      trailPos.current.x += (trailPos.current.tx - trailPos.current.x) * 0.03;
      trailPos.current.y += (trailPos.current.ty - trailPos.current.y) * 0.03;

      // Sweep: medium lag (0.08 lerp)
      sweepPos.current.x += (sweepPos.current.tx - sweepPos.current.x) * 0.08;
      sweepPos.current.y += (sweepPos.current.ty - sweepPos.current.y) * 0.08;

      // Velocity decay
      velocityRef.current.x *= 0.9;
      velocityRef.current.y *= 0.9;

      // Apply transforms directly via refs (zero React re-renders)
      if (coreRef.current) {
        coreRef.current.style.transform = `translate(${corePos.current.x - 4}px, ${corePos.current.y - 4}px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${glowPos.current.x - 40}px, ${glowPos.current.y - 40}px)`;
      }
      if (auraRef.current) {
        auraRef.current.style.transform = `translate(${auraPos.current.x - 80}px, ${auraPos.current.y - 80}px)`;
      }
      if (trailRef.current) {
        const trailOpacity = Math.max(0, 1 - Math.abs(trailPos.current.x - corePos.current.x) / 200);
        trailRef.current.style.transform = `translate(${trailPos.current.x - 60}px, ${trailPos.current.y - 60}px)`;
        trailRef.current.style.opacity = String(trailOpacity * 0.4);
      }
      if (sweepRef.current) {
        const speed = Math.sqrt(velocityRef.current.x ** 2 + velocityRef.current.y ** 2);
        const sweepOpacity = Math.min(1, speed / 15);
        sweepRef.current.style.transform = `translate(${sweepPos.current.x - 100}px, ${sweepPos.current.y - 100}px)`;
        sweepRef.current.style.opacity = String(sweepOpacity * 0.15);
      }

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const isDark = theme === "dark";

  return (
    <>
      {/* Layer 4: Trail (largest, faintest, most lag) */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 w-[120px] h-[120px] rounded-full pointer-events-none z-[9998]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(139,105,20,0.06) 0%, transparent 70%)",
          filter: "blur(20px)",
          willChange: "transform, opacity",
        }}
      />

      {/* Layer 3: Aura (large, soft) */}
      <div
        ref={auraRef}
        className="fixed top-0 left-0 w-[160px] h-[160px] rounded-full pointer-events-none z-[9997]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(201,168,76,0.06) 0%, rgba(78,168,222,0.02) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(139,105,20,0.04) 0%, rgba(0,0,0,0.02) 50%, transparent 70%)",
          filter: "blur(30px)",
          willChange: "transform",
        }}
      />

      {/* Layer 2: Glow (medium, noticeable) */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[80px] h-[80px] rounded-full pointer-events-none z-[9996]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)"
            : "radial-gradient(circle, rgba(139,105,20,0.08) 0%, rgba(0,0,0,0.03) 40%, transparent 70%)",
          filter: "blur(12px)",
          willChange: "transform",
        }}
      />

      {/* Layer 1: Core (small, bright dot) */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 w-[8px] h-[8px] rounded-full pointer-events-none z-[9999]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(201,168,76,0.8) 0%, rgba(201,168,76,0.3) 100%)"
            : "radial-gradient(circle, rgba(139,105,20,0.6) 0%, rgba(139,105,20,0.2) 100%)",
          boxShadow: isDark
            ? "0 0 8px rgba(201,168,76,0.5), 0 0 16px rgba(201,168,76,0.2)"
            : "0 0 6px rgba(139,105,20,0.3), 0 0 12px rgba(139,105,20,0.1)",
          willChange: "transform",
        }}
      />

      {/* Layer 0: Light sweep (flashes on fast movement) */}
      <div
        ref={sweepRef}
        className="fixed top-0 left-0 w-[200px] h-[200px] rounded-full pointer-events-none z-[9995]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 60%)"
            : "radial-gradient(circle, rgba(139,105,20,0.1) 0%, transparent 60%)",
          filter: "blur(8px)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}
