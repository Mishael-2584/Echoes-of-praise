import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/members", label: "Members" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/give", label: "Give" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled || open ? "is-scrolled" : ""}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/logo-nav.png" alt="Echoes of Praise" className="brand-mark" />
          <span className="brand-text">
            <span className="brand-name">Echoes of Praise</span>
            <span className="brand-place">Nakuru · Kenya</span>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/give" className="btn btn-gold nav-cta">
          Donate
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
        </button>
      </div>

      <nav
        className={`container nav-mobile ${open ? "open" : ""}`}
        aria-label="Mobile"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? "active" : undefined)}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <Link
          to="/give"
          className="btn btn-gold"
          style={{ marginTop: "0.75rem" }}
          onClick={() => setOpen(false)}
        >
          Donate
        </Link>
      </nav>
    </header>
  );
}
