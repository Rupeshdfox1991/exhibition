import { useState } from "react";
import { experts } from "@/data/content";
import { useSiteContent, pick } from "@/SiteContent";

export default function Experts() {
  const [flipped, setFlipped] = useState(null);
  const { content } = useSiteContent();
  if (pick(content, "section_visibility.experts", true) === false) return null;
  return (
    <section className="rl-experts" id="experts" data-testid="experts-section">
      <div className="rl-container">
        <div className="rl-experts-head rl-reveal">
          <span className="rl-tag">Guided by Masters</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-cream)" }}>
            Panel <span className="gold">Experts</span> of Rudralife
          </h2>
          <p className="rl-subtitle" style={{ margin: "0 auto" }}>
            Meet the guiding minds behind Rudralife's mission — a panel of Vedic
            experts bringing together ancient knowledge and deep compassion.
          </p>
          <div className="rl-hint">Hover or tap to know more</div>
        </div>
        <div className="rl-expert-grid rl-reveal">
          {experts.map((e, i) => (
            <div
              key={e.name}
              className={`rl-expert-card ${flipped === i ? "flipped" : ""}`}
              data-testid={`expert-card-${i}`}
              onClick={() => setFlipped(flipped === i ? null : i)}
            >
              <div className="rl-expert-inner">
                <div className="rl-expert-face rl-expert-front">
                  <div className="rl-expert-photo">
                    <img src={e.img} alt={e.name} loading="lazy" />
                    <span
                      className="rl-expert-tap-info"
                      data-testid={`expert-tap-info-${i}`}
                    >
                      Tap to See
                    </span>
                  </div>
                  <div className="rl-expert-meta">
                    <h4>{e.name}</h4>
                    <div className="role">{e.title}</div>
                  </div>
                </div>
                <div className="rl-expert-face rl-expert-back">
                  <h4>{e.name}</h4>
                  <div className="role">{e.title}</div>
                  <p>{e.bio}</p>
                  <div className="rl-om">ॐ</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
