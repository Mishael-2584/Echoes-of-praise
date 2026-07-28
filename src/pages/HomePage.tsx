import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { InView } from "../components/InView";
import { ProgressBar } from "../components/ProgressBar";
import { StaffWave } from "../components/StaffWave";
import {
  fetchEvents,
  fetchFundraisers,
  formatEventDate,
  formatEventTime,
  isUpcoming,
} from "../lib/api";
import type { ChoirEvent, Fundraiser } from "../types";

const MARQUEE = [
  "Nakuru",
  "Gospel harmony",
  "Live concerts",
  "Tickets & giving",
  "Lift the Sound",
  "Praise & worship",
];

export function HomePage() {
  const [featured, setFeatured] = useState<ChoirEvent | null>(null);
  const [campaign, setCampaign] = useState<Fundraiser | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [events, funds] = await Promise.all([fetchEvents(), fetchFundraisers()]);
      if (!alive) return;
      const upcoming = events.filter(isUpcoming);
      setFeatured(
        upcoming.find((e) => e.featured) ?? upcoming[0] ?? events[0] ?? null,
      );
      setCampaign(
        funds.find((f) => f.kind === "campaign" && f.show_progress) ??
          funds.find((f) => f.kind === "campaign") ??
          null,
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden>
          <img
            className="hero-photo"
            src="/images/choir-main.jpg"
            alt=""
          />
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
        </div>
        <div className="hero-staff" aria-hidden>
          <StaffWave />
        </div>
        <div className="container hero-content">
          <img
            className="hero-brand reveal"
            src="/logo-full.png"
            alt="Echoes of Praise"
          />
          <p className="hero-kicker reveal reveal-delay-1">Nakuru · Kenya</p>
          <h1 className="reveal reveal-delay-2">
            Voices that <em>rise</em> from Nakuru
          </h1>
          <p className="hero-lead reveal reveal-delay-3">
            A gospel choir crafting concert nights of harmony—and building a sound
            system worthy of the praise we carry.
          </p>
          <div className="hero-actions reveal reveal-delay-4">
            <Link to="/events" className="btn btn-gold">
              Upcoming concerts
            </Link>
            <Link to="/give" className="btn btn-outline">
              Support the choir
            </Link>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden>
          <span>Scroll</span>
          <span className="hero-scroll-line" />
        </div>
      </section>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="section manifesto">
        <div className="container manifesto-grid">
          <InView>
            <span className="section-label">Who we are</span>
            <h2>Worship arranged for excellence—sung for something greater.</h2>
            <p>
              From cathedral evenings to open-air nights across the Rift Valley,
              Echoes of Praise rehearses with heart so every lyric points beyond
              the stage.
            </p>
          </InView>
          <InView delay={120}>
            <div className="manifesto-stat">
              <strong>Nakuru</strong>
              <span>Home base · Rift Valley</span>
            </div>
          </InView>
        </div>
      </section>

      {featured && (
        <section className="section featured-section">
          <div className="container-wide featured-event">
            <InView className="featured-visual has-photo" as="div">
              <img src={featured.cover_image_url || "/images/choir-main.jpg"} alt="" />
              <div className="featured-visual-frame" />
              <span className="featured-visual-tag">Next on stage</span>
            </InView>
            <InView className="featured-copy" delay={100}>
              <span className="section-label">Featured concert</span>
              <h2 className="section-title">{featured.title}</h2>
              <p className="section-lead">{featured.tagline}</p>
              <div className="featured-meta">
                <div className="featured-meta-row">
                  <strong>When</strong>
                  <span>
                    {formatEventDate(featured.starts_at)} ·{" "}
                    {formatEventTime(featured.starts_at)}
                  </span>
                </div>
                <div className="featured-meta-row">
                  <strong>Where</strong>
                  <span>
                    {featured.venue}, {featured.city}
                  </span>
                </div>
              </div>
              <Link to={`/events/${featured.slug}`} className="btn btn-gold">
                {featured.is_free ? "Register free" : "Get tickets"}
              </Link>
            </InView>
          </div>
        </section>
      )}

      {campaign && (
        <section className="section fundraiser-preview">
          <div className="container fundraiser-layout">
            <InView>
              <span className="section-label">Campaign</span>
              <h2 className="section-title">{campaign.title}</h2>
              <p className="section-lead">{campaign.subtitle}</p>
              <div style={{ marginTop: "1.75rem" }}>
                <Link to="/give" className="btn btn-green">
                  Give toward the goal
                </Link>
              </div>
            </InView>
            <InView className="fundraiser-panel" delay={120}>
              <ProgressBar fundraiser={campaign} compact />
            </InView>
          </div>
        </section>
      )}
    </>
  );
}
