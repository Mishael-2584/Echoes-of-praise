import { useEffect, useMemo, useState } from "react";
import {
  adminGetContactSettings,
  adminListContactSubmissions,
  adminSaveContactSettings,
  adminUpdateContactSubmission,
  filterContactSubmissions,
} from "../lib/adminApi";
import {
  contactStatusLabels,
  enquiryLabels,
} from "../lib/contactApi";
import type {
  ContactSettings,
  ContactStatus,
  ContactSubmission,
  EnquiryType,
} from "../types";

const STATUS_OPTIONS = Object.keys(contactStatusLabels) as ContactStatus[];

export function AdminContacts() {
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");
  const [rows, setRows] = useState<ContactSubmission[]>([]);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<{
    enquiry_type: EnquiryType | "all";
    status: ContactStatus | "all";
    date_from: string;
    date_to: string;
  }>({
    enquiry_type: "all",
    status: "all",
    date_from: "",
    date_to: "",
  });

  async function reload() {
    setRows(await adminListContactSubmissions());
    setSettings(await adminGetContactSettings());
  }

  useEffect(() => {
    void reload().catch((err) =>
      setMessage(err instanceof Error ? err.message : "Failed to load"),
    );
  }, []);

  const filtered = useMemo(
    () => filterContactSubmissions(rows, filters),
    [rows, filters],
  );

  async function saveStatus(status: ContactStatus) {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await adminUpdateContactSubmission(selected.id, {
        status,
      });
      setSelected(updated);
      await reload();
      setMessage("Status updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveNotes(admin_notes: string) {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await adminUpdateContactSubmission(selected.id, {
        admin_notes,
      });
      setSelected(updated);
      await reload();
      setMessage("Notes saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    try {
      const next = await adminSaveContactSettings(settings);
      setSettings(next);
      setMessage("Contact settings saved. Empty social fields stay hidden on the site.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setBusy(false);
    }
  }

  function soundLabel(v: string) {
    if (v === "yes") return "Provided";
    if (v === "no") return "Not provided";
    if (v === "not_confirmed") return "Not confirmed";
    return "—";
  }

  function facilitationLabel(row: ContactSubmission) {
    if (!row.facilitation?.length) return "—";
    return row.facilitation.join(", ");
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Contacts</h1>
          <p>Choir invitations and website enquiries.</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className={`btn ${tab === "inbox" ? "btn-gold" : "btn-outline"}`}
            onClick={() => setTab("inbox")}
          >
            Inbox
          </button>
          <button
            type="button"
            className={`btn ${tab === "settings" ? "btn-gold" : "btn-outline"}`}
            onClick={() => setTab("settings")}
          >
            Public contact details
          </button>
        </div>
      </header>

      {message && <p className="admin-banner">{message}</p>}

      {tab === "settings" && settings && (
        <form className="admin-form" onSubmit={(e) => void saveSettings(e)}>
          <h2>Editable contact channels</h2>
          <p className="admin-muted">
            Leave a field blank to hide that button on the public Contact page.
          </p>
          <div className="admin-form-grid">
            <label>
              Public email
              <input
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </label>
            <label>
              WhatsApp number
              <input
                placeholder="2547…"
                value={settings.whatsapp}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp: e.target.value })
                }
              />
            </label>
            <label className="admin-span-2">
              Response time note
              <input
                value={settings.response_time}
                onChange={(e) =>
                  setSettings({ ...settings, response_time: e.target.value })
                }
              />
            </label>
            <label>
              Facebook URL
              <input
                value={settings.facebook_url}
                onChange={(e) =>
                  setSettings({ ...settings, facebook_url: e.target.value })
                }
              />
            </label>
            <label>
              Instagram URL
              <input
                value={settings.instagram_url}
                onChange={(e) =>
                  setSettings({ ...settings, instagram_url: e.target.value })
                }
              />
            </label>
            <label>
              YouTube URL
              <input
                value={settings.youtube_url}
                onChange={(e) =>
                  setSettings({ ...settings, youtube_url: e.target.value })
                }
              />
            </label>
            <label>
              TikTok URL
              <input
                value={settings.tiktok_url}
                onChange={(e) =>
                  setSettings({ ...settings, tiktok_url: e.target.value })
                }
              />
            </label>
            <label>
              X / Twitter URL
              <input
                value={settings.x_url}
                onChange={(e) =>
                  setSettings({ ...settings, x_url: e.target.value })
                }
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-gold" disabled={busy}>
              Save settings
            </button>
          </div>
        </form>
      )}

      {tab === "inbox" && (
        <>
          <div className="admin-toolbar contact-filters">
            <label>
              Category
              <select
                value={filters.enquiry_type}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    enquiry_type: e.target.value as EnquiryType | "all",
                  }))
                }
              >
                <option value="all">All</option>
                {(Object.keys(enquiryLabels) as EnquiryType[]).map((k) => (
                  <option key={k} value={k}>
                    {enquiryLabels[k]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value as ContactStatus | "all",
                  }))
                }
              >
                <option value="all">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {contactStatusLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Event date from
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, date_from: e.target.value }))
                }
              />
            </label>
            <label>
              Event date to
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, date_to: e.target.value }))
                }
              />
            </label>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Name / organisation</th>
                  <th>Event date</th>
                  <th>Location</th>
                  <th>Sound</th>
                  <th>Facilitation</th>
                  <th>Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={selected?.id === row.id ? "is-selected" : undefined}
                    onClick={() => setSelected(row)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{enquiryLabels[row.enquiry_type]}</td>
                    <td>
                      <strong>{row.full_name}</strong>
                      <div className="admin-muted">{row.organisation || "—"}</div>
                    </td>
                    <td>{row.proposed_date || "—"}</td>
                    <td>{row.town_venue || "—"}</td>
                    <td>{soundLabel(row.sound_system)}</td>
                    <td>{facilitationLabel(row)}</td>
                    <td>
                      {new Date(row.created_at).toLocaleDateString("en-KE")}
                    </td>
                    <td>{contactStatusLabels[row.status]}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8}>No submissions match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <article className="admin-form contact-detail">
              <header className="admin-page-header">
                <div>
                  <h2>{selected.full_name}</h2>
                  <p>{enquiryLabels[selected.enquiry_type]}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </header>

              <div className="contact-detail-grid">
                <section>
                  <h3>Contact details</h3>
                  <p>Email: {selected.email || "—"}</p>
                  <p>Phone: {selected.phone || "—"}</p>
                  <p>Organisation: {selected.organisation || "—"}</p>
                  <p>Role: {selected.position_role || "—"}</p>
                  <p>
                    Preferred response: {selected.preferred_response || "—"}
                  </p>
                </section>
                <section>
                  <h3>Enquiry category</h3>
                  <p>{enquiryLabels[selected.enquiry_type]}</p>
                  <p>Received: {new Date(selected.created_at).toLocaleString()}</p>
                </section>
                <section>
                  <h3>Event information</h3>
                  <p>Name: {selected.event_name || selected.ticket_event_title || "—"}</p>
                  <p>Type: {selected.event_type || "—"}</p>
                  <p>Date: {selected.proposed_date || "—"}</p>
                  <p>Time: {selected.performance_time || "—"}</p>
                  <p>Venue: {selected.town_venue || "—"}</p>
                  <p>
                    Attendance:{" "}
                    {selected.event_type === "church_service"
                      ? "Not required — Church service."
                      : selected.expected_attendance || "—"}
                  </p>
                  <p>{selected.event_description || selected.assistance_required || selected.message || "—"}</p>
                </section>
                <section>
                  <h3>Sound-system provision</h3>
                  <p>{soundLabel(selected.sound_system)}</p>
                  <p>{selected.sound_equipment || "—"}</p>
                </section>
                <section>
                  <h3>Facilitation</h3>
                  <p>{facilitationLabel(selected)}</p>
                  <p>{selected.facilitation_details || "—"}</p>
                </section>
                <section>
                  <h3>Additional notes & attachments</h3>
                  <p>Programme: {selected.programme_notes || "—"}</p>
                  <p>Theme/songs: {selected.theme_requests || "—"}</p>
                  <p>Notes: {selected.additional_notes || "—"}</p>
                  <p>Ticket ref: {selected.ticket_reference || "—"}</p>
                  {selected.attachment_url && (
                    <p>
                      <a href={selected.attachment_url} target="_blank" rel="noreferrer">
                        View attachment
                      </a>
                    </p>
                  )}
                </section>
              </div>

              <div className="admin-form-grid" style={{ marginTop: "1.25rem" }}>
                <label>
                  Status
                  <select
                    value={selected.status}
                    disabled={busy}
                    onChange={(e) =>
                      void saveStatus(e.target.value as ContactStatus)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {contactStatusLabels[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-span-2">
                  Admin notes
                  <textarea
                    rows={3}
                    defaultValue={selected.admin_notes}
                    key={selected.id + selected.updated_at}
                    onBlur={(e) => {
                      if (e.target.value !== selected.admin_notes) {
                        void saveNotes(e.target.value);
                      }
                    }}
                  />
                </label>
              </div>
            </article>
          )}
        </>
      )}
    </div>
  );
}
