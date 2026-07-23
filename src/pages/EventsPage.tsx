import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PaymentModal } from "../components/PaymentModal";
import {
  formatEventDate,
  formatKes,
  loadEvents,
} from "../lib/api";
import type { ChoirEvent, TicketTier } from "../types";

export function EventsPage() {
  const { eventId } = useParams();
  const [events, setEvents] = useState<ChoirEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<Record<string, string>>({});
  const [checkout, setCheckout] = useState<{
    event: ChoirEvent;
    tier: TicketTier;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    loadEvents()
      .then((data) => {
        if (!alive) return;
        setEvents(data);
        const defaults: Record<string, string> = {};
        data.forEach((e) => {
          if (e.ticketTiers[0]) defaults[e.id] = e.ticketTiers[0].id;
        });
        setSelectedTier(defaults);
      })
      .catch(() => {
        if (alive) setError("Unable to load concert listings.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const focused = useMemo(
    () => events.find((e) => e.id === eventId) ?? null,
    [events, eventId],
  );

  function openCheckout(event: ChoirEvent) {
    if (event.externalTicketUrl) {
      window.open(event.externalTicketUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const tierId = selectedTier[event.id] ?? event.ticketTiers[0]?.id;
    const tier = event.ticketTiers.find((t) => t.id === tierId);
    if (!tier) return;
    setCheckout({ event, tier });
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label">Events</span>
          <h1 className="section-title">Concerts & tickets</h1>
          <p className="section-lead">
            Browse upcoming Echoes of Praise concerts, choose your seat tier, and
            pay securely with M-Pesa—or follow a direct ticket link when we
            partner with platforms like Zenlipa or Mookh.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1rem" }}>
        <div className="container">
          {error && <p className="status-msg err">{error}</p>}

          {focused && (
            <article className="ticket-panel" style={{ marginBottom: "2.5rem" }}>
              <span className="event-date-pill">
                {formatEventDate(focused.date)} · {focused.time}
              </span>
              <h2 className="section-title" style={{ marginTop: "0.75rem" }}>
                {focused.title}
              </h2>
              <p className="section-lead">{focused.description}</p>
              <div className="featured-meta">
                <span>
                  <strong>Venue</strong> · {focused.venue}, {focused.city}
                </span>
              </div>

              {focused.externalTicketUrl ? (
                <a
                  className="btn btn-gold"
                  href={focused.externalTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy tickets on partner site
                </a>
              ) : (
                <>
                  <div className="ticket-tiers">
                    {focused.ticketTiers.map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        className={`ticket-tier ${
                          selectedTier[focused.id] === tier.id ? "selected" : ""
                        }`}
                        onClick={() =>
                          setSelectedTier((s) => ({ ...s, [focused.id]: tier.id }))
                        }
                      >
                        <h4>{tier.name}</h4>
                        <div className="ticket-price">{formatKes(tier.priceKes)}</div>
                        <ul>
                          {tier.perks.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: "1.25rem" }}>
                    <button
                      type="button"
                      className="btn btn-gold"
                      onClick={() => openCheckout(focused)}
                    >
                      Purchase with M-Pesa
                    </button>
                  </div>
                </>
              )}
            </article>
          )}

          <div className="events-grid">
            {events.map((event) => (
              <article key={event.id} className="event-card">
                <div className="event-card-media" />
                <div className="event-card-body">
                  <span className="event-date-pill">
                    {formatEventDate(event.date)}
                  </span>
                  <h3>{event.title}</h3>
                  <p>{event.tagline}</p>
                  <p style={{ fontSize: "0.9rem" }}>
                    {event.venue} · from{" "}
                    {formatKes(
                      Math.min(...event.ticketTiers.map((t) => t.priceKes)),
                    )}
                  </p>
                  <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                    <Link to={`/events/${event.id}`} className="btn btn-outline">
                      Concert details
                    </Link>
                    <button
                      type="button"
                      className="btn btn-gold"
                      onClick={() => openCheckout(event)}
                    >
                      {event.externalTicketUrl ? "Ticket link" : "Buy tickets"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {checkout && (
        <PaymentModal
          open
          onClose={() => setCheckout(null)}
          kind="ticket"
          title={`${checkout.event.title} · ${checkout.tier.name}`}
          amount={checkout.tier.priceKes}
          reference={`TIX-${checkout.event.id}-${checkout.tier.id}`.toUpperCase()}
          description={`Ticket: ${checkout.event.title} (${checkout.tier.name})`}
        />
      )}
    </>
  );
}
