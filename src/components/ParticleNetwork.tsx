import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      w = canvas!.width = canvas!.offsetWidth;
      h = canvas!.height = canvas!.offsetHeight;
    };
    resize();

    const isDark = theme === "dark";
    const particleColor = isDark
      ? { r: 201, g: 168, b: 76 }
      : { r: 139, g: 105, b: 20 };

    interface Particle {
      x: number; y: number; baseX: number; baseY: number;
      vx: number; vy: number; size: number; alpha: number;
      depth: number; // 0 = far (background), 1 = near (foreground)
    }

    // Create particles at different depths
    const particles: Particle[] = [];
    // Background particles (40, slower, smaller, dimmer)
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      particles.push({
        x, y, baseX: x, baseY: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.3 + 0.05,
        depth: 0,
      });
    }
    // Foreground particles (30, faster, larger, brighter)
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      particles.push({
        x, y, baseX: x, baseY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        depth: 1,
      });
    }

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    canvas.addEventListener("mousemove", handleMouse, { passive: true });
    canvas.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", resize);

    let frameId: number;
    const draw = () => {
      ctx!.clearRect(0, 0, w, h);
      const mouse = mouseRef.current;
      const { r, g, b } = particleColor;

      // Draw connections first (behind particles)
      const fgParticles = particles.filter((p) => p.depth === 1);
      for (let i = 0; i < fgParticles.length; i++) {
        for (let j = i + 1; j < fgParticles.length; j++) {
          const dx = fgParticles[i].x - fgParticles[j].x;
          const dy = fgParticles[i].y - fgParticles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const CONNECTION_DIST = 180;
          if (d < CONNECTION_DIST) {
            const alpha = (1 - d / CONNECTION_DIST) * 0.08;
            ctx!.beginPath();
            ctx!.moveTo(fgParticles[i].x, fgParticles[i].y);
            ctx!.lineTo(fgParticles[j].x, fgParticles[j].y);
            ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      // Update and draw all particles
      for (const p of particles) {
        const MOUSE_RADIUS = p.depth === 0 ? 200 : 350;
        const MOUSE_FORCE = p.depth === 0 ? 0.3 : 0.9;
        const SPRING = p.depth === 0 ? 0.004 : 0.008;
        const DAMPING = 0.96;

        // Mouse repulsion (foreground stronger)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Spring back to base position
        p.vx += (p.baseX - p.x) * SPRING;
        p.vy += (p.baseY - p.y) * SPRING;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounds
        if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
        if (p.x > w) { p.x = w; p.vx *= -0.5; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
        if (p.y > h) { p.y = h; p.vy *= -0.5; }

        // Draw
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        ctx!.fill();

        // Glow halo for foreground particles
        if (p.depth === 1 && p.size > 1.2) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.15})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx!.fillStyle = grad;
          ctx!.fill();
        }
      }

      frameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ opacity: theme === "dark" ? 0.8 : 0.5 }}
    />
  );
}
