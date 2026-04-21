import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scale" | "rotate" | "blur";
  delay?: number;
  duration?: number;
  distance?: number;
  scrub?: boolean | number;
  start?: string;
  toggleActions?: string;
  perspective?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  animation = "fadeUp",
  delay = 0,
  duration = 1,
  distance = 60,
  scrub = false,
  start = "top 85%",
  toggleActions = "play none none none",
  perspective = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    const toVars: gsap.TweenVars = {
      opacity: 1,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions,
        scrub,
      },
    };

    switch (animation) {
      case "fadeUp":
        fromVars.y = distance;
        break;
      case "fadeDown":
        fromVars.y = -distance;
        break;
      case "fadeLeft":
        fromVars.x = distance;
        break;
      case "fadeRight":
        fromVars.x = -distance;
        break;
      case "scale":
        fromVars.scale = 0.85;
        break;
      case "rotate":
        fromVars.rotateX = 25;
        fromVars.y = distance;
        break;
      case "blur":
        fromVars.filter = "blur(12px)";
        toVars.filter = "blur(0px)";
        break;
    }

    if (perspective) {
      gsap.set(el.parentElement || el, { perspective: 1000 });
    }

    const ctx = gsap.context(() => {
      gsap.from(el, fromVars);
      gsap.to(el, toVars);
    });

    return () => ctx.revert();
  }, [animation, delay, duration, distance, scrub, start, toggleActions, perspective]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CINEMATIC SECTION — with perspective zoom
   ═══════════════════════════════════════════ */
interface CinematicSectionProps {
  children: React.ReactNode;
  className?: string;
  parallaxSpeed?: number;
  zoomOnScroll?: boolean;
}

export function CinematicSection({
  children,
  className = "",
  parallaxSpeed = 0,
  zoomOnScroll = false,
}: CinematicSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      if (parallaxSpeed !== 0) {
        gsap.to(content, {
          y: () => parallaxSpeed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (zoomOnScroll) {
        gsap.fromTo(
          content,
          { scale: 0.95, y: 40 },
          {
            scale: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              end: "top 30%",
              scrub: 1,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [parallaxSpeed, zoomOnScroll]);

  return (
    <div ref={sectionRef} className={`relative ${className}`}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STAGGER REVEAL — children appear sequentially
   ═══════════════════════════════════════════ */
interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
}

export function StaggerReveal({
  children,
  className = "",
  staggerDelay = 0.08,
  baseDelay = 0,
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const childElements = container.children;
    if (childElements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(childElements, {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        stagger: staggerDelay,
        ease: "power3.out",
        delay: baseDelay,
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [staggerDelay, baseDelay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
