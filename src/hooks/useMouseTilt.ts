import { useRef, useEffect, useCallback } from 'react';

interface TiltOptions {
  maxTilt?: number;       // max degrees of tilt (default 8)
  perspective?: number;   // CSS perspective in px (default 800)
  scale?: number;         // scale on hover (default 1.02)
  speed?: number;         // transition speed in ms (default 400)
  glare?: boolean;        // enable glare overlay (default true)
  glareOpacity?: number;  // max glare opacity (default 0.15)
}

/**
 * useMouseTilt — attaches a CSS-transform 3D tilt effect to a DOM element
 * that follows the user's mouse. Returns a ref to attach to the element.
 */
export function useMouseTilt<T extends HTMLElement>(options: TiltOptions = {}) {
  const {
    maxTilt = 8,
    perspective = 800,
    scale = 1.03,
    speed = 400,
    glare = true,
    glareOpacity = 0.15,
  } = options;

  const ref = useRef<T>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number>(0);

  const setTransform = useCallback(
    (el: HTMLElement, rx: number, ry: number, s: number) => {
      el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
      el.style.transition = 'none';
    },
    [perspective]
  );

  const resetTransform = useCallback(
    (el: HTMLElement) => {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
      el.style.transition = `transform ${speed}ms cubic-bezier(0.23,1,0.32,1)`;
    },
    [perspective, speed]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform';

    // Create glare overlay
    let glareEl: HTMLDivElement | null = null;
    if (glare) {
      glareEl = document.createElement('div');
      glareEl.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: 10;
        background: radial-gradient(circle at 50% 0%, rgba(255,255,255,${glareOpacity}), transparent 60%);
        opacity: 0;
        transition: opacity ${speed}ms ease;
      `;
      el.style.position = 'relative';
      el.appendChild(glareEl);
      glareRef.current = glareEl;
    }

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        const rx = -dy * maxTilt;
        const ry = dx * maxTilt;

        setTransform(el, rx, ry, scale);

        if (glareEl) {
          const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
          glareEl.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,${glareOpacity}), transparent 70%)`;
          glareEl.style.opacity = '1';
        }
      });
    };

    const onMouseLeave = () => {
      cancelAnimationFrame(animFrameRef.current);
      resetTransform(el);
      if (glareEl) glareEl.style.opacity = '0';
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
      if (glareEl && el.contains(glareEl)) el.removeChild(glareEl);
    };
  }, [maxTilt, perspective, scale, speed, glare, glareOpacity, setTransform, resetTransform]);

  return ref;
}

/**
 * useParallaxScroll — applies a parallax translateY based on scroll position.
 * @param factor  How much the element moves relative to scroll (e.g. 0.3 = 30% of scroll)
 */
export function useParallaxScroll<T extends HTMLElement>(factor = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let animId: number;
    const onScroll = () => {
      animId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        el.style.transform = `translateY(${scrollY * factor}px)`;
        el.style.willChange = 'transform';
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, [factor]);

  return ref;
}
