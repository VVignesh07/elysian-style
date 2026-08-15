import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number; // Kept for API compatibility, but unused in continuous mode
  direction?: "up" | "left" | "right" | "down" | "tilt-up" | "tilt-left" | "tilt-right" | "none";
  threshold?: number;
}

const ScrollReveal = ({
  children,
  className = "",
  direction = "tilt-up",
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (direction === "none") return;
    
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const updateTransform = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      
      // Calculate ratio: 1 (bottom edge), 0 (center), -1 (top edge)
      // We clamp it loosely so the animation smooths out as it enters/leaves
      let ratio = (elementCenter - viewportCenter) / (windowHeight / 2);
      
      // Base transformations
      let rotateX = 0;
      let rotateY = 0;
      let x = 0;
      let y = 0;
      let blur = 0;
      let opacity = 1;
      let scale = 1;

      // When the element is near the center (-0.2 to 0.2), we want it perfectly flat.
      // Outside of that, we map the ratio to 3D transforms.
      const safeZone = 0.15;
      let mappedRatio = 0;
      
      if (ratio > safeZone) {
        mappedRatio = ratio - safeZone;
      } else if (ratio < -safeZone) {
        mappedRatio = ratio + safeZone;
      }

      // Cap the effect so it doesn't break layout when scrolling super fast
      mappedRatio = Math.max(-1.5, Math.min(1.5, mappedRatio));
      const absRatio = Math.abs(mappedRatio);

      // Visual fades (removed blur as requested)
      opacity = Math.max(0, 1 - (absRatio * 1.2));
      scale = Math.max(0.6, 1 - (absRatio * 0.4)); // Matches Our Story scale

      // Directional 3D Mapping (Matches Our Story 50deg tilt)
      if (direction === "up") {
        y = mappedRatio * 80;
      } else if (direction === "down") {
        y = -mappedRatio * 80;
      } else if (direction === "left") {
        x = mappedRatio * 80;
      } else if (direction === "right") {
        x = -mappedRatio * 80;
      } else if (direction === "tilt-up") {
        rotateX = mappedRatio * 50; 
        y = mappedRatio * 60;
      } else if (direction === "tilt-left") {
        rotateY = -mappedRatio * 50;
        x = mappedRatio * 60;
      } else if (direction === "tilt-right") {
        rotateY = mappedRatio * 50;
        x = -mappedRatio * 60;
      }

      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      el.style.opacity = opacity.toString();
      el.style.filter = 'none'; // Removed blur

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateTransform);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial call to set starting position
    updateTransform();
    
    return () => window.removeEventListener('scroll', onScroll);
  }, [direction]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform, opacity, filter",
        opacity: direction !== "none" ? 0 : 1, // Start hidden to prevent flash, script instantly reveals
        transition: "opacity 0.1s ease-out", // Very fast fade in just for the first load
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
