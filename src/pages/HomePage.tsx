import { Link } from "react-router-dom";
import { InView } from "../components/InView";
import { Loader } from "../components/Loader";
import { TestimonialsSlider } from "../components/TestimonialsSlider";
import { ProgressBar } from "../components/ProgressBar";
import {
  choirProfile,
  highlightSong,
  oneConcert,
  testimonials,
} from "../content/choir";
import {
  fetchEvents,
  fetchFundraisers,
  formatEventDate,
  formatEventTime,
  isUpcoming,
} from "../lib/api";
import { useCachedResource } from "../lib/useCachedResource";
import type { ChoirEvent, Fundraiser } from "../types";

function pickFeatured(events: ChoirEvent[]): ChoirEvent | null {
  const upcoming = events.filter(isUpcoming);
  return (
    upcoming.find((e) => e.slug === oneConcert.slug) ??
    upcoming.find((e) => e.featured) ??
    upcoming[0] ??
    null
  );
}

function pickFunds(funds: Fundraiser[]) {
  const ann = funds.find((f) => f.slug === oneConcert.fundraiserSlug) ?? null;
  const campaign =
    ann ??
    funds.find((f) => f.kind === "campaign" && f.show_progress) ??
    funds.find((f) => f.kind === "campaign") ??
    null;
  return { ann, campaign };
}

