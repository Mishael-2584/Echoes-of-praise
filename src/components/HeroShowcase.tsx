import { useEffect, useRef, useState, type ReactNode } from "react";

type Slide = { src: string; position?: string; caption?: string };

type Props = {
  slides: Slide[];
  children: ReactNode;
  interval?: number;
};

/**
 * Full-bleed cinematic hero: crossfading photos with a slow Ken Burns drift,
 * a soft light that follows the pointer, and slide progress ticks.
 */
export function HeroShowcase({ slides, children, interval = 6500 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % total), interval);
    return () => window.clearTimeout(id);
  }, [index, total, paused, interval]);

  // Preload the next frame so crossfades never flash.
  useEffect(() => {
    const next = slides[(index + 1) % total];
    if (next) {
      const img = new Image();
      img.src = next.src;
    }
  }, [index, slides, total]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = node.getBoundingClientRect();
        node.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        node.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    };
    node.addEventListener("pointermove", onMove);
    return () => {
      node.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="hero hero-epic xp-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="xp-hero-slides" aria-hidden>
        {slides.map((s, i) => (
          <div
            key={s.src}
            className={`xp-hero-slide ${i === index ? "is-active" : ""}`}
          >
            <img
              src={s.src}
              alt=""
              style={{ objectPosition: s.position }}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
            />
          </div>
        ))}
      </div>
      <div className="hero-veil xp-hero-veil" aria-hidden />
      <div className="xp-hero-spot" aria-hidden />
      <div className="xp-hero-grain" aria-hidden />

      <div className="container hero-content xp-hero-content">{children}</div>

      {total > 1 && (
        <div className="container xp-hero-rail">
          <p className="xp-hero-caption" key={index}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {slides[index]?.caption}
          </p>
          <div className="xp-hero-ticks" role="tablist" aria-label="Hero photos">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show photo ${i + 1}`}
                className={i === index ? "is-active" : ""}
                onClick={() => setIndex(i)}
              >
                <span
                  style={{
                    animationDuration: `${interval}ms`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <a href="#one-concert" className="xp-scroll-cue" aria-label="Scroll to the concert">
        <span />
      </a>
    </section>
  );
}
