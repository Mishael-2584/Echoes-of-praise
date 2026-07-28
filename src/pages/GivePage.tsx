import { useEffect, useState } from "react";
import { DonateModal } from "../components/DonateModal";
import { InView } from "../components/InView";
import { ProgressBar } from "../components/ProgressBar";
import { fetchFundraisers } from "../lib/api";
import type { Fundraiser } from "../types";

export function GivePage() {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [active, setActive] = useState<Fundraiser | null>(null);

  useEffect(() => {
    let alive = true;
    fetchFundraisers().then((data) => {
      if (alive) setFundraisers(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  const ongoing = fundraisers.filter((f) => f.kind === "ongoing_support");
  const campaigns = fundraisers.filter((f) => f.kind === "campaign");

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <InView>
            <span className="section-label">Give</span>
            <h1 className="section-title">Support & campaigns</h1>
            <p className="section-lead">
              Sustain the choir year-round, or give toward a specific project. Campaign
              goals and progress bars are optional—set from the admin panel.
            </p>
          </InView>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="container">
          {ongoing.map((fund) => (
            <InView key={fund.id} className="fund-block">
              <div className="fund-block-copy">
                <span className="section-label">Always open</span>
                <h2 className="section-title">{fund.title}</h2>
                <p className="section-lead">{fund.subtitle}</p>
                <p
                  style={{
                    color: "var(--mist-muted)",
                    margin: "1rem 0 1.5rem",
                    fontWeight: 300,
                  }}
                >
                  {fund.story}
                </p>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={() => setActive(fund)}
                >
                  Give with M-Pesa
                </button>
              </div>
              <div className="fundraiser-panel">
                <ProgressBar fundraiser={fund} />
              </div>
            </InView>
          ))}

          {campaigns.length > 0 && (
            <div style={{ marginTop: "4rem" }}>
              <InView>
                <span className="section-label">Campaigns</span>
                <h2 className="section-title">Project fundraisers</h2>
              </InView>
              <div className="campaign-grid">
                {campaigns.map((fund, i) => (
                  <InView key={fund.id} className="campaign-card" delay={i * 80}>
                    <div className="campaign-card-media">
                      <img
                        src={fund.cover_image_url || "/images/choir-main.jpg"}
                        alt=""
                      />
                    </div>
                    <div className="campaign-card-body">
                      <h3>{fund.title}</h3>
                      <p>{fund.subtitle}</p>
                      <ProgressBar fundraiser={fund} compact />
                      <button
                        type="button"
                        className="btn btn-green"
                        style={{ marginTop: "1rem" }}
                        onClick={() => setActive(fund)}
                      >
                        Support this campaign
                      </button>
                    </div>
                  </InView>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {active && (
        <DonateModal open onClose={() => setActive(null)} fundraiser={active} />
      )}
    </>
  );
}
