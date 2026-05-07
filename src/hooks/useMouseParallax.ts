import { useRef, useEffect } from "react";

interface ParallaxConfig {
  speed: number;     // -1 to 1 (negative = opposite direction)
  direction?: "both" | "horizontal" | "vertical";
}

/* ═══════════════════════════════════════════
   USE MOUSE PARALLAX
   Applies smooth parallax movement to a ref
   based on mouse position with configurable
   speed and direction
   ═══════════════════════════════════════════ */
export function useMouseParallax<T extends HTMLElement>(
  config: ParallaxConfig = { speed: 0.05, direction: "both" }
) {
  const ref = useRef<T>(null);
  const posRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      posRef.current.tx = ((e.clientX - cx) / cx) * config.speed * 40;
      posRef.current.ty = ((e.clientY - cy) / cy) * config.speed * 40;
    };

    const handleLeave = () => {
      posRef.current.tx = 0;
      posRef.current.ty = 0;
    };

    let raf: number;
    const loop = () => {
      const p = posRef.current;
      // Smooth lerp
      p.x += (p.tx - p.x) * 0.08;
      p.y += (p.ty - p.y) * 0.08;

      if (ref.current) {
        const xVal = config.direction === "vertical" ? 0 : p.x;
        const yVal = config.direction === "horizontal" ? 0 : p.y;
        ref.current.style.transform = `translate3d(${xVal}px, ${yVal}px, 0)`;
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
  }, [config.speed, config.direction]);

  return ref;
}

/* ═══════════════════════════════════════════
   MULTI-LAYER PARALLAX
   For elements that need different speeds
   ═══════════════════════════════════════════ */
export function useMultiLayerParallax() {
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${dx * -20}px, ${dy * -20}px, 0)`;
      }
      if (midRef.current) {
        midRef.current.style.transform = `translate3d(${dx * -10}px, ${dy * -10}px, 0)`;
      }
      if (fgRef.current) {
        fgRef.current.style.transform = `translate3d(${dx * 5}px, ${dy * 5}px, 0)`;
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return { bgRef, midRef, fgRef };
}
