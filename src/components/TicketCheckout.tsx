import { useEffect, useId, useState, type FormEvent } from "react";
import type { ChoirEvent, TicketTier } from "../types";
import { createTicketOrder, formatKes } from "../lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  event: ChoirEvent;
  tier: TicketTier;
};

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];
const HEARD_ABOUT = [
  "Church / fellowship",
  "Friend or family",
  "Social media",
  "Poster / flyer",
  "Radio",
  "Other",
];

export function TicketCheckout({ open, onClose, event, tier }: Props) {
  const titleId = useId();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    buyer_city: "",
    buyer_county: "Nakuru",
    buyer_country: "Kenya",
    age_range: "",
    heard_about: "",
  });

  useEffect(() => {
    if (open) {
      setStatus(null);
      setQuantity(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const total = tier.price_kes * quantity;
  const isFree = total === 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const result = await createTicketOrder(
        {
          event_id: event.id,
          tier_id: tier.id,
          quantity,
          ...form,
        },
        tier,
      );
      setStatus({
        ok: true,
        message: `${result.paymentMessage} Confirmation: ${result.order.confirmation_code}`,
      });
    } catch (err) {
      setStatus({
        ok: false,
        message: err instanceof Error ? err.message : "Checkout failed",
      });
    } finally {
      setBusy(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <div>
            <p className="section-label" style={{ marginBottom: "0.35rem" }}>
              {isFree ? "Free registration" : "Secure checkout"}
            </p>
            <h3 id={titleId}>
              {event.title} · {tier.name}
            </h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form onSubmit={onSubmit}>
          <div className="checkout-summary">
            <span>
              {quantity} × {tier.name}
            </span>
            <strong>{isFree ? "Free" : formatKes(total)}</strong>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="qty">Quantity</label>
              <input
                id="qty"
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="buyer_name">Full name</label>
              <input
                id="buyer_name"
                required
                value={form.buyer_name}
                onChange={(e) => set("buyer_name", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="buyer_email">Email</label>
              <input
                id="buyer_email"
                type="email"
                required
                value={form.buyer_email}
                onChange={(e) => set("buyer_email", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="buyer_phone">M-Pesa / phone</label>
              <input
                id="buyer_phone"
                required
                inputMode="tel"
                placeholder="07XX XXX XXX"
                value={form.buyer_phone}
                onChange={(e) => set("buyer_phone", e.target.value)}
              />
            </div>
          </div>

          <p className="checkout-analytics-label">Help us serve Nakuru better</p>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="buyer_city">City / town</label>
              <input
                id="buyer_city"
                value={form.buyer_city}
                onChange={(e) => set("buyer_city", e.target.value)}
                placeholder="e.g. Nakuru"
              />
            </div>
            <div className="form-field">
              <label htmlFor="buyer_county">County</label>
              <input
                id="buyer_county"
                value={form.buyer_county}
                onChange={(e) => set("buyer_county", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="age_range">Age range</label>
              <select
                id="age_range"
                value={form.age_range}
                onChange={(e) => set("age_range", e.target.value)}
              >
                <option value="">Prefer not to say</option>
                {AGE_RANGES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="heard_about">How did you hear about us?</label>
              <select
                id="heard_about"
                value={form.heard_about}
                onChange={(e) => set("heard_about", e.target.value)}
              >
                <option value="">Select</option>
                {HEARD_ABOUT.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="payment-note">
            <span>
              {isFree
                ? "Your registration is stored securely for seating and ministry planning. No payment required."
                : "Paid tickets use HTTPS M-Pesa STK Push. Attendee details help us understand where our audience comes from."}
            </span>
          </div>

          <button type="submit" className="btn btn-gold" style={{ width: "100%" }} disabled={busy}>
            {busy
              ? "Processing…"
              : isFree
                ? "Register for free"
                : `Pay ${formatKes(total)} with M-Pesa`}
          </button>

          {status && (
            <p className={`status-msg ${status.ok ? "ok" : "err"}`} role="status">
              {status.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
