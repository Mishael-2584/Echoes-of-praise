import { useEffect, useState, type FormEvent } from "react";
import {
  adminDeleteGalleryItem,
  adminListGallery,
  adminSaveGalleryItem,
  adminUploadImage,
} from "../lib/adminApi";
import type { GalleryItem } from "../types";

export function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("concerts");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function reload() {
    setItems(await adminListGallery());
  }

  useEffect(() => {
    void reload();
  }, []);

  async function onFile(file: File | null) {
    if (!file) return;
    setImageUrl(await adminUploadImage("gallery", file));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      setMessage("Upload an image first.");
      return;
    }
    await adminSaveGalleryItem({
      title,
      caption,
      category,
      image_url: imageUrl,
      published: true,
    });
    setTitle("");
    setCaption("");
    setImageUrl("");
    setMessage("Photo published.");
    await reload();
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Gallery</h1>
          <p>Upload concert and ministry photos for the public gallery.</p>
        </div>
      </header>

      {message && <p className="admin-banner">{message}</p>}

      <form className="admin-form" onSubmit={onSubmit}>
        <h2>Add photo</h2>
        <div className="admin-form-grid">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="concerts">Concerts</option>
              <option value="rehearsals">Rehearsals</option>
              <option value="outreach">Outreach</option>
              <option value="general">General</option>
            </select>
          </label>
          <label className="full">
            Caption
            <input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          <label>
            Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => void onFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        {imageUrl && (
          <img src={imageUrl} alt="" className="admin-preview" />
        )}
        <button type="submit" className="btn btn-gold">
          Publish photo
        </button>
      </form>

      <div className="admin-gallery-grid">
        {items.map((item) => (
          <figure key={item.id}>
            <img src={item.image_url} alt={item.title} />
            <figcaption>
              <strong>{item.title || "Untitled"}</strong>
              <button
                type="button"
                onClick={() => void adminDeleteGalleryItem(item.id).then(reload)}
              >
                Delete
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
