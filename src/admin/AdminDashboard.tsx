import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminListEvents,
  adminListFundraisers,
  adminListGallery,
  adminListOrders,
} from "../lib/adminApi";
import { formatKes, isUpcoming } from "../lib/api";
import type { ChoirEvent, Fundraiser, GalleryItem, TicketOrder } from "../types";
import { useAdminAuth } from "../lib/adminAuth";

export function AdminDashboard() {
  const { demoMode } = useAdminAuth();
  const [events, setEvents] = useState<ChoirEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [funds, setFunds] = useState<Fundraiser[]>([]);
  const [orders, setOrders] = useState<TicketOrder[]>([]);

  useEffect(() => {
    void Promise.all([
      adminListEvents(),
      adminListGallery(),
      adminListFundraisers(),
      adminListOrders(),
    ]).then(([e, g, f, o]) => {
      setEvents(e);
      setGallery(g);
      setFunds(f);
      setOrders(o);
    });
  }, []);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status === "confirmed" || o.status === "pending")
      .reduce((sum, o) => sum + (o.amount_kes || 0), 0);
    const cities = new Map<string, number>();
    orders.forEach((o) => {
      const city = o.buyer_city || "Unknown";
      cities.set(city, (cities.get(city) || 0) + 1);
    });
    const topCities = [...cities.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return {
      upcoming: events.filter(isUpcoming).length,
      gallery: gallery.length,
      funds: funds.filter((f) => f.active).length,
      orders: orders.length,
      revenue,
      topCities,
    };
  }, [events, gallery, funds, orders]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Overview</h1>
          <p>
            {demoMode
              ? "Running locally without Supabase — connect keys in .env for production."
              : "Live data from Supabase."}
          </p>
        </div>
      </header>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <span>Upcoming events</span>
          <strong>{stats.upcoming}</strong>
        </div>
        <div className="admin-stat">
          <span>Gallery photos</span>
          <strong>{stats.gallery}</strong>
        </div>
        <div className="admin-stat">
          <span>Active fundraisers</span>
          <strong>{stats.funds}</strong>
        </div>
        <div className="admin-stat">
          <span>Ticket orders</span>
          <strong>{stats.orders}</strong>
        </div>
        <div className="admin-stat">
          <span>Ticket value</span>
          <strong>{formatKes(stats.revenue)}</strong>
        </div>
      </div>

      <div className="admin-two-col">
        <section className="admin-panel">
          <h2>Audience cities</h2>
          {stats.topCities.length === 0 ? (
            <p className="admin-muted">No ticket analytics yet.</p>
          ) : (
            <ul className="admin-list">
              {stats.topCities.map(([city, count]) => (
                <li key={city}>
                  <span>{city}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="admin-panel">
          <h2>Quick links</h2>
          <div className="admin-quick">
            <Link to="/admin/events">Manage events & tiers</Link>
            <Link to="/admin/members">Choir roster</Link>
            <Link to="/admin/gallery">Upload gallery</Link>
            <Link to="/admin/fundraisers">Campaigns & support</Link>
            <Link to="/admin/tickets">Ticket orders</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
