export function StaffWave({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`staff-svg ${className}`}
      viewBox="0 0 1200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d="M0 60 C150 20, 300 100, 450 60 S750 20, 900 60 1050 100, 1200 60"
        stroke="currentColor"
        strokeWidth="1.25"
        pathLength="420"
      />
      <path
        d="M0 40 C150 0, 300 80, 450 40 S750 0, 900 40 1050 80, 1200 40"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
        pathLength="420"
      />
      <path
        d="M0 80 C150 40, 300 120, 450 80 S750 40, 900 80 1050 120, 1200 80"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
        pathLength="420"
      />
      <circle cx="220" cy="52" r="3.5" fill="currentColor" opacity="0.8" />
      <circle cx="520" cy="68" r="3.5" fill="currentColor" opacity="0.8" />
      <circle cx="780" cy="48" r="3.5" fill="currentColor" opacity="0.8" />
      <circle cx="1020" cy="72" r="3.5" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
