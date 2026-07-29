import { InView } from "../components/InView";

export function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">Contact</span>
            <h1 className="section-title">Bookings & enquiries</h1>
            <p className="section-lead">
              Invite Echoes of Praise to your church, school, or civic event—or
              reach us about tickets, partnerships, and the sound system project.
            </p>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="container contact-grid">
          <InView>
            <div className="contact-card">
              <h3>Email</h3>
              <a href="mailto:hello@echoesofpraize.com">hello@echoesofpraize.com</a>
              <p>General enquiries, bookings, and partnerships</p>
            </div>
            <div className="contact-card">
              <h3>Website</h3>
              <a href="https://echoesofpraize.com">echoesofpraize.com</a>
            </div>
            <div className="contact-card">
              <h3>Home base</h3>
              <p>Nakuru, Kenya</p>
            </div>
          </InView>
          <InView className="about-panel" delay={100}>
            <blockquote>
              Ready to host a night of praise? Tell us the date, venue capacity,
              and the story you want the music to serve.
            </blockquote>
          </InView>
        </div>
      </section>
    </>
  );
}
