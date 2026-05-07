import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

/* ═══════════════════════════════════════════
   CINEMATIC SPOTLIGHT OVERLAY
   Edge darkening vignette + cursor spotlight
   Creates depth and cinematic focus
   ═══════════════════════════════════════════ */
export default function SpotlightOverlay() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200, tx: -200, ty: -200 });
  const { theme } = useTheme();

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      posRef.current.tx = e.clientX;
      posRef.current.ty = e.clientY;
    };

    const handleLeave = () => {
      posRef.current.tx = window.innerWidth / 2;
      posRef.current.ty = window.innerHeight / 2;
    };

    let raf: number;
    const loop = () => {
      const p = posRef.current;
      // Slower lerp for cinematic feel
      p.x += (p.tx - p.x) * 0.04;
      p.y += (p.ty - p.y) * 0.04;

      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--sx", `${p.x}px`);
        spotlightRef.current.style.setProperty("--sy", `${p.y}px`);
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    raf = requestAnimationFrame(loop);

    // Center initially
    posRef.current.tx = window.innerWidth / 2;
    posRef.current.ty = window.innerHeight / 2;
    posRef.current.x = window.innerWidth / 2;
    posRef.current.y = window.innerHeight / 2;

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      ref={spotlightRef}
      className="fixed inset-0 pointer-events-none z-[3]"
      style={{
        background: isDark
          ? `radial-gradient(
              circle 600px at var(--sx, 50%) var(--sy, 50%),
              transparent 0%,
              rgba(0,0,0,0.15) 60%,
              rgba(0,0,0,0.35) 100%
            )`
          : `radial-gradient(
              circle 600px at var(--sx, 50%) var(--sy, 50%),
              transparent 0%,
              rgba(0,0,0,0.02) 60%,
              rgba(0,0,0,0.06) 100%
            )`,
        willChange: "background",
      }}
    />
  );
}
