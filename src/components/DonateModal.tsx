import { useEffect, useId, useState, type FormEvent } from "react";
import type { Fundraiser } from "../types";
import { createDonation, formatKes } from "../lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  fundraiser: Fundraiser;
};

const presets = [500, 1000, 2500, 5000];

export function DonateModal({ open, onClose, fundraiser }: Props) {
  const titleId = useId();
  const [amount, setAmount] = useState(1000);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [form, setForm] = useState({
    donor_name: "",
    donor_email: "",
    donor_phone: "",
    donor_city: "",
    donor_county: "Nakuru",
    message: "",
  });

  useEffect(() => {
    if (open) setStatus(null);
  }, [open]);

  if (!open) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const result = await createDonation({
        fundraiser_id: fundraiser.id,
        amount_kes: amount,
        ...form,
      });
      setStatus({ ok: true, message: result.message });
    } catch (err) {
      setStatus({
        ok: false,
        message: err instanceof Error ? err.message : "Donation failed",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <div>
            <p className="section-label" style={{ marginBottom: "0.35rem" }}>
              Give
            </p>
            <h3 id={titleId}>{fundraiser.title}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form onSubmit={onSubmit}>
          <div className="preset-amounts">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                className={amount === p ? "active" : undefined}
                onClick={() => setAmount(p)}
              >
                {formatKes(p)}
              </button>
            ))}
          </div>
          <div className="form-field">
            <label htmlFor="amount">Amount (KES)</label>
            <input
              id="amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="donor_name">Full name</label>
            <input
              id="donor_name"
              required
              value={form.donor_name}
              onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="donor_phone">M-Pesa phone</label>
            <input
              id="donor_phone"
              required
              value={form.donor_phone}
              onChange={(e) => setForm({ ...form, donor_phone: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="donor_city">City / town</label>
            <input
              id="donor_city"
              value={form.donor_city}
              onChange={(e) => setForm({ ...form, donor_city: e.target.value })}
            />
          </div>
          <div className="payment-note">
            <span>
              Gifts settle via secure HTTPS M-Pesa into the choir account. Thank you for
              lifting Echoes of Praise.
            </span>
          </div>
          <button type="submit" className="btn btn-gold" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Sending…" : `Give ${formatKes(amount)}`}
          </button>
          {status && (
            <p className={`status-msg ${status.ok ? "ok" : "err"}`}>{status.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
