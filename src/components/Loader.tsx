type LoaderProps = {
  label?: string;
  /** Compact inline loader for a section */
  compact?: boolean;
  /** Number of skeleton cards (list pages) */
  skeletons?: number;
  className?: string;
};

export function Loader({
  label = "Loading…",
  compact = false,
  skeletons = 0,
  className = "",
}: LoaderProps) {
  if (skeletons > 0) {
    return (
      <div
        className={`loader-skeletons ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">{label}</span>
        {Array.from({ length: skeletons }, (_, i) => (
          <div key={i} className="loader-skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`page-loader ${compact ? "is-compact" : ""} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="page-loader-ring" aria-hidden />
      <p>{label}</p>
    </div>
  );
}
