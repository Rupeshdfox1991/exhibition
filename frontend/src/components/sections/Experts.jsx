import { useState } from "react";
import { experts } from "@/data/content";

const initials = (n) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function Experts() {
  const [flipped, setFlipped] = useState(null);
  return (
    <section className="rl-experts" id="experts" data-testid="experts-section">
      <div className="rl-container">
        <div className="rl-experts-head rl-reveal">
          <span className="rl-tag">Guided by Masters</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-cream)" }}>
            Panel <span className="gold">Experts</span> of Rudralife
          </h2>
          <p className="rl-subtitle" style={{ margin: "0 auto" }}>
            Meet the guiding minds behind Rudralife's mission — a panel of Vedic experts
            bringing together ancient knowledge and deep compassion.
          </p>
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
                  <div className="rl-expert-avatar">{initials(e.name)}</div>
                  <h4>{e.name}</h4>
                  <div className="role">{e.title}</div>
                </div>
                <div className="rl-expert-face rl-expert-back">
                  <div className="role">{e.title}</div>
                  <p>{e.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
