import { useEffect, useState } from "react";
import { PaymentModal } from "../components/PaymentModal";
import { ProgressBar } from "../components/ProgressBar";
import { loadFundraiser } from "../lib/api";
import type { Fundraiser } from "../types";

export function GivePage() {
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      loadFundraiser()
        .then((data) => {
          if (alive) setFundraiser(data);
        })
        .catch(() => {
          if (alive) setError("Unable to load fundraiser progress.");
        });

    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label">Give</span>
          <h1 className="section-title">Lift the Sound</h1>
          <p className="section-lead">
            A project-based fundraiser for a professional sound system—mixer,
            mics, mains, and monitors—so every Echoes of Praise concert is heard
            clearly.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1rem" }}>
        <div className="container-narrow">
          {error && <p className="status-msg err">{error}</p>}
          {fundraiser && (
            <>
              <p style={{ color: "var(--mist-muted)", marginBottom: "1.5rem" }}>
                {fundraiser.story}
              </p>
              <ProgressBar fundraiser={fundraiser} />
              <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button type="button" className="btn btn-gold" onClick={() => setOpen(true)}>
                  Donate with M-Pesa
                </button>
                <a className="btn btn-outline" href="mailto:hello@echoesofpraise.ke?subject=Sound%20system%20pledge">
                  Pledge by email
                </a>
              </div>
              <div className="payment-note" style={{ marginTop: "1.75rem" }}>
                <span>
                  Donations and ticket proceeds are routed through our secure
                  M-Pesa gateway into the choir&apos;s designated bank / paybill
                  settlement account. All connections use HTTPS and industry-standard
                  TLS.
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {fundraiser && (
        <PaymentModal
          open={open}
          onClose={() => setOpen(false)}
          kind="donation"
          title={fundraiser.title}
          amount={1000}
          reference={`GIVE-${fundraiser.id}`.toUpperCase()}
          description={`Donation: ${fundraiser.title}`}
          allowCustomAmount
        />
      )}
    </>
  );
}
