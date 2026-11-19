import { useEffect, useState } from "react";

type Props = {
  /** ISO date-time of the moment we count down to. */
  target: string;
  label?: string;
  className?: string;
};

function partsUntil(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ target, label, className = "" }: Props) {
  const t = new Date(target).getTime();
  const [parts, setParts] = useState(() => partsUntil(t));

  useEffect(() => {
    const id = window.setInterval(() => setParts(partsUntil(t)), 1000);
    return () => window.clearInterval(id);
  }, [t]);

  if (Number.isNaN(t)) return null;

  if (parts.done) {
    return (
      <div className={`xp-countdown is-live ${className}`}>
        <span className="xp-live-dot" aria-hidden />
        <strong>Happening now</strong>
      </div>
    );
  }

  const units: [string, number][] = [
    ["Days", parts.days],
    ["Hours", parts.hours],
    ["Min", parts.minutes],
    ["Sec", parts.seconds],
  ];

  return (
    <div
      className={`xp-countdown ${className}`}
      role="timer"
      aria-label={`${parts.days} days, ${parts.hours} hours and ${parts.minutes} minutes to go`}
    >
      {label && <span className="xp-countdown-label">{label}</span>}
      <div className="xp-countdown-units" aria-hidden>
        {units.map(([name, value]) => (
          <div key={name} className="xp-countdown-unit">
            <span key={value} className="xp-countdown-num">
              {name === "Days" ? value : pad(value)}
            </span>
            <span className="xp-countdown-name">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
