import { aboutParagraphs } from "@/data/content";

export default function About() {
  return (
    <section className="rl-about" id="about" data-testid="about-section">
      <div className="rl-container">
        <div className="rl-about-grid">
          <div className="rl-about-text rl-reveal">
            <span className="rl-tag">Since 2001</span>
            <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
              25 Years of <span className="gold">Sacred Service</span>
            </h2>
            {aboutParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="rl-about-aside rl-reveal">
            <div className="label">The Rudralife Promise</div>
            <h3>Authenticity · Wisdom · Presence</h3>
            <p style={{ color: "rgba(253,248,240,0.78)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, lineHeight: 1.6 }}>
              Every Rudraksha is lab-certified. Every consultation is unhurried.
              Every recommendation is tuned to your kundali, intention, and
              life-stage — never to a sales target.
            </p>
            <ul>
              <li><span className="k">Founded</span><span className="v">2001 · Mumbai</span></li>
              <li><span className="k">Seekers Served</span><span className="v">5,00,000+</span></li>
              <li><span className="k">Exhibitions</span><span className="v">1,200+</span></li>
              <li><span className="k">Domestic Cities</span><span className="v">25+</span></li>
              <li><span className="k">International Countries</span><span className="v">10+</span></li>
              <li><span className="k">Certification</span><span className="v">ISO Lab Certified</span></li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
