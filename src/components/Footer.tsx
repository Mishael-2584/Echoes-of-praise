import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/logo-full.png" alt="Echoes of Praise" />
          <p>
            An independent Christian choir ministry affiliated with Crater SDA
            Church, Nakuru—spreading the Gospel through sacred music.
          </p>
        </div>
        <div className="footer-col">
          <h3>Explore</h3>
          <Link to="/about">About the choir</Link>
          <Link to="/members">Leadership & members</Link>
          <Link to="/events">Events & tickets</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/give">Give & campaigns</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h3>Visit & connect</h3>
          <p>Nakuru, Kenya</p>
          <a href="mailto:hello@echoesofpraize.com">hello@echoesofpraize.com</a>
          <a href="https://echoesofpraize.com">echoesofpraize.com</a>
          <p>Payments secured over HTTPS via M-Pesa</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Echoes of Praise</span>
        <span className="footer-credit">
          Developed by Mishael Gebre Worancha
        </span>
        <span className="secure-badge" title="TLS encryption on all pages">
          Secure HTTPS payments
        </span>
      </div>
    </footer>
  );
}
