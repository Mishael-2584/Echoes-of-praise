import { useEffect, useMemo, useState } from "react";
import { adminListOrders } from "../lib/adminApi";
import { formatKes } from "../lib/api";
import type { TicketOrder } from "../types";

export function AdminTickets() {
  const [orders, setOrders] = useState<TicketOrder[]>([]);

  useEffect(() => {
    void adminListOrders().then(setOrders);
  }, []);

  const byCity = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const key = o.buyer_city || "Unknown";
      map.set(key, (map.get(key) || 0) + o.quantity);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const byHeard = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const key = o.heard_about || "Unspecified";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [orders]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Tickets & analytics</h1>
          <p>
            Orders from free registrations and paid M-Pesa checkouts, with city and
            attribution data for later analysis.
          </p>
        </div>
      </header>

      <div className="admin-two-col">
        <section className="admin-panel">
          <h2>Where attendees are from</h2>
          <ul className="admin-list">
            {byCity.map(([city, count]) => (
              <li key={city}>
                <span>{city}</span>
                <strong>{count}</strong>
              </li>
            ))}
            {byCity.length === 0 && <li className="admin-muted">No data yet</li>}
          </ul>
        </section>
        <section className="admin-panel">
          <h2>How they heard about us</h2>
          <ul className="admin-list">
            {byHeard.map(([src, count]) => (
              <li key={src}>
                <span>{src}</span>
                <strong>{count}</strong>
              </li>
            ))}
            {byHeard.length === 0 && <li className="admin-muted">No data yet</li>}
          </ul>
        </section>
      </div>

      <div className="admin-table-wrap" style={{ marginTop: "1.5rem" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Buyer</th>
              <th>Location</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <code>{o.confirmation_code}</code>
                </td>
                <td>
                  <strong>{o.buyer_name}</strong>
                  <div className="admin-muted">
                    {o.buyer_email} · {o.buyer_phone}
                  </div>
                </td>
                <td>
                  {[o.buyer_city, o.buyer_county, o.buyer_country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </td>
                <td>
                  {o.amount_kes === 0 ? "Free" : formatKes(o.amount_kes)} ×{o.quantity}
                </td>
                <td>{o.status}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-muted">
                  No ticket orders yet. Register or buy a ticket on the public site.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
