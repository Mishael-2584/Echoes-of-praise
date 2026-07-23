export function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label">Contact</span>
          <h1 className="section-title">Bookings & enquiries</h1>
          <p className="section-lead">
            Invite Echoes of Praise to your church, school, or civic event—or
            reach us about tickets, partnerships, and the sound system project.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1rem" }}>
        <div className="container contact-grid">
          <div>
            <div className="contact-card">
              <h3>General</h3>
              <a href="mailto:hello@echoesofpraise.ke">hello@echoesofpraise.ke</a>
            </div>
            <div className="contact-card">
              <h3>Bookings</h3>
              <a href="mailto:bookings@echoesofpraise.ke">bookings@echoesofpraise.ke</a>
              <p>Concerts, church services, and special events</p>
            </div>
            <div className="contact-card">
              <h3>Home base</h3>
              <p>Nakuru, Kenya</p>
            </div>
          </div>
          <div className="about-panel">
            <blockquote>
              Ready to host a night of praise? Tell us the date, venue capacity,
              and the story you want the music to serve.
            </blockquote>
            <p style={{ marginTop: "1.25rem", color: "var(--mist-muted)" }}>
              For ticket support or donation receipts, include your M-Pesa
              confirmation code in the email subject line.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
