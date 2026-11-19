import { useEffect, useRef, useState, type CSSProperties } from "react";

export type Poster = {
  src: string;
  alt: string;
  kicker?: string;
  title: string;
  place?: string;
};

type Props = {
  posters: Poster[];
  interval?: number;
};

/** 3D cover-flow of event posters: swipe, arrows, keys or autoplay. */
export function PosterCarousel({ posters, interval = 5200 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const total = posters.length;

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % total), interval);
    return () => window.clearTimeout(id);
  }, [index, paused, total, interval]);

  const go = (next: number) => setIndex(((next % total) + total) % total);

  if (total === 0) return null;

  return (
    <div
      className="xp-coverflow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      onPointerDown={(e) => {
        startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Concert posters"
      tabIndex={0}
    >
      <div className="xp-coverflow-stage">
        {posters.map((p, i) => {
          let offset = i - index;
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;
          const abs = Math.abs(offset);
          return (
            <figure
              key={p.src}
              className={`xp-cover ${offset === 0 ? "is-active" : ""}`}
              style={
                {
                  "--offset": offset,
                  "--abs": abs,
                  zIndex: 10 - abs,
                  opacity: abs > 2 ? 0 : 1,
                  pointerEvents: abs > 2 ? "none" : undefined,
                } as CSSProperties
              }
              aria-hidden={offset !== 0}
              onClick={() => offset !== 0 && go(i)}
            >
              <img src={p.src} alt={p.alt} draggable={false} loading="lazy" />
              <figcaption>
                {p.kicker && <span>{p.kicker}</span>}
                <strong>{p.title}</strong>
                {p.place && <em>{p.place}</em>}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {total > 1 && (
        <div className="xp-coverflow-controls">
          <button type="button" className="xp-round-btn" onClick={() => go(index - 1)} aria-label="Previous poster">
            ←
          </button>
          <div className="xp-dots">
            {posters.map((p, i) => (
              <button
                key={p.src}
                type="button"
                className={i === index ? "is-active" : ""}
                onClick={() => go(i)}
                aria-label={`Show ${p.title}`}
              />
            ))}
          </div>
          <button type="button" className="xp-round-btn" onClick={() => go(index + 1)} aria-label="Next poster">
            →
          </button>
        </div>
      )}
    </div>
  );
}
