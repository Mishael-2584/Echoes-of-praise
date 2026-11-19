import { useEffect, useState } from "react";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Counts from 0 up to `target` once the element scrolls into view.
 * Returns a callback ref to attach and the current value. The callback ref
 * (rather than useRef) restarts the effect when the element mounts later,
 * e.g. after a loading state.
 */
export function useCountUp<T extends HTMLElement>(target: number, duration = 1600) {
  const [node, ref] = useState<T | null>(null);
  const [value, setValue] = useState(() => (reducedMotion() ? target : 0));

  useEffect(() => {
    if (reducedMotion()) {
      setValue(target);
      return;
    }
    if (!node) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setValue(target * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [node, target, duration]);

  return { ref, value };
}
