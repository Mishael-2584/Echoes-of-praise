import { choirProfile } from "../content/choir";

export function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

type Props = {
  /** Smaller version for the footer. */
  compact?: boolean;
};

/** Scan-or-tap Instagram follow card. */
export function InstagramCard({ compact = false }: Props) {
  const { instagramHandle, instagramUrl, instagramQr } = choirProfile;

  if (compact) {
    return (
      <a
        className="xp-ig-mini"
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={instagramQr} alt={`Instagram QR code for @${instagramHandle}`} loading="lazy" />
        <span>
          <InstagramIcon size={16} /> @{instagramHandle}
        </span>
      </a>
    );
  }

  return (
    <div className="xp-ig">
      <div className="xp-ig-copy">
        <span className="section-label">Follow the journey</span>
        <h2 className="section-title">
          Behind the music, <em>on Instagram</em>
        </h2>
        <p className="section-lead">
          Rehearsal moments, concert reels and ministry news. Scan the code with
          your phone camera, or tap to follow{" "}
          <strong>@{instagramHandle}</strong>.
        </p>
        <a
          className="btn btn-gold xp-ig-btn"
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon size={18} /> Follow @{instagramHandle}
        </a>
      </div>
      <a
        className="xp-ig-qr"
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open @${instagramHandle} on Instagram`}
      >
        <span className="xp-ig-ring" aria-hidden />
        <img src={instagramQr} alt={`Instagram QR code for @${instagramHandle}`} loading="lazy" />
      </a>
    </div>
  );
}
