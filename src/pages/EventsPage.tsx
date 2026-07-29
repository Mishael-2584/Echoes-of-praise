import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { InView } from "../components/InView";
import { Loader } from "../components/Loader";
import { TicketCheckout } from "../components/TicketCheckout";
import {
  fetchEvents,
  formatEventDate,
  formatEventTime,
  formatKes,
  isUpcoming,
} from "../lib/api";
import { useCachedResource } from "../lib/useCachedResource";
import type { ChoirEvent, TicketTier } from "../types";

export function EventsPage() {
  const { eventId } = useParams();
  const { data, loading, error } = useCachedResource("events", fetchEvents);
  const events = data ?? [];
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [checkout, setCheckout] = useState<{
    event: ChoirEvent;
    tier: TicketTier;
  } | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!events.length) return;
    setSelectedTiers((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const e of events) {
        if (!next[e.id] && e.ticket_tiers?.[0]) {
          next[e.id] = e.ticket_tiers[0].id;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [events]);

  const focused = useMemo(
    () => events.find((e) => e.slug === eventId || e.id === eventId) ?? null,
    [events, eventId],
  );

  const upcoming = events.filter(isUpcoming);
  const past = events.filter((e) => !isUpcoming(e)).reverse();
  const list = tab === "upcoming" ? upcoming : past;

  function openCheckout(event: ChoirEvent, tierId?: string) {
    if (event.external_ticket_url) {
      window.open(event.external_ticket_url, "_blank", "noopener,noreferrer");
      return;
    }
    const tiers = event.ticket_tiers ?? [];
    const id = tierId ?? selectedTiers[event.id] ?? tiers[0]?.id;
    const tier = tiers.find((t) => t.id === id);
    if (!tier) return;
    setCheckout({ event, tier });
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">Events</span>
            <h1 className="section-title">Concerts & tickets</h1>
            <p className="section-lead">
              Free or paid entry, managed here—with secure M-Pesa for paid nights and
              registration that helps us know who we serve.
            </p>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="container">
          {error && <p className="status-msg err">{error}</p>}

          {loading && (
            <Loader
              label="Loading concerts…"
              skeletons={3}
              className="events-loader"
            />
          )}

          {!loading && focused && (
            <InView className="ticket-panel" as="article">
              <div className="ticket-panel-media">
                <img
                  src={focused.cover_image_url || "/images/choir-main.jpg"}
                  alt=""
                />
              </div>
              <span className="event-date-pill">
                {formatEventDate(focused.starts_at)} ·{" "}
                {formatEventTime(focused.starts_at)}
              </span>
              <h2 className="section-title" style={{ marginTop: "0.9rem" }}>
                {focused.title}
              </h2>
              <p className="section-lead">{focused.description}</p>
              <div className="featured-meta" style={{ marginTop: "1.5rem" }}>
                <div className="featured-meta-row">
                  <strong>Venue</strong>
                  <span>
                    {focused.venue}, {focused.city}
                    {focused.county ? ` · ${focused.county}` : ""}
                  </span>
                </div>
                <div className="featured-meta-row">
                  <strong>Entry</strong>
                  <span>
                    {(focused.ticket_tiers?.length ?? 0) === 0
                      ? "Ticketing coming soon"
                      : focused.is_free
                        ? "Free registration"
                        : "Paid tickets"}
                  </span>
                </div>
                {focused.location_notes && (
                  <div className="featured-meta-row">
                    <strong>Notes</strong>
                    <span>{focused.location_notes}</span>
                  </div>
                )}
              </div>

              {(focused.ticket_tiers?.length ?? 0) > 0 ? (
                <>
                  <div className="ticket-tiers">
                    {focused.ticket_tiers!.map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        className={`ticket-tier ${
                          selectedTiers[focused.id] === tier.id ? "selected" : ""
                        }`}
                        onClick={() =>
                          setSelectedTiers((s) => ({
                            ...s,
                            [focused.id]: tier.id,
                          }))
                        }
                      >
                        <h4>{tier.name}</h4>
                        <div className="ticket-price">
                          {tier.price_kes === 0
                            ? "Free"
                            : formatKes(tier.price_kes)}
                        </div>
                        <ul>
                          {tier.perks.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: "1.4rem" }}>
                    <button
                      type="button"
                      className="btn btn-gold"
                      onClick={() => openCheckout(focused)}
                    >
                      {focused.is_free ? "Register" : "Get tickets"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="tickets-soon">
                  <p>
                    {isUpcoming(focused)
                      ? "Ticketing information coming soon."
                      : "Tickets for this event are closed or were not required."}
                  </p>
                  {focused.slug === "one-concert-2026" && (
                    <Link
                      to="/give"
                      className="btn btn-gold"
                      style={{ marginTop: "1rem" }}
                    >
                      Support the anniversary fundraiser
                    </Link>
                  )}
                </div>
              )}
            </InView>
          )}

          {!loading && (
            <>
              <div className="events-tabs">
                <button
                  type="button"
                  className={tab === "upcoming" ? "active" : undefined}
                  onClick={() => setTab("upcoming")}
                >
                  Upcoming ({upcoming.length})
                </button>
                <button
                  type="button"
                  className={tab === "past" ? "active" : undefined}
                  onClick={() => setTab("past")}
                >
                  Past ({past.length})
                </button>
              </div>

              <div className="events-grid">
                {list.map((event, index) => {
                  const tiers = event.ticket_tiers ?? [];
                  const hasTiers = tiers.length > 0;
                  const minPrice = hasTiers
                    ? Math.min(...tiers.map((t) => t.price_kes))
                    : null;
                  const priceLabel = !hasTiers
                    ? "Tickets soon"
                    : event.is_free || minPrice === 0
                      ? "Free"
                      : `from ${formatKes(minPrice!)}`;
                  return (
                    <InView
                      key={event.id}
                      className="event-card"
                      as="article"
                      delay={index * 80}
                    >
                      <div className="event-card-media has-photo">
                        <img
                          src={event.cover_image_url || "/images/choir-main.jpg"}
                          alt=""
                        />
                      </div>
                      <div className="event-card-body">
                        <span className="event-date-pill">
                          {formatEventDate(event.starts_at)}
                        </span>
                        <h3>{event.title}</h3>
                        <p>{event.tagline}</p>
                        <p style={{ fontSize: "0.9rem" }}>
                          {event.venue}
                          {tab === "upcoming" && ` · ${priceLabel}`}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.65rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <Link
                            to={`/events/${event.slug}`}
                            className="btn btn-outline"
                          >
                            Details
                          </Link>
                          {tab === "upcoming" && hasTiers && (
                            <button
                              type="button"
                              className="btn btn-gold"
                              onClick={() => openCheckout(event)}
                            >
                              {event.is_free ? "Register" : "Buy tickets"}
                            </button>
                          )}
                        </div>
                      </div>
                    </InView>
                  );
                })}
              </div>

              {list.length === 0 && (
                <p style={{ color: "var(--mist-muted)", marginTop: "1rem" }}>
                  No {tab} events yet. Check back soon.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {checkout && (
        <TicketCheckout
          open
          onClose={() => setCheckout(null)}
          event={checkout.event}
          tier={checkout.tier}
        />
      )}
    </>
  );
}
