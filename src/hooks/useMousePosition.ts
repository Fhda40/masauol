import { useState, useEffect, useRef } from "react";

interface MousePos {
  x: number;
  y: number;
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
}

export function useMousePosition() {
  const [pos, setPos] = useState<MousePos>({
    x: 0, y: 0, normalizedX: 0, normalizedY: 0,
  });
  const rafRef = useRef<number | undefined>(undefined);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const loop = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPos({
        x: targetRef.current.x,
        y: targetRef.current.y,
        normalizedX: (targetRef.current.x / w) * 2 - 1,
        normalizedY: (targetRef.current.y / h) * 2 - 1,
      });
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return pos;
}
