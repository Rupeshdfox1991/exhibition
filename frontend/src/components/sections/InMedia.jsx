import { mediaFeatures, mediaLogos } from "@/data/content";

export default function InMedia() {
  const logos = [...mediaLogos, ...mediaLogos];
  return (
    <section className="rl-media" id="media" data-testid="media-section">
      <div className="rl-container">
        <div className="rl-media-head rl-reveal">
          <span className="rl-tag">In The Media</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-cream)" }}>
            Featured & <span className="gold">Recognised</span>
          </h2>
          <p className="rl-subtitle" style={{ margin: "0 auto" }}>
            Rudralife has been featured by renowned personalities and leading media platforms
            for its authenticity and contribution to spiritual heritage.
          </p>
        </div>

        <div className="rl-media-grid rl-reveal">
          {mediaFeatures.map((m) => (
            <a
              key={m.label}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rl-media-card"
              data-testid={`media-${m.label.replace(/\s/g, "-").toLowerCase()}`}
            >
              <div className="rl-media-img">
                <img src={m.img} alt={m.label} loading="lazy" />
                <div className="rl-media-play">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
              <div className="rl-media-body">
                <div className="rl-media-label">{m.label}</div>
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
                <span className="rl-media-cta">↗ Watch Now</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="rl-featured-in">
        <div className="rl-container">
          <div className="rl-featured-label">As Featured In</div>
        </div>
        <div className="rl-scroll-track">
          <div className="rl-logo-row">
            {logos.map((l, i) => (
              <div className="rl-logo-cell" key={i} data-testid={`media-logo-${l.id}-${i}`}>
                <img src={l.img} alt={`Media logo ${l.id}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
