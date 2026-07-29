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

  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState("");
  const [editAlbumDate, setEditAlbumDate] = useState("");
  const [editAlbumDescription, setEditAlbumDescription] = useState("");
  const [editAlbumPublished, setEditAlbumPublished] = useState(true);

  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState("");
  const [editPhotoCaption, setEditPhotoCaption] = useState("");
  const [editPhotoAlbumId, setEditPhotoAlbumId] = useState("");

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

  function clearAlerts() {
    setMessage(null);
    setError(null);
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    clearAlerts();
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
    clearAlerts();
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

  function startEditAlbum(album: GalleryAlbum) {
    setEditingAlbumId(album.id);
    setEditAlbumTitle(album.title);
    setEditAlbumDate(album.event_date || "");
    setEditAlbumDescription(album.description || "");
    setEditAlbumPublished(album.published);
    clearAlerts();
  }

  function cancelEditAlbum() {
    setEditingAlbumId(null);
  }

  async function saveAlbumEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingAlbumId) return;
    const existing = albums.find((a) => a.id === editingAlbumId);
    if (!existing) return;
    if (!editAlbumTitle.trim()) {
      setError("Album title is required.");
      return;
    }
    setBusy(true);
    clearAlerts();
    try {
      await adminSaveGalleryAlbum({
        ...existing,
        title: editAlbumTitle.trim(),
        description: editAlbumDescription.trim(),
        event_date: editAlbumDate || null,
        published: editAlbumPublished,
      });
      setEditingAlbumId(null);
      setMessage("Album updated.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update album");
    } finally {
      setBusy(false);
    }
  }

  function startEditPhoto(item: GalleryItem) {
    setEditingPhotoId(item.id);
    setEditPhotoTitle(item.title || "");
    setEditPhotoCaption(item.caption || "");
    setEditPhotoAlbumId(item.album_id || "");
    clearAlerts();
  }

  function cancelEditPhoto() {
    setEditingPhotoId(null);
  }

  async function savePhotoEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingPhotoId) return;
    const existing = items.find((i) => i.id === editingPhotoId);
    if (!existing) return;
    setBusy(true);
    clearAlerts();
    try {
      await adminSaveGalleryItem({
        ...existing,
        title: editPhotoTitle.trim(),
        caption: editPhotoCaption.trim(),
        album_id: editPhotoAlbumId || null,
        image_url: existing.image_url,
      });
      setEditingPhotoId(null);
      setMessage("Photo details updated.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update photo");
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
    clearAlerts();
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

  async function setAsCover(album: GalleryAlbum, image: string) {
    setBusy(true);
    clearAlerts();
    try {
      await adminSaveGalleryAlbum({
        ...album,
        cover_image_url: image,
      });
      setMessage("Album cover updated.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set cover");
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
            Create an album for each past event, upload photos, then edit titles
            and captions anytime.
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
        <h2 className="admin-section-title">3. Manage albums &amp; captions</h2>
        {albums.map((album) => {
          const photos = items.filter((i) => i.album_id === album.id);
          const isEditing = editingAlbumId === album.id;
          return (
            <section key={album.id} className="admin-album-block">
              {isEditing ? (
                <form
                  className="admin-edit-panel"
                  onSubmit={(e) => void saveAlbumEdit(e)}
                >
                  <h3>Edit album</h3>
                  <div className="admin-form-grid">
                    <label className="full">
                      Title
                      <input
                        value={editAlbumTitle}
                        onChange={(e) => setEditAlbumTitle(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Event date
                      <input
                        type="date"
                        value={editAlbumDate}
                        onChange={(e) => setEditAlbumDate(e.target.value)}
                      />
                    </label>
                    <label>
                      Published
                      <select
                        value={editAlbumPublished ? "yes" : "no"}
                        onChange={(e) =>
                          setEditAlbumPublished(e.target.value === "yes")
                        }
                      >
                        <option value="yes">Yes — visible on site</option>
                        <option value="no">No — hidden</option>
                      </select>
                    </label>
                    <label className="full">
                      Description
                      <textarea
                        rows={3}
                        value={editAlbumDescription}
                        onChange={(e) => setEditAlbumDescription(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin-edit-actions">
                    <button type="submit" className="btn btn-gold" disabled={busy}>
                      Save album
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={cancelEditAlbum}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <header>
                  <div>
                    <h3>{album.title}</h3>
                    <p>
                      {album.event_date || "No date"} · {photos.length} photo
                      {photos.length === 1 ? "" : "s"}
                      {!album.published ? " · Hidden" : ""}
                    </p>
                    {album.description && (
                      <p className="admin-album-desc">{album.description}</p>
                    )}
                  </div>
                  <div className="admin-album-actions">
                    <button type="button" onClick={() => startEditAlbum(album)}>
                      Edit album
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Delete album “${album.title}”? Photos stay in the library but leave this album.`,
                          )
                        ) {
                          return;
                        }
                        void adminDeleteGalleryAlbum(album.id)
                          .then(reload)
                          .catch((err: unknown) =>
                            setError(
                              err instanceof Error
                                ? err.message
                                : "Delete failed",
                            ),
                          );
                      }}
                    >
                      Delete album
                    </button>
                  </div>
                </header>
              )}

              <div className="admin-gallery-grid">
                {photos.map((item) => {
                  const editing = editingPhotoId === item.id;
                  return (
                    <figure key={item.id} className="admin-photo-card">
                      <img src={item.image_url} alt={item.title} />
                      {editing ? (
                        <form
                          className="admin-photo-edit"
                          onSubmit={(e) => void savePhotoEdit(e)}
                        >
                          <label>
                            Title
                            <input
                              value={editPhotoTitle}
                              onChange={(e) => setEditPhotoTitle(e.target.value)}
                            />
                          </label>
                          <label>
                            Caption
                            <textarea
                              rows={2}
                              value={editPhotoCaption}
                              onChange={(e) =>
                                setEditPhotoCaption(e.target.value)
                              }
                            />
                          </label>
                          <label>
                            Album
                            <select
                              value={editPhotoAlbumId}
                              onChange={(e) =>
                                setEditPhotoAlbumId(e.target.value)
                              }
                            >
                              <option value="">Unassigned</option>
                              {albums.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.title}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="admin-edit-actions">
                            <button
                              type="submit"
                              className="btn btn-gold"
                              disabled={busy}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditPhoto}
                              disabled={busy}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <figcaption>
                          <div>
                            <strong>{item.title || "Untitled"}</strong>
                            {item.caption && <em>{item.caption}</em>}
                          </div>
                          <div className="admin-photo-actions">
                            <button
                              type="button"
                              onClick={() => startEditPhoto(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void setAsCover(album, item.image_url)
                              }
                              disabled={busy}
                            >
                              Set cover
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => {
                                if (
                                  !window.confirm("Delete this photo permanently?")
                                ) {
                                  return;
                                }
                                void adminDeleteGalleryItem(item.id)
                                  .then(reload)
                                  .catch((err: unknown) =>
                                    setError(
                                      err instanceof Error
                                        ? err.message
                                        : "Delete failed",
                                    ),
                                  );
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
