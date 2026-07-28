import { useEffect, useState, type FormEvent } from "react";
import {
  adminDeleteEvent,
  adminListEvents,
  adminSaveEvent,
  adminUploadImage,
} from "../lib/adminApi";
import { formatEventDate, formatKes } from "../lib/api";
import type { ChoirEvent, TicketTier } from "../types";

type TierDraft = {
  id?: string;
  name: string;
  price_kes: number;
  perksText: string;
  capacity: string;
};

const emptyEvent = {
  title: "",
  slug: "",
  tagline: "",
  description: "",
  starts_at: "",
  venue: "",
  city: "Nakuru",
  county: "Nakuru",
  is_free: false,
  featured: false,
  status: "published" as "draft" | "published",
  cover_image_url: "/images/choir-main.jpg",
};

export function AdminEvents() {
  const [events, setEvents] = useState<ChoirEvent[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyEvent });
  const [tiers, setTiers] = useState<TierDraft[]>([
    { name: "General", price_kes: 500, perksText: "General seating", capacity: "" },
  ]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    setEvents(await adminListEvents());
  }

  useEffect(() => {
    void reload();
  }, []);

  function startCreate() {
    setEditing("new");
    setForm({ ...emptyEvent, starts_at: new Date().toISOString().slice(0, 16) });
    setTiers([
      { name: "General", price_kes: 0, perksText: "Admission", capacity: "" },
    ]);
  }

  function startEdit(event: ChoirEvent) {
    setEditing(event.id);
    setForm({
      title: event.title,
      slug: event.slug,
      tagline: event.tagline,
      description: event.description,
      starts_at: event.starts_at.slice(0, 16),
      venue: event.venue,
      city: event.city,
      county: event.county,
      is_free: event.is_free,
      featured: event.featured,
      status: event.status === "cancelled" ? "published" : event.status,
      cover_image_url: event.cover_image_url || "/images/choir-main.jpg",
    });
    setTiers(
      (event.ticket_tiers || []).map((t) => ({
        id: t.id,
        name: t.name,
        price_kes: t.price_kes,
        perksText: (t.perks || []).join(", "),
        capacity: t.capacity?.toString() || "",
      })),
    );
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    const url = await adminUploadImage("events", file);
    setForm((f) => ({ ...f, cover_image_url: url }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const tierPayload: Omit<TicketTier, "event_id">[] = tiers.map((t, i) => ({
        id: t.id || crypto.randomUUID(),
        name: t.name,
        description: "",
        price_kes: Number(t.price_kes) || 0,
        capacity: t.capacity ? Number(t.capacity) : null,
        perks: t.perksText
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        sort_order: i,
        active: true,
      }));

      await adminSaveEvent(
        {
          id: editing === "new" ? undefined : editing || undefined,
          ...form,
          starts_at: new Date(form.starts_at).toISOString(),
          ends_at: null,
          location_notes: "",
          external_ticket_url: null,
        },
        tierPayload,
      );
      setMessage("Event saved.");
      setEditing(null);
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Events</h1>
          <p>Upcoming & past concerts, free or paid tiers, venues and cover images.</p>
        </div>
        <button type="button" className="btn btn-gold" onClick={startCreate}>
          New event
        </button>
      </header>

      {message && <p className="admin-banner">{message}</p>}

      {editing && (
        <form className="admin-form" onSubmit={onSubmit}>
          <h2>{editing === "new" ? "Create event" : "Edit event"}</h2>
          <div className="admin-form-grid">
            <label>
              Title
              <input
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug:
                      editing === "new"
                        ? title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                        : f.slug,
                  }));
                }}
              />
            </label>
            <label>
              Slug
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </label>
            <label>
              Starts at
              <input
                type="datetime-local"
                required
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </label>
            <label>
              Venue
              <input
                required
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </label>
            <label>
              City
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label>
              County
              <input
                value={form.county}
                onChange={(e) => setForm({ ...form, county: e.target.value })}
              />
            </label>
            <label className="full">
              Tagline
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </label>
            <label className="full">
              Description
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label>
              Cover image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void onUpload(e.target.files?.[0] || null)}
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.is_free}
                onChange={(e) => setForm({ ...form, is_free: e.target.checked })}
              />
              Free event
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured on home
            </label>
          </div>

          <h3>Ticket tiers</h3>
          {tiers.map((tier, idx) => (
            <div className="admin-tier-row" key={idx}>
              <input
                placeholder="Name"
                value={tier.name}
                onChange={(e) => {
                  const next = [...tiers];
                  next[idx] = { ...tier, name: e.target.value };
                  setTiers(next);
                }}
                required
              />
              <input
                type="number"
                min={0}
                placeholder="Price KES"
                value={tier.price_kes}
                onChange={(e) => {
                  const next = [...tiers];
                  next[idx] = { ...tier, price_kes: Number(e.target.value) };
                  setTiers(next);
                }}
              />
              <input
                placeholder="Perks (comma separated)"
                value={tier.perksText}
                onChange={(e) => {
                  const next = [...tiers];
                  next[idx] = { ...tier, perksText: e.target.value };
                  setTiers(next);
                }}
              />
              <button
                type="button"
                onClick={() => setTiers(tiers.filter((_, i) => i !== idx))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              setTiers([
                ...tiers,
                { name: "New tier", price_kes: 0, perksText: "", capacity: "" },
              ])
            }
          >
            Add tier
          </button>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-gold" disabled={busy}>
              {busy ? "Saving…" : "Save event"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>When</th>
              <th>Entry</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <strong>{event.title}</strong>
                  <div className="admin-muted">{event.venue}</div>
                </td>
                <td>{formatEventDate(event.starts_at)}</td>
                <td>
                  {event.is_free
                    ? "Free"
                    : event.ticket_tiers?.[0]
                      ? `from ${formatKes(
                          Math.min(...event.ticket_tiers.map((t) => t.price_kes)),
                        )}`
                      : "—"}
                </td>
                <td className="admin-row-actions">
                  <button type="button" onClick={() => startEdit(event)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void adminDeleteEvent(event.id).then(reload)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
