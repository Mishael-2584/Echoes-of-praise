import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { InView } from "../components/InView";
import { Loader } from "../components/Loader";
import { fetchEvents, formatEventDate, isUpcoming } from "../lib/api";
import {
  fetchContactSettings,
  submitContactForm,
  trackContactConversion,
} from "../lib/contactApi";
import { useCachedResource } from "../lib/useCachedResource";
import type { ContactSettings, EnquiryType } from "../types";

const ENQUIRY_OPTIONS: { value: EnquiryType; label: string }[] = [
  { value: "invite", label: "Invite the choir" },
  { value: "tickets", label: "Concert or ticket enquiry" },
  { value: "partnership", label: "Partnership or sponsorship" },
  { value: "media", label: "Media enquiry" },
  { value: "general", label: "General enquiry" },
];

const EVENT_TYPES = [
  { value: "church_service", label: "Church service" },
  { value: "concert", label: "Concert" },
  { value: "conference", label: "Conference" },
  { value: "wedding", label: "Wedding" },
  { value: "school_event", label: "School event" },
  { value: "outreach", label: "Outreach" },
  { value: "other", label: "Other" },
];

const FACILITATION_OPTIONS = [
  "Meals",
  "Transport",
  "Accommodation",
  "Financial facilitation/honorarium",
  "None",
  "Not yet confirmed",
  "Other",
];

type FormState = {
  enquiry_type: EnquiryType | "";
  full_name: string;
  phone: string;
  email: string;
  organisation: string;
  position_role: string;
  event_name: string;
  event_type: string;
  event_description: string;
  proposed_date: string;
  performance_time: string;
  town_venue: string;
  expected_length: string;
  expected_attendance: string;
  sound_system: "" | "yes" | "no" | "not_confirmed";
  sound_equipment: string;
  facilitation: string[];
  facilitation_details: string;
  programme_notes: string;
  theme_requests: string;
  additional_notes: string;
  attachment_url: string;
  ticket_event_id: string;
  ticket_event_title: string;
  ticket_reference: string;
  assistance_required: string;
  message: string;
  preferred_response: "" | "phone" | "whatsapp" | "email";
  website: string;
};

const emptyForm: FormState = {
  enquiry_type: "",
  full_name: "",
  phone: "",
  email: "",
  organisation: "",
  position_role: "",
  event_name: "",
  event_type: "",
  event_description: "",
  proposed_date: "",
  performance_time: "",
  town_venue: "",
  expected_length: "",
  expected_attendance: "",
  sound_system: "",
  sound_equipment: "",
  facilitation: [],
  facilitation_details: "",
  programme_notes: "",
  theme_requests: "",
  additional_notes: "",
  attachment_url: "",
  ticket_event_id: "",
  ticket_event_title: "",
  ticket_reference: "",
  assistance_required: "",
  message: "",
  preferred_response: "",
  website: "",
};

