import { seekers as defaultSeekers } from "@/data/content";
import { useSiteContent, pick } from "@/SiteContent";

function Card({ s }) {
  const safeName = (s.name || "seeker").replace(/[^a-z0-9]/gi, "-").toLowerCase();
  return (
    <div className="rl-seeker-card" data-testid={`seeker-${safeName}`}>
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
  const { content } = useSiteContent();
  if (pick(content, "section_visibility.trusted", true) === false) return null;
  const items = pick(content, "trusted.items", defaultSeekers);
  const tag = pick(content, "trusted.tag", "Seekers Worldwide");
  const titleLine = pick(content, "trusted.title", "Trusted by");
  const highlight = pick(content, "trusted.title_highlight", "Seekers Worldwide");
  const subtitle = pick(content, "trusted.subtitle", "From spiritual practitioners to professionals and leaders, Rudralife serves a diverse global community.");
  const half = Math.ceil(items.length / 2);
  const row1 = [...items.slice(0, half), ...items.slice(0, half)];
  const row2 = [...items.slice(half), ...items.slice(half)];

  return (
    <section className="rl-seekers" id="seekers" data-testid="seekers-section">
      <div className="rl-container rl-seekers-head rl-reveal">
        <span className="rl-tag">{tag}</span>
        <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
          {titleLine} <span className="gold">{highlight}</span>
        </h2>
        <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
          {subtitle}
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
