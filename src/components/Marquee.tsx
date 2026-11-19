type Props = {
  items: string[];
  reverse?: boolean;
  tone?: "gold" | "ink";
};

/** Endless ticker band. The list is doubled so the loop is seamless. */
export function Marquee({ items, reverse = false, tone = "gold" }: Props) {
  const row = (hidden: boolean) => (
    <ul className="xp-marquee-row" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={`${item}-${i}`}>
          <span>{item}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 16.5 5.8 21l2.4-7.3L2 9.2h7.6z"
              fill="currentColor"
            />
          </svg>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`xp-marquee xp-marquee-${tone} ${reverse ? "is-reverse" : ""}`}>
      <div className="xp-marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
