import { useMemo, useState } from "react";
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
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [active, setActive] = useState<GalleryItem | null>(null);

  const selected = useMemo(() => {
    if (!albums.length) return null;
    if (activeAlbum) return albums.find((a) => a.id === activeAlbum) ?? albums[0];
    return albums[0];
  }, [albums, activeAlbum]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">Gallery</span>
            <h1 className="section-title">Moments by event</h1>
            <p className="section-lead">
              Browse past ministry nights and concerts—each album holds the
              photos from that gathering.
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
            <>
              <div className="album-picker" role="tablist" aria-label="Events">
                {albums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    role="tab"
                    aria-selected={selected?.id === album.id}
                    className={`album-chip ${
                      selected?.id === album.id ? "active" : ""
                    }`}
                    onClick={() => setActiveAlbum(album.id)}
                  >
                    <strong>{album.title}</strong>
                    {album.event_date && (
                      <span>{formatAlbumDate(album.event_date)}</span>
                    )}
                  </button>
                ))}
              </div>

              {selected && <AlbumView album={selected} onOpen={setActive} />}
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

function AlbumView({
  album,
  onOpen,
}: {
  album: GalleryAlbum;
  onOpen: (item: GalleryItem) => void;
}) {
  const photos = album.items ?? [];

  return (
    <div className="album-view">
      <InView className="album-view-head">
        {album.cover_image_url && (
          <div className="album-cover">
            <img src={album.cover_image_url} alt="" />
          </div>
        )}
        <div>
          <span className="section-label">
            {album.event_date
              ? formatAlbumDate(album.event_date)
              : "Event album"}
          </span>
          <h2 className="section-title">{album.title}</h2>
          {album.description && (
            <p className="section-lead">{album.description}</p>
          )}
          <p className="album-count">
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </p>
        </div>
      </InView>

      <div className="gallery-masonry">
        {photos.map((item, i) => (
          <InView key={item.id} delay={Math.min(i, 8) * 40}>
            <button
              type="button"
              className="gallery-item"
              onClick={() => onOpen(item)}
            >
              <img src={item.image_url} alt={item.title || "Gallery photo"} />
              <span className="gallery-item-meta">
                <strong>{item.title}</strong>
                {item.caption && <em>{item.caption}</em>}
              </span>
            </button>
          </InView>
        ))}
      </div>

      {photos.length === 0 && (
        <p style={{ color: "var(--mist-muted)", marginTop: "1rem" }}>
          Photos for this event will appear once uploaded in admin.
        </p>
      )}
    </div>
  );
}