function whatsappHref(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function ContactPage() {
  const eventsQ = useCachedResource("events", fetchEvents);
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchContactSettings().then(setSettings);
  }, []);

  const upcoming = useMemo(
    () => (eventsQ.data ?? []).filter(isUpcoming),
    [eventsQ.data],
  );
  const latest = upcoming[0] ?? null;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleFacilitation(option: string) {
    setForm((f) => {
      const has = f.facilitation.includes(option);
      return {
        ...f,
        facilitation: has
          ? f.facilitation.filter((x) => x !== option)
          : [...f.facilitation, option],
      };
    });
  }

  async function onAttachment(file: File | null) {
    if (!file) {
      setField("attachment_url", "");
      return;
    }
    if (file.size > 400_000) {
      setStatus("err");
      setMessage("Attachment must be under 400KB. Please compress or share a link in additional notes.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setField("attachment_url", String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.enquiry_type) return;
    setBusy(true);
    setStatus("idle");
    setMessage(null);

    const payload = {
      enquiry_type: form.enquiry_type,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      organisation: form.organisation,
      position_role: form.position_role,
      event_name: form.event_name,
      event_type: form.event_type,
      event_description: form.event_description,
      proposed_date: form.proposed_date || null,
      performance_time: form.performance_time,
      town_venue: form.town_venue,
      expected_length: form.expected_length,
      expected_attendance:
        form.event_type === "church_service" ? "" : form.expected_attendance,
      sound_system: form.sound_system,
      sound_equipment: form.sound_system === "yes" ? form.sound_equipment : "",
      facilitation: form.facilitation,
      facilitation_details: form.facilitation_details,
      programme_notes: form.programme_notes,
      theme_requests: form.theme_requests,
      additional_notes: form.additional_notes,
      attachment_url: form.attachment_url || null,
      ticket_event_id: form.ticket_event_id || null,
      ticket_event_title: form.ticket_event_title,
      ticket_reference: form.ticket_reference,
      assistance_required: form.assistance_required,
      message: form.message,
      preferred_response: form.preferred_response,
      website: form.website,
    };

    const result = await submitContactForm(payload);
    setBusy(false);
    if (result.ok === false) {
      setStatus("err");
      setMessage(result.message);
      return;
    }
    trackContactConversion(form.enquiry_type);
    setStatus("ok");
    setMessage(
      "Thank you. Your enquiry has been sent. We will review it and respond soon.",
    );
    setForm({ ...emptyForm, enquiry_type: form.enquiry_type });
  }

  const email = settings?.email?.trim() || "";
  const whatsapp = settings?.whatsapp?.trim() || "";
  const wa = whatsappHref(whatsapp);
  const socials = [
    { label: "Facebook", href: settings?.facebook_url },
    { label: "Instagram", href: settings?.instagram_url },
    { label: "YouTube", href: settings?.youtube_url },
    { label: "TikTok", href: settings?.tiktok_url },
    { label: "X", href: settings?.x_url },
  ].filter((s) => s.href?.trim());

  const type = form.enquiry_type;
  const showAttendance = type === "invite" && form.event_type && form.event_type !== "church_service";

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">Contact</span>
            <h1 className="section-title">Contact Echoes of Praise</h1>
            <p className="section-lead">
              Would you like to invite Echoes of Praise, partner with the
              ministry, ask about an event or send us a message? Select the
              reason for contacting us below.
            </p>
            <p className="section-lead" style={{ marginTop: "0.75rem" }}>
              Echoes of Praise is based in Nakuru, Kenya.
            </p>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1.25rem" }}>
        <div className="container contact-layout">
          <InView className="contact-form-panel">
            <form className="contact-form" onSubmit={(e) => void onSubmit(e)}>
              <fieldset>
                <legend>How can we help?</legend>
                <div className="contact-type-grid">
                  {ENQUIRY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`contact-type-option ${
                        type === opt.value ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="enquiry_type"
                        value={opt.value}
                        checked={type === opt.value}
                        onChange={() => {
                          setForm({ ...emptyForm, enquiry_type: opt.value });
                          setStatus("idle");
                          setMessage(null);
                        }}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {type === "tickets" && (
                <div className="contact-tickets-panel">
                  <p>
                    Tickets and event information are available on our Events
                    page. Select an upcoming event to view ticket categories,
                    payment instructions and booking confirmation.
                  </p>
                  <div className="contact-ticket-actions">
                    <Link to="/events" className="btn btn-gold">
                      View All Upcoming Events
                    </Link>
                    {eventsQ.loading ? (
                      <Loader compact label="Loading events…" />
                    ) : latest ? (
                      <Link
                        to={`/events/${latest.slug}`}
                        className="btn btn-outline"
                      >
                        {latest.title} – Tickets &amp; Details
                      </Link>
                    ) : (
                      <p className="contact-note">
                        There are currently no upcoming ticketed events. Please
                        check again soon or follow our social pages for
                        announcements.
                      </p>
                    )}
                  </div>
                  <p className="contact-note">
                    Already purchased tickets? Use the form below for assistance.
                  </p>
                </div>
              )}

              {type && (
                <>
                  <fieldset>
                    <legend>Contact details</legend>
                    <div className="contact-fields">
                      <label>
                        Full name*
                        <input
                          required
                          value={form.full_name}
                          onChange={(e) => setField("full_name", e.target.value)}
                        />
                      </label>
                      <label>
                        Phone/WhatsApp number
                        {type === "invite" || type === "tickets" ? "*" : ""}
                        <input
                          required={type === "invite" || type === "tickets"}
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                        />
                      </label>
                      <label>
                        Email address*
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                        />
                      </label>
                      {type === "invite" && (
                        <>
                          <label>
                            Church/organisation*
                            <input
                              required
                              value={form.organisation}
                              onChange={(e) =>
                                setField("organisation", e.target.value)
                              }
                            />
                          </label>
                          <label>
                            Position or role
                            <input
                              value={form.position_role}
                              onChange={(e) =>
                                setField("position_role", e.target.value)
                              }
                            />
                          </label>
                        </>
                      )}
                      {(type === "partnership" ||
                        type === "media" ||
                        type === "general") && (
                        <label>
                          Organisation, if applicable
                          <input
                            value={form.organisation}
                            onChange={(e) =>
                              setField("organisation", e.target.value)
                            }
                          />
                        </label>
                      )}
                    </div>
                  </fieldset>

                  {type === "invite" && (
                    <>
                      <fieldset>
                        <legend>Event details</legend>
                        <div className="contact-fields">
                          <label>
                            Event name*
                            <input
                              required
                              value={form.event_name}
                              onChange={(e) =>
                                setField("event_name", e.target.value)
                              }
                            />
                          </label>
                          <label>
                            Type of event*
                            <select
                              required
                              value={form.event_type}
                              onChange={(e) => {
                                const v = e.target.value;
                                setForm((f) => ({
                                  ...f,
                                  event_type: v,
                                  expected_attendance:
                                    v === "church_service"
                                      ? ""
                                      : f.expected_attendance,
                                }));
                              }}
                            >
                              <option value="">Select type</option>
                              {EVENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="contact-span-2">
                            Event description*
                            <textarea
                              required
                              rows={4}
                              placeholder="Briefly describe the event, its purpose and what you would like Echoes of Praise to contribute."
                              value={form.event_description}
                              onChange={(e) =>
                                setField("event_description", e.target.value)
                              }
                            />
                          </label>
                          <label>
                            Proposed date*
                            <input
                              required
                              type="date"
                              value={form.proposed_date}
                              onChange={(e) =>
                                setField("proposed_date", e.target.value)
                              }
                            />
                          </label>
                          <label>
                            Performance/service time
                            <input
                              value={form.performance_time}
                              onChange={(e) =>
                                setField("performance_time", e.target.value)
                              }
                            />
                          </label>
                          <label className="contact-span-2">
                            Town and venue*
                            <input
                              required
                              value={form.town_venue}
                              onChange={(e) =>
                                setField("town_venue", e.target.value)
                              }
                            />
                          </label>
                          <label>
                            Expected length of the choir’s presentation
                            <input
                              value={form.expected_length}
                              onChange={(e) =>
                                setField("expected_length", e.target.value)
                              }
                            />
                          </label>
                          {showAttendance && (
                            <label>
                              Expected attendance
                              <input
                                value={form.expected_attendance}
                                onChange={(e) =>
                                  setField("expected_attendance", e.target.value)
                                }
                              />
                            </label>
                          )}
                        </div>
                      </fieldset>

                      <fieldset>
                        <legend>Sound system</legend>
                        <p className="contact-note">Will a sound system be provided?</p>
                        <div className="contact-inline-options">
                          {(
                            [
                              ["yes", "Yes"],
                              ["no", "No"],
                              ["not_confirmed", "Not yet confirmed"],
                            ] as const
                          ).map(([value, label]) => (
                            <label key={value}>
                              <input
                                type="radio"
                                name="sound_system"
                                checked={form.sound_system === value}
                                onChange={() => setField("sound_system", value)}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        {form.sound_system === "yes" && (
                          <label className="contact-block-field">
                            Available sound equipment
                            <textarea
                              rows={3}
                              placeholder="List the microphones, mixer, speakers, monitors, instruments and sound technician available at the venue."
                              value={form.sound_equipment}
                              onChange={(e) =>
                                setField("sound_equipment", e.target.value)
                              }
                            />
                          </label>
                        )}
                      </fieldset>

                      <fieldset>
                        <legend>Facilitation</legend>
                        <p className="contact-note">
                          What facilitation will be provided?
                        </p>
                        <div className="contact-check-grid">
                          {FACILITATION_OPTIONS.map((opt) => (
                            <label key={opt}>
                              <input
                                type="checkbox"
                                checked={form.facilitation.includes(opt)}
                                onChange={() => toggleFacilitation(opt)}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                        <label className="contact-block-field">
                          Provide details about meals, transport arrangements,
                          accommodation nights and any proposed financial
                          facilitation.
                          <textarea
                            rows={3}
                            value={form.facilitation_details}
                            onChange={(e) =>
                              setField("facilitation_details", e.target.value)
                            }
                          />
                        </label>
                      </fieldset>

                      <fieldset>
                        <legend>Additional information</legend>
                        <div className="contact-fields">
                          <label className="contact-span-2">
                            Event programme or schedule
                            <textarea
                              rows={3}
                              value={form.programme_notes}
                              onChange={(e) =>
                                setField("programme_notes", e.target.value)
                              }
                            />
                          </label>
                          <label className="contact-span-2">
                            Special theme or song requests
                            <textarea
                              rows={2}
                              value={form.theme_requests}
                              onChange={(e) =>
                                setField("theme_requests", e.target.value)
                              }
                            />
                          </label>
                          <label className="contact-span-2">
                            Additional notes
                            <textarea
                              rows={2}
                              value={form.additional_notes}
                              onChange={(e) =>
                                setField("additional_notes", e.target.value)
                              }
                            />
                          </label>
                          <label className="contact-span-2">
                            Optional programme/poster upload
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) =>
                                void onAttachment(e.target.files?.[0] ?? null)
                              }
                            />
                          </label>
                        </div>
                      </fieldset>
                    </>
                  )}

                  {type === "tickets" && (
                    <fieldset>
                      <legend>Ticket assistance</legend>
                      <div className="contact-fields">
                        <label>
                          Event
                          <select
                            value={form.ticket_event_id}
                            onChange={(e) => {
                              const id = e.target.value;
                              const ev = upcoming.find((x) => x.id === id);
                              setForm((f) => ({
                                ...f,
                                ticket_event_id: id,
                                ticket_event_title: ev?.title || "",
                              }));
                            }}
                          >
                            <option value="">Select event (optional)</option>
                            {upcoming.map((ev) => (
                              <option key={ev.id} value={ev.id}>
                                {ev.title} · {formatEventDate(ev.starts_at)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Ticket/reference number, if available
                          <input
                            value={form.ticket_reference}
                            onChange={(e) =>
                              setField("ticket_reference", e.target.value)
                            }
                          />
                        </label>
                        <label className="contact-span-2">
                          Assistance required*
                          <textarea
                            required
                            rows={4}
                            value={form.assistance_required}
                            onChange={(e) =>
                              setField("assistance_required", e.target.value)
                            }
                          />
                        </label>
                      </div>
                    </fieldset>
                  )}

                  {(type === "partnership" ||
                    type === "media" ||
                    type === "general") && (
                    <fieldset>
                      <legend>Your message</legend>
                      <div className="contact-fields">
                        <label className="contact-span-2">
                          Message*
                          <textarea
                            required
                            rows={5}
                            value={form.message}
                            onChange={(e) => setField("message", e.target.value)}
                          />
                        </label>
                        <label>
                          Preferred response method
                          <select
                            value={form.preferred_response}
                            onChange={(e) =>
                              setField(
                                "preferred_response",
                                e.target.value as FormState["preferred_response"],
                              )
                            }
                          >
                            <option value="">Select</option>
                            <option value="phone">Phone</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                          </select>
                        </label>
                      </div>
                    </fieldset>
                  )}

                  {/* Honeypot */}
                  <label className="contact-hp" aria-hidden>
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => setField("website", e.target.value)}
                    />
                  </label>

                  {type === "invite" && (
                    <p className="contact-notice">
                      Submitting this form does not confirm the invitation. Our
                      team will review the request and contact you regarding
                      availability and arrangements.
                    </p>
                  )}

                  {status !== "idle" && message && (
                    <p
                      className={`status-msg ${status === "ok" ? "ok" : "err"}`}
                    >
                      {message}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={busy}
                  >
                    {busy
                      ? "Sending…"
                      : type === "invite"
                        ? "Send Invitation Request"
                        : "Send enquiry"}
                  </button>
                </>
              )}
            </form>
          </InView>

          <InView className="contact-aside" delay={80}>
            <div className="contact-card">
              <h3>Reach us</h3>
              {email && (
                <p>
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              )}
              {wa && (
                <p>
                  <a href={wa} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </p>
              )}
              {settings?.response_time && (
                <p className="contact-note">{settings.response_time}</p>
              )}
              {socials.length > 0 && (
                <div className="contact-socials">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href!}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </InView>
        </div>
      </section>
    </>
  );
}
