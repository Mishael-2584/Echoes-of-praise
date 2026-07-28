import { InView } from "../components/InView";

export function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">About</span>
            <h1 className="section-title">A choir formed for praise</h1>
            <p className="section-lead">
              Echoes of Praise is a gospel choir based in Nakuru, Kenya—committed
              to excellence in song, unity in fellowship, and ministry that leaves
              an afterglow of hope.
            </p>
          </InView>
        </div>
      </section>

      <section className="section">
        <div className="container about-story">
          <InView className="about-photo">
            <img src="/images/choir-main.jpg" alt="Echoes of Praise choir on stage" />
          </InView>
          <InView delay={100}>
            <h2 className="section-title" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
              Our story
            </h2>
            <p style={{ color: "var(--mist-muted)", marginTop: "1.15rem", fontWeight: 300 }}>
              Born from shared rehearsals and Sunday ministry, Echoes of Praise
              gathers singers who love gospel harmony—classic anthems,
              contemporary worship, and the rich choral tradition that lifts a
              congregation to its feet.
            </p>
            <p style={{ color: "var(--mist-muted)", marginTop: "1rem", fontWeight: 300 }}>
              From cathedral concerts to community nights, we prepare carefully,
              dress with dignity, and treat every invitation as a chance to serve.
              Our next chapter includes a professional sound system so the blend
              you hear in rehearsal is the blend the room receives.
            </p>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <InView className="about-panel">
            <blockquote>
              “We sing so that every hall in Nakuru—and every heart that listens—
              hears an echo of grace.”
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
                Every set list is prayerful. We sing for the One who first put the
                song in us—and for the people in the seats.
              </p>
            </InView>
            <InView className="value-item" delay={100}>
              <h3>Music</h3>
              <p>
                Parts are learned, dynamics are shaped, and blend is protected.
                Excellence is how we say thank you.
              </p>
            </InView>
            <InView className="value-item" delay={200}>
              <h3>Community</h3>
              <p>
                Nakuru is home. We partner with churches, schools, and civic
                spaces to bring praise where it is needed.
              </p>
            </InView>
          </div>
        </div>
      </section>
    </>
  );
}
