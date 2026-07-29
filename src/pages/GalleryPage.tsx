import { useState } from "react";
import { InView } from "../components/InView";
import { Loader } from "../components/Loader";
import { fetchGallery } from "../lib/api";
import { useCachedResource } from "../lib/useCachedResource";
import type { GalleryItem } from "../types";

export function GalleryPage() {
  const { data, loading, error } = useCachedResource("gallery", fetchGallery);
  const items = data ?? [];
  const [active, setActive] = useState<GalleryItem | null>(null);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">Gallery</span>
            <h1 className="section-title">Moments in song</h1>
            <p className="section-lead">
              Concerts, rehearsals, and ministry across Nakuru—curated from the
              admin panel as new photos arrive.
            </p>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="container">
          {error && <p className="status-msg err">{error}</p>}

          {loading && (
            <Loader label="Loading gallery…" skeletons={6} className="gallery-loader" />
          )}

          {!loading && (
            <>
              <div className="gallery-masonry">
                {items.map((item, i) => (
                  <InView key={item.id} delay={Math.min(i, 8) * 50}>
                    <button
                      type="button"
                      className="gallery-item"
                      onClick={() => setActive(item)}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title || "Gallery photo"}
                      />
                      <span className="gallery-item-meta">
                        <strong>{item.title}</strong>
                        {item.caption && <em>{item.caption}</em>}
                      </span>
                    </button>
                  </InView>
                ))}
              </div>
              {items.length === 0 && (
                <p style={{ color: "var(--mist-muted)" }}>
                  Gallery photos will appear here once published from the admin
                  panel.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {active && (
        <div
          className="modal-backdrop"
          onClick={() => setActive(null)}
          role="presentation"
        >
          <div
            className="lightbox"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
          >
            <img src={active.image_url} alt={active.title} />
            <div className="lightbox-caption">
              <h3>{active.title}</h3>
              <p>{active.caption}</p>
            </div>
            <button
              type="button"
              className="modal-close lightbox-close"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
