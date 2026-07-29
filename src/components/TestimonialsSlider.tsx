import { useEffect, useState } from "react";
import type { Testimonial } from "../content/choir";

type Props = {
  items: Testimonial[];
};

export function TestimonialsSlider({ items }: Props) {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const total = items.length;
  const current = items[index];

  useEffect(() => {
    if (total <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
      setAnimKey((k) => k + 1);
    }, 9000);
    return () => window.clearInterval(id);
  }, [total]);

  function go(next: number) {
    setIndex((next + total) % total);
    setAnimKey((k) => k + 1);
  }

  if (!current) return null;

  return (
    <div className="testimonial-slider">
      <blockquote key={animKey} className="testimonial-slide is-in">
        <p>“{current.quote}”</p>
        <footer>
          <strong>{current.name}</strong>
          <span>{current.role}</span>
          {current.source && (
            <span className="testimonial-source">{current.source}</span>
          )}
        </footer>
      </blockquote>

      {total > 1 && (
        <div className="testimonial-controls">
          <button
            type="button"
            className="testimonial-nav"
            onClick={() => go(index - 1)}
            aria-label="Previous appreciation"
          >
            ‹
          </button>
          <div className="testimonial-dots" role="tablist" aria-label="Testimonials">
            {items.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={i === index ? "active" : undefined}
                onClick={() => go(i)}
                aria-label={`Show appreciation ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="testimonial-nav"
            onClick={() => go(index + 1)}
            aria-label="Next appreciation"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
