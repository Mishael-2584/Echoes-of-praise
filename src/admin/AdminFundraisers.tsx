import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  adminArchiveFundraiser,
  adminListFundraisers,
  adminRestoreFundraiser,
  adminSaveFundraiser,
  adminUploadImage,
} from "../lib/adminApi";
import { formatKes, formatPercent, fundBalance, progressPercent } from "../lib/api";
import { seedFundraisers } from "../lib/seed";
import type { Fundraiser, FundraiserKind } from "../types";

const emptySlide = {
  paybill: "",
  account_number: "",
  account_name: "",
  slide_kicker: "",
  slide_tagline: "",
};

function prefillSlide(row: Fundraiser): Fundraiser {
  const current: Fundraiser = { ...emptySlide, ...row };
  const canonical = seedFundraisers.find((item) => item.slug === row.slug);
  if (!canonical || current.paybill.trim() || current.account_number.trim()) {
    return current;
  }
  return {
    ...current,
    raised_kes: current.raised_kes > 0 ? current.raised_kes : canonical.raised_kes,
    goal_kes: current.goal_kes ?? canonical.goal_kes,
    paybill: canonical.paybill,
    account_number: canonical.account_number,
    account_name: canonical.account_name,
    slide_kicker: canonical.slide_kicker,
    slide_tagline: canonical.slide_tagline,
  };
}

export function AdminFundraisers() {
  const [items, setItems] = useState<Fundraiser[]>([]);
  const [editing, setEditing] = useState<Fundraiser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [busy, setBusy] = useState(false);
  const [slide, setSlide] = useState<Fundraiser | null>(null);

  async function reload() {
    const next = await adminListFundraisers();
    setItems(next);
    return next;
  }

  useEffect(() => {
    void reload()
      .then((next) => {
        const row = next.find((item) => item.slug === "one-concert-2026");
        if (row) setSlide(prefillSlide(row));
      })
      .catch((err: unknown) => {
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
      ...emptySlide,
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
      if (editing.slug === "one-concert-2026") setSlide(prefillSlide(editing));
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

  async function saveSlide(e: FormEvent) {
    e.preventDefault();
    if (!slide) return;
    setBusy(true);
    setError(null);
    try {
      await adminSaveFundraiser(slide);
      setMessage("Progress slide updated.");
      const next = await reload();
      const row = next.find((item) => item.slug === "one-concert-2026");
      if (row) setSlide(prefillSlide({ ...row, ...slide, id: row.id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
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
            Update the homepage progress slide here, then manage other campaigns
            below. Archive hides a campaign from the public site and keeps the row.
          </p>
        </div>
        <button type="button" className="btn btn-gold" onClick={startNew}>
          New campaign
        </button>
      </header>

      {message && <p className="admin-banner">{message}</p>}
      {error && <p className="admin-banner admin-banner-error">{error}</p>}

      {slide && (
        <form className="admin-form" onSubmit={(e) => void saveSlide(e)}>
          <h2>Progress slide</h2>
          <p className="admin-muted">
            Shown on the home page and Give page. Cash received is{" "}
            {formatKes(slide.raised_kes)} of {formatKes(slide.goal_kes || 0)} (
            {formatPercent(progressPercent(slide.raised_kes, slide.goal_kes))}% funded,
            balance {formatKes(fundBalance(slide.goal_kes, slide.raised_kes))}).
          </p>
          <div className="admin-form-grid">
            <label className="full">
              Slide label
              <input
                value={slide.slide_kicker}
                onChange={(e) => setSlide({ ...slide, slide_kicker: e.target.value })}
              />
            </label>
            <label className="full">
              Tagline
              <input
                value={slide.slide_tagline}
                onChange={(e) => setSlide({ ...slide, slide_tagline: e.target.value })}
              />
            </label>
            <label>
              Cash received (KES)
              <input
                type="number"
                min={0}
                value={slide.raised_kes}
                onChange={(e) =>
                  setSlide({ ...slide, raised_kes: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label>
              Target (KES)
              <input
                type="number"
                min={0}
                value={slide.goal_kes ?? ""}
                onChange={(e) =>
                  setSlide({
                    ...slide,
                    goal_kes: e.target.value ? Number(e.target.value) : null,
                    show_progress: true,
                  })
                }
              />
            </label>
            <label>
              M-Pesa paybill
              <input
                value={slide.paybill}
                onChange={(e) => setSlide({ ...slide, paybill: e.target.value })}
              />
            </label>
            <label>
              Account number
              <input
                value={slide.account_number}
                onChange={(e) =>
                  setSlide({ ...slide, account_number: e.target.value })
                }
              />
            </label>
            <label>
              Account name
              <input
                value={slide.account_name}
                onChange={(e) => setSlide({ ...slide, account_name: e.target.value })}
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-gold" disabled={busy}>
              Save progress slide
            </button>
          </div>
        </form>
      )}

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
            <label>
              M-Pesa paybill
              <input
                value={editing.paybill}
                onChange={(e) => setEditing({ ...editing, paybill: e.target.value })}
              />
            </label>
            <label>
              Account number
              <input
                value={editing.account_number}
                onChange={(e) =>
                  setEditing({ ...editing, account_number: e.target.value })
                }
              />
            </label>
            <label>
              Account name
              <input
                value={editing.account_name}
                onChange={(e) =>
                  setEditing({ ...editing, account_name: e.target.value })
                }
              />
            </label>
            <label>
              Slide label
              <input
                value={editing.slide_kicker}
                onChange={(e) =>
                  setEditing({ ...editing, slide_kicker: e.target.value })
                }
              />
            </label>
            <label className="full">
              Slide tagline
              <input
                value={editing.slide_tagline}
                onChange={(e) =>
                  setEditing({ ...editing, slide_tagline: e.target.value })
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
