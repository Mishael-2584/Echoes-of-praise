import { useEffect, useState, type FormEvent } from "react";
import {
  adminListFundraisers,
  adminSaveFundraiser,
  adminUploadImage,
} from "../lib/adminApi";
import { formatKes } from "../lib/api";
import type { Fundraiser, FundraiserKind } from "../types";

export function AdminFundraisers() {
  const [items, setItems] = useState<Fundraiser[]>([]);
  const [editing, setEditing] = useState<Fundraiser | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function reload() {
    setItems(await adminListFundraisers());
  }

  useEffect(() => {
    void reload();
  }, []);

  function startNew() {
    setEditing({
      id: "",
      slug: "",
      title: "",
      subtitle: "",
      story: "",
      kind: "campaign",
      goal_kes: 100000,
      raised_kes: 0,
      show_progress: true,
      cover_image_url: "/images/choir-main.jpg",
      active: true,
      event_id: null,
      starts_at: null,
      ends_at: null,
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await adminSaveFundraiser({
      ...editing,
      id: editing.id || undefined,
      slug:
        editing.slug ||
        editing.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
    });
    setMessage("Fundraiser saved.");
    setEditing(null);
    await reload();
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Fundraisers</h1>
          <p>
            Ongoing choir support (always on) plus optional campaign goals with progress.
          </p>
        </div>
        <button type="button" className="btn btn-gold" onClick={startNew}>
          New campaign
        </button>
      </header>

      {message && <p className="admin-banner">{message}</p>}

      {editing && (
        <form className="admin-form" onSubmit={onSubmit}>
          <h2>{editing.id ? "Edit" : "Create"} fundraiser</h2>
          <div className="admin-form-grid">
            <label>
              Title
              <input
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </label>
            <label>
              Kind
              <select
                value={editing.kind}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    kind: e.target.value as FundraiserKind,
                    show_progress:
                      e.target.value === "campaign" ? editing.show_progress : false,
                  })
                }
              >
                <option value="ongoing_support">Ongoing support</option>
                <option value="campaign">Campaign / project</option>
              </select>
            </label>
            <label className="full">
              Subtitle
              <input
                value={editing.subtitle}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </label>
            <label className="full">
              Story
              <textarea
                rows={4}
                value={editing.story}
                onChange={(e) => setEditing({ ...editing, story: e.target.value })}
              />
            </label>
            <label>
              Goal (KES)
              <input
                type="number"
                value={editing.goal_kes ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    goal_kes: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </label>
            <label>
              Raised (KES)
              <input
                type="number"
                value={editing.raised_kes}
                onChange={(e) =>
                  setEditing({ ...editing, raised_kes: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={editing.show_progress}
                onChange={(e) =>
                  setEditing({ ...editing, show_progress: e.target.checked })
                }
              />
              Show progress & target on site
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              />
              Active
            </label>
            <label>
              Cover image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void adminUploadImage("fundraisers", file).then((url) =>
                      setEditing({ ...editing, cover_image_url: url }),
                    );
                  }
                }}
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-gold">
              Save
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Kind</th>
              <th>Progress</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <div className="admin-muted">{item.subtitle}</div>
                </td>
                <td>{item.kind === "ongoing_support" ? "Ongoing" : "Campaign"}</td>
                <td>
                  {item.show_progress && item.goal_kes
                    ? `${formatKes(item.raised_kes)} / ${formatKes(item.goal_kes)}`
                    : "Hidden / open giving"}
                </td>
                <td>
                  <button type="button" onClick={() => setEditing(item)}>
                    Edit
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