export function HomePage() {
  const eventsQ = useCachedResource("events", fetchEvents);
  const fundsQ = useCachedResource("fundraisers", fetchFundraisers);

  const dbLoading = eventsQ.loading || fundsQ.loading;
  const featured = eventsQ.data ? pickFeatured(eventsQ.data) : null;
  const { ann: anniversaryFund, campaign } = fundsQ.data
    ? pickFunds(fundsQ.data)
    : { ann: null, campaign: null };

  const isOneConcert = featured?.slug === oneConcert.slug;
  const ticketsReady = (featured?.ticket_tiers?.length ?? 0) > 0;

  return (
    <>
      <section className="hero hero-epic">
        <div className="hero-media" aria-hidden>
          <img className="hero-photo" src="/images/choir-main.jpg" alt="" />
        </div>
        <div className="hero-veil" aria-hidden />
        <div className="container hero-content">
          <img
            className="hero-brand reveal"
            src="/logo-full.png"
            alt="Echoes of Praise"
          />
          <p className="hero-kicker reveal reveal-delay-1">
            {choirProfile.homeBase} · Crater SDA Church affiliation
          </p>
          <h1 className="reveal reveal-delay-2">
            Gospel through <em>music</em>
          </h1>
          <p className="hero-lead reveal reveal-delay-3">
            {choirProfile.tagline}. A Christ-centred choir ministry from Nakuru—
            sacred harmony for concerts, worship, and evangelism.
          </p>
          <div className="hero-actions reveal reveal-delay-4">
            <a href="#one-concert" className="btn btn-gold">
              ONE Concert · Nov 29
            </a>
            <a href="#listen" className="btn btn-outline">
              Hear our highlight
            </a>
          </div>
        </div>
      </section>

      <section className="section one-concert-section" id="one-concert">
        <div className="container">
          <InView className="one-concert-intro">
            <span className="section-label">Upcoming · Featured</span>
            <p className="one-concert-badge">{oneConcert.anniversary}</p>
            <h2 className="section-title">
              {isOneConcert ? featured!.title : oneConcert.title}
            </h2>
            <p className="one-theme">
              Theme: <em>{oneConcert.theme}</em>
            </p>
            <p className="section-lead">
              {isOneConcert
                ? featured!.description
                : "Celebrate one year of ministry with Praise Amplified—guest ministries from Uganda and Kenya, live at Crater SDA Church."}
            </p>
          </InView>

          <div className="one-poster-grid">
            {oneConcert.guests.map((guest, i) => (
              <InView key={guest.name} className="one-poster" delay={i * 100}>
                <img
                  src={guest.image}
                  alt={`${oneConcert.title} — ${guest.name}`}
                />
                <div className="one-poster-caption">
                  <span>Featuring</span>
                  <strong>{guest.name}</strong>
                  <em>{guest.place}</em>
                </div>
              </InView>
            ))}
          </div>

          <InView className="one-concert-details" delay={80}>
            <div className="one-detail">
              <strong>When</strong>
              <span>
                {isOneConcert
                  ? `${formatEventDate(featured!.starts_at)} · ${formatEventTime(featured!.starts_at)}`
                  : `${oneConcert.dateLabel} · ${oneConcert.timeLabel}`}
              </span>
            </div>
            <div className="one-detail">
              <strong>Where</strong>
              <span>
                {isOneConcert
                  ? `${featured!.venue}, ${featured!.city}`
                  : oneConcert.venue}
              </span>
            </div>
            <div className="one-detail">
              <strong>Tickets</strong>
              <span>{oneConcert.ticketsNote}</span>
            </div>
          </InView>

          <div className="one-fund-strip" aria-busy={dbLoading}>
            {dbLoading ? (
              <Loader compact label="Loading fundraiser…" />
            ) : anniversaryFund ? (
              <>
                <div>
                  <span className="section-label">Anniversary fundraiser</span>
                  <h3>{anniversaryFund.title}</h3>
                  <p>{anniversaryFund.subtitle}</p>
                  <ProgressBar fundraiser={anniversaryFund} compact />
                </div>
                <div className="one-fund-actions">
                  <Link to="/give" className="btn btn-gold">
                    Support the concert
                  </Link>
                  <Link
                    to={featured ? `/events/${featured.slug}` : "/events"}
                    className="btn btn-outline"
                  >
                    {ticketsReady ? "Get tickets" : "Event details"}
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <span className="section-label">Anniversary fundraiser</span>
                <h3>ONE Concert Anniversary Fund</h3>
                <p>Support Praise Amplified — ticketing coming soon.</p>
                <Link to="/give" className="btn btn-gold">
                  Go to Give
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section mission-epic">
        <div className="container mission-epic-grid">
          <InView>
            <span className="section-label">Our calling</span>
            <h2 className="section-title">
              Glorify God. Spread the Gospel. Grow together.
            </h2>
            <p className="section-lead">{choirProfile.nature}</p>
          </InView>
          <InView delay={100} className="mission-pillars">
            {choirProfile.purpose.slice(0, 3).map((item) => (
              <p key={item}>{item}</p>
            ))}
            <Link to="/about" className="text-link">
              Read our full story →
            </Link>
          </InView>
        </div>
      </section>

      <section className="section listen-section" id="listen">
        <div className="container listen-layout">
          <InView className="listen-copy">
            <span className="section-label">Highlight song</span>
            <h2 className="section-title">{highlightSong.title}</h2>
            <p className="section-lead">{highlightSong.blurb}</p>
            <dl className="credit-list">
              <div>
                <dt>Words</dt>
                <dd>{highlightSong.wordsBy}</dd>
              </div>
              <div>
                <dt>Music</dt>
                <dd>{highlightSong.musicBy}</dd>
              </div>
              <div>
                <dt>Arrangement</dt>
                <dd>
                  Arranged by {highlightSong.arrangedBy}; adapted by{" "}
                  {highlightSong.adaptedBy}
                </dd>
              </div>
              <div>
                <dt>Dedication</dt>
                <dd>{highlightSong.dedication}</dd>
              </div>
              <div>
                <dt>Voicing</dt>
                <dd>
                  {highlightSong.voicing} · {highlightSong.duration}
                </dd>
              </div>
            </dl>
            <a
              className="btn btn-outline"
              href={highlightSong.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on YouTube
            </a>
          </InView>
          <InView delay={120} className="video-frame">
            <iframe
              title={`${highlightSong.title} — Echoes of Praise`}
              src={`https://www.youtube.com/embed/${highlightSong.youtubeId}?rel=0&modestbranding=1`}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </InView>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="container">
          <InView>
            <span className="section-label">From the field</span>
            <h2 className="section-title">Words of appreciation</h2>
          </InView>
          <InView delay={80}>
            <TestimonialsSlider items={testimonials} />
          </InView>
        </div>
      </section>

      <section className="section home-split-cta">
        <div className="container home-split-grid">
          <InView className="home-split-card">
            <span className="section-label">The choir</span>
            <h2>Meet leadership &amp; members</h2>
            <p>
              Conductors, instrumentalists, and the full roster—arranged for easy
              browsing.
            </p>
            <Link to="/members" className="btn btn-gold">
              View members
            </Link>
          </InView>
          <div className="home-split-card home-split-give" aria-busy={dbLoading}>
            {dbLoading ? (
              <Loader compact label="Loading campaign…" />
            ) : campaign ? (
              <>
                <span className="section-label">Campaign</span>
                <h2>{campaign.title}</h2>
                <p>{campaign.subtitle}</p>
                <ProgressBar fundraiser={campaign} compact />
                <Link
                  to="/give"
                  className="btn btn-outline"
                  style={{ marginTop: "1rem" }}
                >
                  Give with M-Pesa
                </Link>
              </>
            ) : (
              <>
                <span className="section-label">Give</span>
                <h2>Support the ministry</h2>
                <p>Open giving for concerts, outreach, and the sound of praise.</p>
                <Link to="/give" className="btn btn-outline">
                  Go to Give
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
