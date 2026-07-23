import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProgressBar } from "../components/ProgressBar";
import { formatEventDate, loadEvents, loadFundraiser } from "../lib/api";
import type { ChoirEvent, Fundraiser } from "../types";

export function HomePage() {
  const [featured, setFeatured] = useState<ChoirEvent | null>(null);
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [events, fund] = await Promise.all([loadEvents(), loadFundraiser()]);
        if (!alive) return;
        setFeatured(events.find((e) => e.featured) ?? events[0] ?? null);
        setFundraiser(fund);
      } catch {
        /* keep empty states */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden />
        <div className="container hero-content">
          <img
            className="hero-brand reveal"
            src="/logo-full.png"
            alt="Echoes of Praise"
          />
          <h1 className="reveal reveal-delay-1">Voices that rise from Nakuru</h1>
          <p className="hero-lead reveal reveal-delay-2">
            Gospel harmony, concert nights, and a community building a sound
            system worthy of the praise we carry.
          </p>
          <div className="hero-actions reveal reveal-delay-3">
            <Link to="/events" className="btn btn-gold">
              Upcoming concerts
            </Link>
            <Link to="/give" className="btn btn-outline">
              Support the sound
            </Link>
          </div>
        </div>
        <span className="hero-scroll">Scroll</span>
      </section>

      <section className="home-strip">
        <article>
          <h3>Worship first</h3>
          <p>
            Arranged for excellence—rehearsed with heart—so every lyric points
            beyond the stage.
          </p>
        </article>
        <article>
          <h3>Live in Nakuru</h3>
          <p>
            Rooted in the Rift Valley, carrying praise into churches, halls, and
            open-air nights across Kenya.
          </p>
        </article>
        <article>
          <h3>Tickets & giving</h3>
          <p>
            Secure M-Pesa checkout for concerts and our Lift the Sound project—
            HTTPS end to end.
          </p>
        </article>
      </section>

      {featured && (
        <section className="section">
          <div className="container featured-event">
            <div className="featured-visual" role="img" aria-label={featured.title} />
            <div>
              <span className="section-label">Next on stage</span>
              <h2 className="section-title">{featured.title}</h2>
              <p className="section-lead">{featured.tagline}</p>
              <div className="featured-meta">
                <span>
                  <strong>When</strong> · {formatEventDate(featured.date)} ·{" "}
                  {featured.time}
                </span>
                <span>
                  <strong>Where</strong> · {featured.venue}
                </span>
              </div>
              <Link to={`/events/${featured.id}`} className="btn btn-gold">
                View tickets
              </Link>
            </div>
          </div>
        </section>
      )}

      {fundraiser && (
        <section className="section fundraiser-preview">
          <div className="container" style={{ display: "grid", gap: "1.5rem", maxWidth: 720 }}>
            <div>
              <span className="section-label">Project fundraiser</span>
              <h2 className="section-title">{fundraiser.title}</h2>
              <p className="section-lead">{fundraiser.subtitle}</p>
            </div>
            <ProgressBar fundraiser={fundraiser} compact />
            <div>
              <Link to="/give" className="btn btn-green">
                Give toward the goal
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
