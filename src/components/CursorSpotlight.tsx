import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200, tx: -200, ty: -200 });
  const { theme } = useTheme();

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      posRef.current.tx = e.clientX;
      posRef.current.ty = e.clientY;
    };

    let raf: number;
    const loop = () => {
      const p = posRef.current;
      p.x += (p.tx - p.x) * 0.06;
      p.y += (p.ty - p.y) * 0.06;

      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--sx", `${p.x}px`);
        spotlightRef.current.style.setProperty("--sy", `${p.y}px`);
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Theme-aware spotlight style
  const spotlightStyle = theme === "dark"
    ? "radial-gradient(500px circle at var(--sx, -200px) var(--sy, -200px), rgba(201, 168, 76, 0.035), transparent 60%)"
    : "radial-gradient(500px circle at var(--sx, -200px) var(--sy, -200px), rgba(0, 0, 0, 0.025), transparent 60%)";

  return (
    <div
      ref={spotlightRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ background: spotlightStyle }}
    />
  );
}
