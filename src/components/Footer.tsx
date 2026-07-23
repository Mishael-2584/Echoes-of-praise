import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/logo-full.png" alt="Echoes of Praise" />
          <p>
            A gospel choir from Nakuru, Kenya—lifting voices in worship, harmony,
            and praise across the Rift Valley and beyond.
          </p>
        </div>
        <div className="footer-col">
          <h3>Explore</h3>
          <Link to="/about">About the choir</Link>
          <Link to="/events">Events & tickets</Link>
          <Link to="/give">Lift the Sound</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h3>Visit & connect</h3>
          <p>Nakuru, Kenya</p>
          <a href="mailto:hello@echoesofpraise.ke">hello@echoesofpraise.ke</a>
          <p>Payments secured over HTTPS via M-Pesa</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Echoes of Praise</span>
        <span className="secure-badge" title="TLS encryption on all pages">
          Secure HTTPS payments
        </span>
      </div>
    </footer>
  );
}
