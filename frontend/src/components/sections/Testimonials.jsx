import { testimonials } from "@/data/content";

const initials = (n) => n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Card({ t }) {
  return (
    <div className="rl-testi-card" data-testid={`testi-${t.name.replace(/\s/g, "-").toLowerCase()}`}>
      <div className="rl-testi-stars">★ ★ ★ ★ ★</div>
      <p className="rl-testi-text">&ldquo;{t.text}&rdquo;</p>
      <div className="rl-testi-foot">
        <div className="rl-testi-avatar">{initials(t.name)}</div>
        <div>
          <div className="rl-testi-name">{t.name}</div>
          <div className="rl-testi-city">{t.location}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const half = Math.ceil(testimonials.length / 2);
  const row1 = [...testimonials.slice(0, half), ...testimonials.slice(0, half)];
  const row2 = [...testimonials.slice(half), ...testimonials.slice(half)];

  return (
    <section className="rl-testi" id="testimonials" data-testid="testimonials-section">
      <div className="rl-container rl-testi-head rl-reveal">
        <span className="rl-tag">Trusted Worldwide</span>
        <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
          Trusted by Seekers <span className="gold">Worldwide</span>
        </h2>
        <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
          From spiritual practitioners to professionals and leaders, Rudralife serves a diverse global community.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div className="rl-scroll-track">
          <div className="rl-testi-row">
            {row1.map((t, i) => <Card key={"r1" + i} t={t} />)}
          </div>
        </div>
        <div className="rl-scroll-track">
          <div className="rl-testi-row reverse">
            {row2.map((t, i) => <Card key={"r2" + i} t={t} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
