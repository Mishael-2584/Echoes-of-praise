import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PromoReel } from "../content/choir";

type Props = {
  reels: PromoReel[];
};

/** Silent preview that plays while hovered (desktop) or centred in view (touch). */
function ReelCard({
  reel,
  onOpen,
}: {
  reel: PromoReel;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const touch = window.matchMedia("(hover: none)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const node = cardRef.current;
    if (!touch || reduce || !node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = ref.current;
        if (!v) return;
        if (entry.intersectionRatio > 0.75) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: [0, 0.75, 1] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <button
      ref={cardRef}
      type="button"
      className={`xp-reel xp-reel-${reel.orientation}`}
      onClick={onOpen}
      onMouseEnter={() => void ref.current?.play().catch(() => {})}
      onMouseLeave={() => {
        const v = ref.current;
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      }}
      aria-label={`Play video: ${reel.title}`}
    >
      <video
        ref={ref}
        src={reel.src}
        poster={reel.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
      />
      <span className="xp-reel-shade" aria-hidden />
      <span className="xp-reel-play" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
        </svg>
      </span>
      <span className="xp-reel-text">
        <strong>{reel.title}</strong>
        <span>{reel.caption}</span>
      </span>
    </button>
  );
}

export function PromoReels({ reels }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % reels.length));
      if (e.key === "ArrowLeft")
        setOpen((i) => (i === null ? i : (i - 1 + reels.length) % reels.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, reels.length]);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const current = open === null ? null : reels[open];

  return (
    <div className="xp-reels">
      <div className="xp-reels-track" ref={trackRef}>
        {reels.map((reel, i) => (
          <ReelCard key={reel.id} reel={reel} onOpen={() => setOpen(i)} />
        ))}
      </div>
      <div className="xp-reels-nav">
        <button type="button" className="xp-round-btn" onClick={() => scrollBy(-1)} aria-label="Scroll videos left">
          ←
        </button>
        <button type="button" className="xp-round-btn" onClick={() => scrollBy(1)} aria-label="Scroll videos right">
          →
        </button>
      </div>

      {current &&
        createPortal(
        <div
          className="xp-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <div className={`xp-lightbox-frame xp-lightbox-${current.orientation}`}>
            <video
              ref={playerRef}
              key={current.id}
              src={current.src}
              poster={current.poster}
              controls
              autoPlay
              playsInline
              onEnded={() => setOpen((i) => (i === null ? i : (i + 1) % reels.length))}
            />
            <div className="xp-lightbox-meta">
              <strong>{current.title}</strong>
              <span>{current.caption}</span>
            </div>
          </div>
          <button type="button" className="xp-lightbox-close" onClick={() => setOpen(null)} aria-label="Close video">
            ✕
          </button>
          <button
            type="button"
            className="xp-lightbox-arrow is-prev"
            onClick={() => setOpen((open! - 1 + reels.length) % reels.length)}
            aria-label="Previous video"
          >
            ←
          </button>
          <button
            type="button"
            className="xp-lightbox-arrow is-next"
            onClick={() => setOpen((open! + 1) % reels.length)}
            aria-label="Next video"
          >
            →
          </button>
        </div>,
          document.body,
        )}
    </div>
  );
}
