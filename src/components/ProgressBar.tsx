import { useEffect, useState } from "react";
import type { Fundraiser } from "../types";
import { formatKes, progressPercent } from "../lib/api";

type Props = {
  fundraiser: Fundraiser;
  compact?: boolean;
};

export function ProgressBar({ fundraiser, compact = false }: Props) {
  if (!fundraiser.show_progress || !fundraiser.goal_kes) {
    return (
      <div className="progress-wrap">
        <p style={{ color: "var(--mist-muted)", fontWeight: 300 }}>
          Open giving — every gift strengthens the ministry.
        </p>
      </div>
    );
  }

  const raised = fundraiser.raised_kes;
  const goal = fundraiser.goal_kes;
  const pct = progressPercent(raised, goal);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="progress-wrap">
      <div className="progress-stats">
        <div>
          <strong>{formatKes(raised)}</strong>
          <div>raised of {formatKes(goal)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <strong>{pct}%</strong>
          <div>of goal</div>
        </div>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Fundraiser progress"
      >
        <div className="progress-fill" style={{ width: `${width}%` }} />
      </div>
      {!compact && (
        <p
          style={{
            marginTop: "0.85rem",
            fontSize: "0.78rem",
            color: "var(--mist-muted)",
            letterSpacing: "0.04em",
          }}
        >
          Campaign progress updates as gifts are confirmed
        </p>
      )}
    </div>
  );
}
