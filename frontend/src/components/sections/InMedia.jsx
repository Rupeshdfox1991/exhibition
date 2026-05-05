import { mediaFeatures as defaultFeatures, mediaLogos as defaultLogos } from "@/data/content";
import { useSiteContent, pick } from "@/SiteContent";

export default function InMedia() {
  const { content } = useSiteContent();
  if (pick(content, "section_visibility.media", true) === false) return null;
  const features = pick(content, "media.features", defaultFeatures);
  const logosData = pick(content, "media.logos", defaultLogos);
  const tag = pick(content, "media.tag", "In The Media");
  const titleLine = pick(content, "media.title", "Featured &");
  const highlight = pick(content, "media.title_highlight", "Recognised");
  const subtitle = pick(content, "media.subtitle", "Rudralife has been featured by renowned personalities and leading media platforms for its authenticity and contribution to spiritual heritage.");
  const featuredLabel = pick(content, "media.featured_label", "As Featured In");
  const logos = [...logosData, ...logosData];
  return (
    <section className="rl-media" id="media" data-testid="media-section">
      <div className="rl-container">
        <div className="rl-media-head rl-reveal">
          <span className="rl-tag">{tag}</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-cream)" }}>
            {titleLine} <span className="gold">{highlight}</span>
          </h2>
          <p className="rl-subtitle" style={{ margin: "0 auto" }}>
            {subtitle}
          </p>
        </div>

        <div className="rl-media-grid rl-reveal">
          {features.map((m, i) => (
            <a
              key={(m.label || "") + i}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rl-media-card"
              data-testid={`media-${(m.label || `card-${i}`).replace(/\s/g, "-").toLowerCase()}`}
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
          <div className="rl-featured-label">{featuredLabel}</div>
        </div>
        <div className="rl-scroll-track">
          <div className="rl-logo-row">
            {logos.map((l, i) => (
              <div className="rl-logo-cell" key={i} data-testid={`media-logo-${l.id || i}-${i}`}>
                <img src={l.img} alt={`Media logo ${l.id || i}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
