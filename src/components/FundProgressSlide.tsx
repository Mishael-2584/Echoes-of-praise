import type { Fundraiser } from "../types";
import { formatKes, formatPercent, fundBalance, progressPercent } from "../lib/api";
import { useCountUp } from "../lib/motion";

type Props = {
  fundraiser: Fundraiser;
  compact?: boolean;
};

export function PaymentDetails({ fundraiser }: { fundraiser: Fundraiser }) {
  const paybill = fundraiser.paybill?.trim();
  const account = fundraiser.account_number?.trim();
  const name = fundraiser.account_name?.trim();
  if (!paybill && !account) return null;

  return (
    <div className="pay-details">
      <p className="pay-details-brand">M-Pesa</p>
      {paybill && (
        <p>
          <span>Paybill</span>
          <strong>{paybill}</strong>
        </p>
      )}
      {account && (
        <p>
          <span>Account number</span>
          <strong>{account}</strong>
          {name ? <em>{name}</em> : null}
        </p>
      )}
    </div>
  );
}

export function FundProgressSlide({ fundraiser, compact = false }: Props) {
  const goal = fundraiser.goal_kes;
  const raised = fundraiser.raised_kes;
  const { ref, value: shown } = useCountUp<HTMLDivElement>(raised, 1800);
  const shownPct = progressPercent(shown, goal);

  if (!fundraiser.show_progress || !goal) {
    return (
      <div className="progress-wrap">
        <p className="fund-slide-open">Open giving — every gift strengthens the ministry.</p>
        <PaymentDetails fundraiser={fundraiser} />
      </div>
    );
  }

  const balance = fundBalance(goal, raised);

  return (
    <div className={compact ? "fund-slide fund-slide-compact" : "fund-slide"}>
      {!compact && fundraiser.slide_kicker?.trim() && (
        <p className="section-label">{fundraiser.slide_kicker}</p>
      )}
      {!compact && <h3 className="fund-slide-title">Fundraising progress</h3>}
      {!compact && fundraiser.slide_tagline?.trim() && (
        <p className="fund-slide-tagline">{fundraiser.slide_tagline}</p>
      )}

      <div className="progress-wrap" ref={ref}>
        <div className="progress-stats">
          <div>
            <strong>{formatPercent(shownPct)}%</strong>
            <div>funded</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>{formatKes(Math.round(shown))}</strong>
            <div>of {formatKes(goal)}</div>
          </div>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent(raised, goal))}
          aria-label="Fundraiser progress"
        >
          <div className="progress-fill" style={{ width: `${shownPct}%` }} />
        </div>
      </div>

      {!compact && (
        <ul className="fund-metrics">
          <li>
            <span>Target</span>
            <strong>{formatKes(goal)}</strong>
          </li>
          <li>
            <span>Cash received</span>
            <strong>{formatKes(raised)}</strong>
          </li>
          <li>
            <span>Balance</span>
            <strong>{formatKes(balance)}</strong>
          </li>
        </ul>
      )}

      <PaymentDetails fundraiser={fundraiser} />
    </div>
  );
}
