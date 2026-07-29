import { useEffect, useState, type FormEvent } from "react";
import {
  adminDeleteGalleryAlbum,
  adminDeleteGalleryItem,
  adminListGallery,
  adminListGalleryAlbums,
  adminSaveGalleryAlbum,
  adminSaveGalleryItem,
  adminUploadImage,
} from "../lib/adminApi";
import type { GalleryAlbum, GalleryItem } from "../types";

export function AdminGallery() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const [a, g] = await Promise.all([
      adminListGalleryAlbums(),
      adminListGallery(),
    ]);
    setAlbums(a);
    setItems(g);
    if (!selectedAlbumId && a[0]) setSelectedAlbumId(a[0].id);
  }

  useEffect(() => {
    void reload().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load gallery");
    });
  }, []);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setImageUrl(await adminUploadImage("gallery", file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function createAlbum(e: FormEvent) {
    e.preventDefault();
    if (!albumTitle.trim()) {
      setError("Album / event title is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const album = await adminSaveGalleryAlbum({
        title: albumTitle.trim(),
        description: albumDescription.trim(),
        event_date: albumDate || null,
        published: true,
      });
      setAlbumTitle("");
      setAlbumDate("");
      setAlbumDescription("");
      setSelectedAlbumId(album.id);
      setMessage(`Album “${album.title}” created. Upload photos into it below.`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create album");
    } finally {
      setBusy(false);
    }
  }

  async function publishPhoto(e: FormEvent) {
    e.preventDefault();
    if (!selectedAlbumId) {
      setError("Create or select an event album first.");
      return;
    }
    if (!imageUrl) {
      setError("Upload an image first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await adminSaveGalleryItem({
        title: photoTitle,
        caption: photoCaption,
        category: "concerts",
        image_url: imageUrl,
        album_id: selectedAlbumId,
        taken_at: albumDate || null,
        published: true,
      });
      const album = albums.find((a) => a.id === selectedAlbumId);
      if (album && !album.cover_image_url) {
        await adminSaveGalleryAlbum({
          ...album,
          cover_image_url: imageUrl,
        });
      }
      setPhotoTitle("");
      setPhotoCaption("");
      setImageUrl("");
      setMessage("Photo added to the event album.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Gallery</h1>
          <p>
            Create an album for each past event, then upload its photos. The
            public gallery groups pictures by event.
          </p>
        </div>
      </header>

      {message && <p className="admin-banner">{message}</p>}
      {error && <p className="admin-banner admin-banner-error">{error}</p>}

      <form className="admin-form" onSubmit={(e) => void createAlbum(e)}>
        <h2>1. New event album</h2>
        <div className="admin-form-grid">
          <label className="full">
            Event / album title
            <input
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              placeholder="e.g. Christmas Carol Service 2025"
              required
            />
          </label>
          <label>
            Event date
            <input
              type="date"
              value={albumDate}
              onChange={(e) => setAlbumDate(e.target.value)}
            />
          </label>
          <label className="full">
            Short description
            <input
              value={albumDescription}
              onChange={(e) => setAlbumDescription(e.target.value)}
              placeholder="Optional note about the night"
            />
          </label>
        </div>
        <button type="submit" className="btn btn-gold" disabled={busy}>
          Create album
        </button>
      </form>

      <form className="admin-form" onSubmit={(e) => void publishPhoto(e)}>
        <h2>2. Add photos to an album</h2>
        <div className="admin-form-grid">
          <label className="full">
            Album
            <select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
              required
            >
              <option value="">Select event album…</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                  {a.event_date ? ` · ${a.event_date}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Photo title
            <input
              value={photoTitle}
              onChange={(e) => setPhotoTitle(e.target.value)}
            />
          </label>
          <label>
            Caption
            <input
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
            />
          </label>
          <label className="full">
            Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => void onFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        {imageUrl && <img src={imageUrl} alt="" className="admin-preview" />}
        <button type="submit" className="btn btn-gold" disabled={busy}>
          {busy ? "Working…" : "Publish photo"}
        </button>
      </form>

      <div className="admin-album-list">
        {albums.map((album) => {
          const photos = items.filter((i) => i.album_id === album.id);
          return (
            <section key={album.id} className="admin-album-block">
              <header>
                <div>
                  <h3>{album.title}</h3>
                  <p>
                    {album.event_date || "No date"} · {photos.length} photo
                    {photos.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void adminDeleteGalleryAlbum(album.id)
                      .then(reload)
                      .catch((err: unknown) =>
                        setError(
                          err instanceof Error ? err.message : "Delete failed",
                        ),
                      )
                  }
                >
                  Delete album
                </button>
              </header>
              <div className="admin-gallery-grid">
                {photos.map((item) => (
                  <figure key={item.id}>
                    <img src={item.image_url} alt={item.title} />
                    <figcaption>
                      <strong>{item.title || "Untitled"}</strong>
                      <button
                        type="button"
                        onClick={() =>
                          void adminDeleteGalleryItem(item.id)
                            .then(reload)
                            .catch((err: unknown) =>
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Delete failed",
                              ),
                            )
                        }
                      >
                        Delete
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
