import { useEffect, useId, useState, type FormEvent } from "react";
import { initiateMpesaPayment, normalizeKenyaPhone, formatKes } from "../lib/api";
import type { PaymentKind } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  kind: PaymentKind;
  title: string;
  amount: number;
  reference: string;
  description: string;
  allowCustomAmount?: boolean;
};

const donationPresets = [500, 1000, 2500, 5000];

export function PaymentModal({
  open,
  onClose,
  kind,
  title,
  amount: initialAmount,
  reference,
  description,
  allowCustomAmount = false,
}: Props) {
  const titleId = useId();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(initialAmount);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  useEffect(() => {
    if (open) {
      setAmount(initialAmount);
      setStatus(null);
    }
  }, [open, initialAmount]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    const normalized = normalizeKenyaPhone(phone);
    if (!normalized) {
      setStatus({
        ok: false,
        message: "Enter a valid Safaricom number (e.g. 07XX XXX XXX).",
      });
      return;
    }
    if (!amount || amount < 1) {
      setStatus({ ok: false, message: "Enter a valid amount in KES." });
      return;
    }

    setBusy(true);
    const result = await initiateMpesaPayment({
      phone: normalized,
      amount: Math.round(amount),
      kind,
      reference,
      description: name ? `${description} · ${name}` : description,
    });
    setBusy(false);
    setStatus({ ok: result.ok, message: result.message });
  }

  const paybill = import.meta.env.VITE_MPESA_PAYBILL as string | undefined;
  const till = import.meta.env.VITE_MPESA_TILL as string | undefined;
  const account = (import.meta.env.VITE_MPESA_ACCOUNT as string) || "ECHOES";

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <div>
            <p className="section-label" style={{ marginBottom: "0.35rem" }}>
              Lipa na M-Pesa
            </p>
            <h3 id={titleId}>{title}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form onSubmit={onSubmit}>
          {allowCustomAmount && (
            <>
              <div className="preset-amounts">
                {donationPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={amount === preset ? "active" : undefined}
                    onClick={() => setAmount(preset)}
                  >
                    {formatKes(preset)}
                  </button>
                ))}
              </div>
              <div className="form-field">
                <label htmlFor="amount">Amount (KES)</label>
                <input
                  id="amount"
                  type="number"
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>
            </>
          )}

          {!allowCustomAmount && (
            <p style={{ marginBottom: "1rem", color: "var(--gold)" }}>
              Total: <strong>{formatKes(amount)}</strong>
            </p>
          )}

          <div className="form-field">
            <label htmlFor="payer-name">Full name</label>
            <input
              id="payer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="As it should appear on your receipt"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">M-Pesa phone number</label>
            <input
              id="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="payment-note">
            <span>
              Payments run over HTTPS through our secure gateway. Funds settle to
              Echoes of Praise via Safaricom M-Pesa (Daraja STK Push). You will
              confirm the PIN on your phone.
            </span>
          </div>

          <button type="submit" className="btn btn-gold" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Sending prompt…" : `Pay ${formatKes(amount)} with M-Pesa`}
          </button>

          {(paybill || till) && (
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--mist-muted)" }}>
              Manual fallback:{" "}
              {paybill
                ? `Paybill ${paybill}, Account ${account}`
                : `Till ${till}`}
              . Use reference <strong>{reference}</strong>.
            </p>
          )}

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
