import { useEffect, useState } from "react";
import type { Fundraiser } from "../types";
import { formatKes, progressPercent } from "../lib/api";

type Props = {
  fundraiser: Fundraiser;
  compact?: boolean;
};

export function ProgressBar({ fundraiser, compact = false }: Props) {
  const target = progressPercent(fundraiser.raisedKes, fundraiser.goalKes);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <div className="progress-wrap">
      <div className="progress-stats">
        <div>
          <strong>{formatKes(fundraiser.raisedKes)}</strong>
          <div>raised of {formatKes(fundraiser.goalKes)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <strong>{target}%</strong>
          <div>of goal</div>
        </div>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={target}
        aria-label="Fundraiser progress"
      >
        <div className="progress-fill" style={{ width: `${width}%` }} />
      </div>
      {!compact && (
        <div className="milestones">
          {fundraiser.milestones.map((m) => {
            const done = fundraiser.raisedKes >= m.amountKes;
            return (
              <div key={m.label} className={`milestone ${done ? "done" : ""}`}>
                <span>{done ? "✓ " : ""}{m.label}</span>
                <span>{formatKes(m.amountKes)}</span>
              </div>
            );
          })}
        </div>
      )}
      <p style={{ marginTop: "0.85rem", fontSize: "0.82rem", color: "var(--mist-muted)" }}>
        Updated {new Date(fundraiser.updatedAt).toLocaleString("en-KE")} · live from secure API
      </p>
    </div>
  );
}
