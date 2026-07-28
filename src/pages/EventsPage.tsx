import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { InView } from "../components/InView";
import { TicketCheckout } from "../components/TicketCheckout";
import {
  fetchEvents,
  formatEventDate,
  formatEventTime,
  formatKes,
  isUpcoming,
} from "../lib/api";
import type { ChoirEvent, TicketTier } from "../types";

export function EventsPage() {
  const { eventId } = useParams();
  const [events, setEvents] = useState<ChoirEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [checkout, setCheckout] = useState<{
    event: ChoirEvent;
    tier: TicketTier;
  } | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    let alive = true;
    fetchEvents()
      .then((data) => {
        if (!alive) return;
        setEvents(data);
        const defaults: Record<string, string> = {};
        data.forEach((e) => {
          if (e.ticket_tiers?.[0]) defaults[e.id] = e.ticket_tiers[0].id;
        });
        setSelectedTiers(defaults);
      })
      .catch(() => {
        if (alive) setError("Unable to load concert listings.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const focused = useMemo(
    () => events.find((e) => e.slug === eventId || e.id === eventId) ?? null,
    [events, eventId],
  );

  const upcoming = events.filter(isUpcoming);
  const past = events.filter((e) => !isUpcoming(e)).reverse();
  const list = tab === "upcoming" ? upcoming : past;

  function openCheckout(event: ChoirEvent) {
    if (event.external_ticket_url) {
      window.open(event.external_ticket_url, "_blank", "noopener,noreferrer");
      return;
    }
    const tiers = event.ticket_tiers ?? [];
    const tierId = selectedTiers[event.id] ?? tiers[0]?.id;
    const tier = tiers.find((t) => t.id === tierId);
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

          {focused && (
            <InView className="ticket-panel" as="article">
              <div className="ticket-panel-media">
                <img
                  src={focused.cover_image_url || "/images/choir-main.jpg"}
                  alt=""
                />
              </div>
              <span className="event-date-pill">
                {formatEventDate(focused.starts_at)} · {formatEventTime(focused.starts_at)}
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
                  <span>{focused.is_free ? "Free registration" : "Paid tickets"}</span>
                </div>
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
                          setSelectedTiers((s) => ({ ...s, [focused.id]: tier.id }))
                        }
                      >
                        <h4>{tier.name}</h4>
                        <div className="ticket-price">
                          {tier.price_kes === 0 ? "Free" : formatKes(tier.price_kes)}
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
                <p style={{ color: "var(--mist-muted)" }}>
                  Tickets for this event are closed or not required.
                </p>
              )}
            </InView>
          )}

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
              const minPrice = Math.min(
                ...(event.ticket_tiers?.map((t) => t.price_kes) ?? [0]),
              );
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
                      {tab === "upcoming" &&
                        ` · ${
                          event.is_free || minPrice === 0
                            ? "Free"
                            : `from ${formatKes(minPrice)}`
                        }`}
                    </p>
                    <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                      <Link to={`/events/${event.slug}`} className="btn btn-outline">
                        Details
                      </Link>
                      {tab === "upcoming" && (event.ticket_tiers?.length ?? 0) > 0 && (
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
