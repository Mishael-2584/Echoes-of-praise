import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  adminDeleteChoirMember,
  adminListChoirMembers,
  adminSaveChoirMember,
  adminSortChoirMembersAZ,
} from "../lib/adminApi";
import type { RosterMember } from "../types";

const emptyForm = {
  name: "",
  section: "",
  published: true,
};

export function AdminMembers() {
  const [members, setMembers] = useState<RosterMember[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    setMembers(await adminListChoirMembers());
  }

  useEffect(() => {
    void reload();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.section || "").toLowerCase().includes(q),
    );
  }, [members, query]);

  function startCreate() {
    setEditing("new");
    setForm({ ...emptyForm });
    setMessage(null);
  }

  function startEdit(member: RosterMember) {
    setEditing(member.id);
    setForm({
      name: member.name,
      section: member.section || "",
      published: member.published,
    });
    setMessage(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      await adminSaveChoirMember({
        id: editing === "new" ? undefined : editing || undefined,
        name: form.name,
        section: form.section || null,
        published: form.published,
        sort_order:
          editing === "new"
            ? members.length + 1
            : members.find((m) => m.id === editing)?.sort_order ?? 0,
      });
      setEditing(null);
      setMessage("Member saved.");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save member.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(member: RosterMember) {
    if (!confirm(`Remove ${member.name} from the roster?`)) return;
    setBusy(true);
    setMessage(null);
    try {
      await adminDeleteChoirMember(member.id);
      if (editing === member.id) setEditing(null);
      setMessage("Member removed.");
      await reload();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Could not remove member.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSortAZ() {
    setBusy(true);
    setMessage(null);
    try {
      setMembers(await adminSortChoirMembersAZ());
      setMessage("Roster sorted A–Z.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not sort roster.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Members</h1>
          <p>Add, edit, or remove names on the public choir roster.</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void onSortAZ()}
            disabled={busy || members.length === 0}
          >
            Sort A–Z
          </button>
          <button type="button" className="btn btn-gold" onClick={startCreate}>
            Add member
          </button>
        </div>
      </header>

      {message && <p className="admin-banner">{message}</p>}

      {editing && (
        <form className="admin-form" onSubmit={(e) => void onSubmit(e)}>
          <h2>{editing === "new" ? "New member" : "Edit member"}</h2>
          <div className="admin-form-grid">
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label>
              Role / note (optional)
              <input
                value={form.section}
                placeholder="e.g. Violin, Conductor"
                onChange={(e) =>
                  setForm((f) => ({ ...f, section: e.target.value }))
                }
              />
            </label>
            <label>
              Visibility
              <select
                value={form.published ? "yes" : "no"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    published: e.target.value === "yes",
                  }))
                }
              >
                <option value="yes">Published on site</option>
                <option value="no">Hidden</option>
              </select>
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-gold" disabled={busy}>
              {busy ? "Saving…" : "Save member"}
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

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search members…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>
          {filtered.length} of {members.length}
        </span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role / note</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id}>
                <td>
                  <strong>{member.name}</strong>
                </td>
                <td>{member.section || "—"}</td>
                <td>{member.published ? "Published" : "Hidden"}</td>
                <td className="admin-row-actions">
                  <button type="button" onClick={() => startEdit(member)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => void onDelete(member)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4}>No members match this search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
