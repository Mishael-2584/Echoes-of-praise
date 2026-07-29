import { useState } from "react";
import { InView } from "../components/InView";
import { Loader } from "../components/Loader";
import { fetchGalleryAlbums, formatAlbumDate } from "../lib/api";
import { useCachedResource } from "../lib/useCachedResource";
import type { GalleryAlbum, GalleryItem } from "../types";

export function GalleryPage() {
  const { data, loading, error } = useCachedResource(
    "gallery-albums",
    fetchGalleryAlbums,
  );
  const albums = data ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [active, setActive] = useState<GalleryItem | null>(null);

  function toggle(id: string) {
    setOpenId((cur) => (cur === id ? null : id));
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">Gallery</span>
            <h1 className="section-title">Moments by event</h1>
            <p className="section-lead">
              Open an album to reveal its photos—each gathering kept in its own
              chapter.
            </p>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="container">
          {error && <p className="status-msg err">{error}</p>}

          {loading && (
            <Loader
              label="Loading gallery…"
              skeletons={4}
              className="gallery-loader"
            />
          )}

          {!loading && albums.length === 0 && (
            <p style={{ color: "var(--mist-muted)" }}>
              Event galleries will appear here once published from the admin
              panel.
            </p>
          )}

          {!loading && albums.length > 0 && (
            <div className="album-stack">
              {albums.map((album, i) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  open={openId === album.id}
                  delay={Math.min(i, 6) * 60}
                  onToggle={() => toggle(album.id)}
                  onOpenPhoto={setActive}
                />
              ))}
            </div>
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

function AlbumCard({
  album,
  open,
  delay,
  onToggle,
  onOpenPhoto,
}: {
  album: GalleryAlbum;
  open: boolean;
  delay: number;
  onToggle: () => void;
  onOpenPhoto: (item: GalleryItem) => void;
}) {
  const photos = album.items ?? [];
  const focusX = album.cover_focus_x ?? 50;
  const focusY = album.cover_focus_y ?? 50;

  return (
    <InView className={`album-card ${open ? "is-open" : ""}`} delay={delay}>
      <button
        type="button"
        className="album-card-face"
        onClick={onToggle}
        aria-expanded={open}
      >
        <div
          className="album-card-cover"
          style={
            album.cover_image_url
              ? {
                  backgroundImage: `url(${album.cover_image_url})`,
                  backgroundPosition: `${focusX}% ${focusY}%`,
                }
              : undefined
          }
        />
        <div className="album-card-veil" />
        <div className="album-card-copy">
          <span className="album-card-date">
            {album.event_date
              ? formatAlbumDate(album.event_date)
              : "Event album"}
          </span>
          <h2>{album.title}</h2>
          {album.description && <p>{album.description}</p>}
          <span className="album-card-cta">
            {open
              ? "Close album"
              : `Open · ${photos.length} photo${photos.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </button>

      {open && (
        <div className="album-card-panel">
          {photos.length === 0 ? (
            <p className="album-empty">Photos coming soon for this event.</p>
          ) : (
            <div className="gallery-masonry">
              {photos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="gallery-item"
                  onClick={() => onOpenPhoto(item)}
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
              ))}
            </div>
          )}
        </div>
      )}
    </InView>
  );
}
