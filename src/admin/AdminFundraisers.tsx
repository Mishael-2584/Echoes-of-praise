import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  adminArchiveFundraiser,
  adminListFundraisers,
  adminRestoreFundraiser,
  adminSaveFundraiser,
  adminUploadImage,
} from "../lib/adminApi";
import { formatKes } from "../lib/api";
import type { Fundraiser, FundraiserKind } from "../types";

export function AdminFundraisers() {
  const [items, setItems] = useState<Fundraiser[]>([]);
  const [editing, setEditing] = useState<Fundraiser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [busy, setBusy] = useState(false);

  async function reload() {
    setItems(await adminListFundraisers());
  }

  useEffect(() => {
    void reload().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load fundraisers");
    });
  }, []);

  const visible = useMemo(
    () =>
      items.filter((item) =>
        tab === "archived"
          ? Boolean(item.archived_at) || item.active === false
          : !item.archived_at && item.active !== false,
      ),
    [items, tab],
  );

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
      archived_at: null,
      event_id: null,
      starts_at: null,
      ends_at: null,
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      await adminSaveFundraiser({
        ...editing,
        id: editing.id || undefined,
        archived_at: editing.archived_at ?? null,
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function archive(id: string, title: string) {
    if (
      !window.confirm(
        `Archive “${title}”? It will hide from the public site but stay in backups here.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await adminArchiveFundraiser(id);
      setMessage(`“${title}” archived (soft delete — data kept).`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed");
    } finally {
      setBusy(false);
    }
  }

  async function restore(id: string, title: string) {
    setBusy(true);
    setError(null);
    try {
      await adminRestoreFundraiser(id);
      setMessage(`“${title}” restored to the live site.`);
      setTab("active");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Fundraisers</h1>
          <p>
            Ongoing choir support plus campaigns. Archive soft-deletes a campaign
            (kept as backup, hidden from the public site).
          </p>
        </div>
        <button type="button" className="btn btn-gold" onClick={startNew}>
          New campaign
        </button>
      </header>

      {message && <p className="admin-banner">{message}</p>}
      {error && <p className="admin-banner admin-banner-error">{error}</p>}

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === "active" ? "active" : undefined}
          onClick={() => setTab("active")}
        >
          Active
        </button>
        <button
          type="button"
          className={tab === "archived" ? "active" : undefined}
          onClick={() => setTab("archived")}
        >
          Archived
        </button>
      </div>

      {editing && (
        <form className="admin-form" onSubmit={(e) => void onSubmit(e)}>
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
                checked={editing.active && !editing.archived_at}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    active: e.target.checked,
                    archived_at: e.target.checked ? null : editing.archived_at,
                  })
                }
              />
              Active on public site
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
            <button type="submit" className="btn btn-gold" disabled={busy}>
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
            {visible.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <div className="admin-muted">{item.subtitle}</div>
                  {item.archived_at && (
                    <div className="admin-muted">
                      Archived {new Date(item.archived_at).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td>{item.kind === "ongoing_support" ? "Ongoing" : "Campaign"}</td>
                <td>
                  {item.show_progress && item.goal_kes
                    ? `${formatKes(item.raised_kes)} / ${formatKes(item.goal_kes)}`
                    : "Hidden / open giving"}
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => setEditing(item)}>
                      Edit
                    </button>
                    {tab === "active" ? (
                      <button
                        type="button"
                        className="danger"
                        disabled={busy}
                        onClick={() => void archive(item.id, item.title)}
                      >
                        Archive
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void restore(item.id, item.title)}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-muted">
                  No {tab} fundraisers.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
