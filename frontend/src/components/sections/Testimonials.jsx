import { seekers } from "@/data/content";

function Card({ s }) {
  return (
    <div className="rl-seeker-card" data-testid={`seeker-${s.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}>
      <div className="rl-seeker-photo">
        <img src={s.img} alt={s.name} loading="lazy" />
      </div>
      <div className="rl-seeker-body">
        <div className="rl-seeker-name">{s.name}</div>
        <div className="rl-seeker-role">{s.role}</div>
      </div>
    </div>
  );
}

export default function SeekersWorldwide() {
  const half = Math.ceil(seekers.length / 2);
  const row1 = [...seekers.slice(0, half), ...seekers.slice(0, half)];
  const row2 = [...seekers.slice(half), ...seekers.slice(half)];

  return (
    <section className="rl-seekers" id="seekers" data-testid="seekers-section">
      <div className="rl-container rl-seekers-head rl-reveal">
        <span className="rl-tag">Seekers Worldwide</span>
        <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
          Trusted by <span className="gold">Seekers Worldwide</span>
        </h2>
        <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
          From spiritual practitioners to professionals and leaders, Rudralife serves a diverse global community.
        </p>
      </div>
      <div className="rl-scroll-track">
        <div className="rl-seeker-row">
          {row1.map((s, i) => <Card key={"s1" + i} s={s} />)}
        </div>
      </div>
      <div className="rl-scroll-track" style={{ marginTop: 22 }}>
        <div className="rl-seeker-row reverse">
          {row2.map((s, i) => <Card key={"s2" + i} s={s} />)}
        </div>
      </div>
    </section>
  );
}
