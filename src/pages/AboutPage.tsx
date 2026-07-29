import { InView } from "../components/InView";
import { choirProfile } from "../content/choir";

export function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">About</span>
            <h1 className="section-title">A ministry formed for praise</h1>
            <p className="section-lead">
              {choirProfile.affiliation} We exist to glorify God through sacred
              music, nurture spiritual growth among our members, and minister to
              communities through musical evangelism.
            </p>
          </InView>
        </div>
      </section>

      <section className="section">
        <div className="container about-story">
          <InView className="about-photo">
            <img
              src="/images/choir-main.jpg"
              alt="Echoes of Praise choir on stage"
            />
          </InView>
          <InView delay={100}>
            <span className="section-label">Who we are</span>
            <h2
              className="section-title"
              style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}
            >
              Nature of the ministry
            </h2>
            <p
              style={{
                color: "var(--mist-muted)",
                marginTop: "1.15rem",
                fontWeight: 300,
              }}
            >
              {choirProfile.nature}
            </p>
            <p
              style={{
                color: "var(--mist-muted)",
                marginTop: "1rem",
                fontWeight: 300,
              }}
            >
              {choirProfile.membershipNote}
            </p>
            <p
              style={{
                color: "var(--mist-muted)",
                marginTop: "1rem",
                fontWeight: 300,
              }}
            >
              {choirProfile.rehearsal}
            </p>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <InView>
            <span className="section-label">Purpose &amp; mission</span>
            <h2 className="section-title">Why we sing</h2>
            <p className="section-lead">
              The purpose of Echoes of Praise is shaped by Gospel ministry and
              musical excellence under Christ.
            </p>
          </InView>
          <div className="purpose-list">
            {choirProfile.purpose.map((item, i) => (
              <InView key={item} className="purpose-item" delay={i * 70}>
                <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </InView>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-faith">
        <div className="container about-faith-grid">
          <InView>
            <span className="section-label">Basis of faith</span>
            <h2 className="section-title">What we affirm</h2>
            <p className="section-lead">{choirProfile.faithSummary}</p>
          </InView>
          <InView delay={80} className="belief-list">
            <ul>
              {choirProfile.beliefs.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <InView className="about-panel">
            <blockquote>
              “We sing so that every hall—and every heart that listens—hears an
              echo of grace.”
            </blockquote>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <InView>
            <span className="section-label">What guides us</span>
            <h2 className="section-title">Ministry · Music · Community</h2>
          </InView>
          <div className="values">
            <InView className="value-item" delay={0}>
              <h3>Ministry</h3>
              <p>
                Concerts, church services, outreach, and evangelistic missions—
                music as a tool to proclaim hope and salvation.
              </p>
            </InView>
            <InView className="value-item" delay={100}>
              <h3>Music</h3>
              <p>
                Musical excellence with a Christ-centred approach: rehearsed
                parts, shaped dynamics, and blend that honours the message.
              </p>
            </InView>
            <InView className="value-item" delay={200}>
              <h3>Community</h3>
              <p>
                Nakuru is our home base, yet we welcome believers beyond the
                city—fellowship and spiritual growth alongside every note.
              </p>
            </InView>
          </div>
        </div>
      </section>
    </>
  );
}
