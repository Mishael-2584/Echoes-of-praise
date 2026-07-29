import { useEffect, useState, type FormEvent } from "react";
import { CoverFocusPicker } from "../components/CoverFocusPicker";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");

  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState("");
  const [editAlbumDate, setEditAlbumDate] = useState("");
  const [editAlbumDescription, setEditAlbumDescription] = useState("");
  const [editAlbumPublished, setEditAlbumPublished] = useState(true);
  const [editFocusX, setEditFocusX] = useState(50);
  const [editFocusY, setEditFocusY] = useState(50);
  const [editCoverUrl, setEditCoverUrl] = useState<string | null>(null);

  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState("");
  const [editPhotoCaption, setEditPhotoCaption] = useState("");
  const [editPhotoAlbumId, setEditPhotoAlbumId] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const [a, g] = await Promise.all([
      adminListGalleryAlbums(),
      adminListGallery(),
    ]);
    setAlbums(
      a.map((album) => ({
        ...album,
        cover_focus_x: album.cover_focus_x ?? 50,
        cover_focus_y: album.cover_focus_y ?? 50,
      })),
    );
    setItems(g);
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

  function toggleAlbum(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
    setEditingPhotoId(null);
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
        cover_focus_x: 50,
        cover_focus_y: 40,
      });
      setAlbumTitle("");
      setAlbumDate("");
      setAlbumDescription("");
      setShowCreate(false);
      setExpandedId(album.id);
      setMessage(`Album “${album.title}” created — expand it to add photos.`);
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
    setEditFocusX(album.cover_focus_x ?? 50);
    setEditFocusY(album.cover_focus_y ?? 50);
    setEditCoverUrl(album.cover_image_url);
    setExpandedId(album.id);
    clearAlerts();
  }

  async function saveAlbumEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingAlbumId) return;
    const existing = albums.find((a) => a.id === editingAlbumId);
    if (!existing) return;
    setBusy(true);
    clearAlerts();
    try {
      await adminSaveGalleryAlbum({
        ...existing,
        title: editAlbumTitle.trim(),
        description: editAlbumDescription.trim(),
        event_date: editAlbumDate || null,
        published: editAlbumPublished,
        cover_image_url: editCoverUrl,
        cover_focus_x: editFocusX,
        cover_focus_y: editFocusY,
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

  async function onUploadCover(file: File | null) {
    if (!file || !editingAlbumId) return;
    setBusy(true);
    try {
      const url = await adminUploadImage("gallery", file);
      setEditCoverUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
    } finally {
      setBusy(false);
    }
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

  async function publishPhoto(e: FormEvent, albumId: string) {
    e.preventDefault();
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
        album_id: albumId,
        published: true,
      });
      const album = albums.find((a) => a.id === albumId);
      if (album && !album.cover_image_url) {
        await adminSaveGalleryAlbum({
          ...album,
          cover_image_url: imageUrl,
        });
      }
      setPhotoTitle("");
      setPhotoCaption("");
      setImageUrl("");
      setMessage("Photo added.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish photo");
    } finally {
      setBusy(false);
    }
  }

  function startEditPhoto(item: GalleryItem) {
    setEditingPhotoId(item.id);
    setEditPhotoTitle(item.title || "");
    setEditPhotoCaption(item.caption || "");
    setEditPhotoAlbumId(item.album_id || "");
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

  async function setAsCover(album: GalleryAlbum, url: string) {
    setBusy(true);
    clearAlerts();
    try {
      await adminSaveGalleryAlbum({
        ...album,
        cover_image_url: url,
      });
      if (editingAlbumId === album.id) setEditCoverUrl(url);
      setMessage("Cover image set — adjust crop focus if needed.");
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
            Albums stay collapsed until you open them. Edit cover crop so faces
            and stage stay in frame.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => {
            setShowCreate((v) => !v);
            clearAlerts();
          }}
        >
          {showCreate ? "Close" : "New album"}
        </button>
      </header>

      {message && <p className="admin-banner">{message}</p>}
      {error && <p className="admin-banner admin-banner-error">{error}</p>}

      {showCreate && (
        <form className="admin-form" onSubmit={(e) => void createAlbum(e)}>
          <h2>Create event album</h2>
          <div className="admin-form-grid">
            <label className="full">
              Event / album title
              <input
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="e.g. Eldoville SDA visit"
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
              />
            </label>
          </div>
          <button type="submit" className="btn btn-gold" disabled={busy}>
            Create album
          </button>
        </form>
      )}

      <div className="admin-accordion">
        {albums.map((album) => {
          const photos = items.filter((i) => i.album_id === album.id);
          const open = expandedId === album.id;
          const editing = editingAlbumId === album.id;

          return (
            <article
              key={album.id}
              className={`admin-acc-item ${open ? "is-open" : ""}`}
            >
              <button
                type="button"
                className="admin-acc-trigger"
                onClick={() => toggleAlbum(album.id)}
                aria-expanded={open}
              >
                <div
                  className="admin-acc-thumb"
                  style={
                    album.cover_image_url
                      ? {
                          backgroundImage: `url(${album.cover_image_url})`,
                          backgroundPosition: `${album.cover_focus_x ?? 50}% ${album.cover_focus_y ?? 50}%`,
                        }
                      : undefined
                  }
                />
                <div className="admin-acc-meta">
                  <strong>{album.title}</strong>
                  <span>
                    {album.event_date || "No date"} · {photos.length} photo
                    {photos.length === 1 ? "" : "s"}
                    {!album.published ? " · Hidden" : ""}
                  </span>
                </div>
                <span className="admin-acc-chevron" aria-hidden>
                  {open ? "−" : "+"}
                </span>
              </button>

              {open && (
                <div className="admin-acc-body">
                  <div className="admin-acc-toolbar">
                    <button type="button" onClick={() => startEditAlbum(album)}>
                      Edit album &amp; crop
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Delete album “${album.title}”? Photos leave this album but are not wiped from storage.`,
                          )
                        ) {
                          return;
                        }
                        void adminDeleteGalleryAlbum(album.id)
                          .then(() => {
                            if (expandedId === album.id) setExpandedId(null);
                            return reload();
                          })
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

                  {editing && (
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
                            <option value="yes">Yes — on site</option>
                            <option value="no">No — hidden</option>
                          </select>
                        </label>
                        <label className="full">
                          Description
                          <textarea
                            rows={3}
                            value={editAlbumDescription}
                            onChange={(e) =>
                              setEditAlbumDescription(e.target.value)
                            }
                          />
                        </label>
                        <label className="full">
                          Replace cover image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              void onUploadCover(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                      </div>

                      {editCoverUrl && (
                        <CoverFocusPicker
                          src={editCoverUrl}
                          focusX={editFocusX}
                          focusY={editFocusY}
                          onChange={(x, y) => {
                            setEditFocusX(x);
                            setEditFocusY(y);
                          }}
                        />
                      )}

                      <div className="admin-edit-actions">
                        <button
                          type="submit"
                          className="btn btn-gold"
                          disabled={busy}
                        >
                          Save album
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setEditingAlbumId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <form
                    className="admin-form admin-form-compact"
                    onSubmit={(e) => void publishPhoto(e, album.id)}
                  >
                    <h3>Add photo to this album</h3>
                    <div className="admin-form-grid">
                      <label>
                        Title
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
                          onChange={(e) =>
                            void onFile(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                    </div>
                    {imageUrl && (
                      <img src={imageUrl} alt="" className="admin-preview" />
                    )}
                    <button type="submit" className="btn btn-gold" disabled={busy}>
                      Upload photo
                    </button>
                  </form>

                  <div className="admin-gallery-grid">
                    {photos.map((item) => {
                      const photoEditing = editingPhotoId === item.id;
                      return (
                        <figure key={item.id} className="admin-photo-card">
                          <img src={item.image_url} alt={item.title} />
                          {photoEditing ? (
                            <form
                              className="admin-photo-edit"
                              onSubmit={(e) => void savePhotoEdit(e)}
                            >
                              <label>
                                Title
                                <input
                                  value={editPhotoTitle}
                                  onChange={(e) =>
                                    setEditPhotoTitle(e.target.value)
                                  }
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
                                  onClick={() => setEditingPhotoId(null)}
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
                                >
                                  Set cover
                                </button>
                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() => {
                                    if (
                                      !window.confirm(
                                        "Delete this photo permanently?",
                                      )
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

                  {photos.length === 0 && (
                    <p className="admin-muted">
                      No photos yet — upload above after creating the album.
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {albums.length === 0 && (
          <p className="admin-muted">
            No albums yet. Create one to start grouping event photos.
          </p>
        )}
      </div>
    </div>
  );
}
