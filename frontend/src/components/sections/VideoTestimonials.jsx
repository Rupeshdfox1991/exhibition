import { videoTestimonials as defaultTestimonials } from "@/data/content";
import { useSiteContent, pick } from "@/SiteContent";

export default function VideoTestimonials() {
  const { content } = useSiteContent();
  if (pick(content, "section_visibility.testimonials", true) === false) return null;
  const items = pick(content, "testimonials.items", defaultTestimonials);
  const tag = pick(content, "testimonials.tag", "Real Stories");
  const titleLine = pick(content, "testimonials.title", "What Our");
  const highlight = pick(content, "testimonials.title_highlight", "Clients Say");
  const subtitle = pick(content, "testimonials.subtitle", "Hear from those whose lives have been transformed through authentic Rudraksha guidance.");
  return (
    <section className="rl-video-testi" id="client-say" data-testid="client-say-section">
      <div className="rl-container">
        <div className="rl-vt-head rl-reveal">
          <span className="rl-tag">{tag}</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
            {titleLine} <span className="gold">{highlight}</span>
          </h2>
          <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
            {subtitle}
          </p>
        </div>
        <div className="rl-vt-grid rl-reveal">
          {items.map((v, i) => (
            <a
              key={v.id || i}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rl-vt-card"
              data-testid={`video-testi-${v.id || i}`}
            >
              <img src={v.img} alt={v.caption || `Testimonial ${i + 1}`} loading="lazy" />
              <div className="rl-vt-play">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="rl-vt-label">{v.caption || "Watch Story ↗"}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
