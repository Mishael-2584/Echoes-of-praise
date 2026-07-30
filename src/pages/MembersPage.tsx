import { InView } from "../components/InView";
import {
  choirMembers,
  conductors,
  instrumentalists,
  leadershipRoles,
  type ChoirMember,
} from "../content/choir";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function groupByLetter(members: ChoirMember[]) {
  const map = new Map<string, ChoirMember[]>();
  for (const letter of LETTERS) map.set(letter, []);
  for (const m of members) {
    const letter = (m.name.trim()[0] || "#").toUpperCase();
    const key = LETTERS.includes(letter) ? letter : "#";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }
  return map;
}

export function MembersPage() {
  const byLetter = groupByLetter(choirMembers);
  const activeLetters = LETTERS.filter((l) => (byLetter.get(l)?.length ?? 0) > 0);
  const hasRoster = choirMembers.length > 0;

  return (
    <>
      <section className="page-hero members-hero">
        <div className="container">
          <InView>
            <span className="section-label">The choir</span>
            <h1 className="section-title">Leadership &amp; members</h1>
            <p className="section-lead">
              Officers who steward the ministry, conductors who shape the sound,
              instrumentalists who colour every arrangement—and the full choir
              roster, arranged A–Z.
            </p>
          </InView>
        </div>
      </section>

      <section className="section" id="leadership">
        <div className="container">
          <InView>
            <span className="section-label">Leadership</span>
            <h2 className="section-title">Ministry officers</h2>
            <p className="section-lead">
              Officers who steward vision, music, spiritual life, logistics, and
              communications across the ministry.
            </p>
          </InView>
          <div className="lead-grid">
            {leadershipRoles.map((role, i) => (
              <InView key={role.id} className="lead-card" delay={i * 60}>
                <span className="lead-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{role.title}</h3>
                <p>{role.summary}</p>
                <p className="lead-name">
                  {role.name ?? "Name to be announced"}
                </p>
              </InView>
            ))}
          </div>
        </div>
      </section>

      <section className="section music-team-section" id="conductors">
        <div className="container music-team-grid">
          <InView>
            <span className="section-label">Music leadership</span>
            <h2 className="section-title">Conductors</h2>
            <p className="section-lead">
              Artistic direction for repertoire, rehearsals, and performance
              readiness.
            </p>
            <div className="conductor-list">
              {conductors.map((c) => (
                <article key={c.id} className="conductor-card">
                  <div className="person-avatar" aria-hidden>
                    {c.name ? c.name.slice(0, 1) : "♪"}
                  </div>
                  <div>
                    <h3>{c.name ?? "To be announced"}</h3>
                    <p>{c.title}</p>
                    {c.note && <span className="person-note">{c.note}</span>}
                  </div>
                </article>
              ))}
            </div>
          </InView>
          <InView delay={100} id="instrumentalists">
            <span className="section-label">Ensemble</span>
            <h2 className="section-title">Instrumentalists</h2>
            <p className="section-lead">
              Keys, strings, rhythm—names and instruments will fill these seats.
            </p>
            <div className="instrument-grid">
              {instrumentalists.map((inst) => (
                <article key={inst.id} className="instrument-card">
                  <span className="instrument-label">{inst.instrument}</span>
                  <strong>{inst.name ?? "Seat open"}</strong>
                </article>
              ))}
            </div>
          </InView>
        </div>
      </section>

      <section className="section roster-section" id="roster">
        <div className="container">
          <InView>
            <span className="section-label">Full roster</span>
            <h2 className="section-title">Members A–Z</h2>
            <p className="section-lead">
              {hasRoster
                ? "Browse the choir alphabetically."
                : "The alphabetical gallery is ready. Member names will appear under each letter once shared."}
            </p>
          </InView>

          <nav className="az-nav" aria-label="Jump to letter">
            {LETTERS.map((letter) => {
              const count = byLetter.get(letter)?.length ?? 0;
              const enabled = count > 0;
              return enabled ? (
                <a key={letter} href={`#letter-${letter}`}>
                  {letter}
                </a>
              ) : (
                <span key={letter} className="az-disabled" aria-disabled>
                  {letter}
                </span>
              );
            })}
          </nav>

          {hasRoster ? (
            <div className="az-blocks">
              {activeLetters.map((letter) => {
                const list = byLetter.get(letter) ?? [];
                return (
                  <InView
                    key={letter}
                    className="az-block"
                    id={`letter-${letter}`}
                  >
                    <header className="az-letter">
                      <span>{letter}</span>
                      <em>
                        {list.length} member{list.length === 1 ? "" : "s"}
                      </em>
                    </header>
                    <ul className="az-names">
                      {list.map((m) => (
                        <li key={m.id}>
                          <strong>{m.name}</strong>
                          {m.section && <span>{m.section}</span>}
                        </li>
                      ))}
                    </ul>
                  </InView>
                );
              })}
            </div>
          ) : (
            <InView className="roster-empty">
              <div className="roster-empty-letters" aria-hidden>
                {LETTERS.map((letter) => (
                  <span key={letter}>{letter}</span>
                ))}
              </div>
              <p>
                When names are ready, they will appear under each letter—
                sorted A–Z for quick browsing.
              </p>
            </InView>
          )}
        </div>
      </section>
    </>
  );
}
