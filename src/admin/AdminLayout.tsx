import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../lib/adminAuth";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/fundraisers", label: "Fundraisers" },
  { to: "/admin/tickets", label: "Tickets" },
];

export function AdminLayout() {
  const { user, loading, demoMode, signOut } = useAdminAuth();

  if (loading) {
    return <div className="admin-shell admin-loading">Loading…</div>;
  }
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-aside">
        <div className="admin-brand">
          <img src="/logo-mark-green.png" alt="" />
          <div>
            <strong>EoP Admin</strong>
            <span>{demoMode ? "Demo mode" : "Live"}</span>
          </div>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-aside-foot">
          <p>{user.email}</p>
          <button type="button" onClick={() => void signOut()}>
            Sign out
          </button>
          <Link to="/">View site</Link>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
