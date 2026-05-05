import { videoTestimonials } from "@/data/content";
import { useSiteContent, pick } from "@/SiteContent";

export default function VideoTestimonials() {
  const { content } = useSiteContent();
  if (pick(content, "section_visibility.testimonials", true) === false) return null;
  return (
    <section className="rl-video-testi" id="client-say" data-testid="client-say-section">
      <div className="rl-container">
        <div className="rl-vt-head rl-reveal">
          <span className="rl-tag">Real Stories</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
            What Our <span className="gold">Clients Say</span>
          </h2>
          <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
            Hear from those whose lives have been transformed through authentic Rudraksha guidance.
          </p>
        </div>
        <div className="rl-vt-grid rl-reveal">
          {videoTestimonials.map((v) => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rl-vt-card"
              data-testid={`video-testi-${v.id}`}
            >
              <img src={v.img} alt={`Testimonial ${v.id}`} loading="lazy" />
              <div className="rl-vt-play">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="rl-vt-label">Watch Story ↗</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
