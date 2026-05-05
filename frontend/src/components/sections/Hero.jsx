import { useSiteContent, pick } from "@/SiteContent";

const DEFAULT_BANNER =
  "https://customer-assets.emergentagent.com/job_sacred-rudraksha-hub/artifacts/k4161fa8_1920%20x%20720%20Siddha%20Mala%20website%20Banner%2002%20copy.jpg%20%281%29.jpeg";

const BeadIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <defs>
      <radialGradient id="bead" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#6B3A10" />
        <stop offset="60%" stopColor="#3B1C06" />
        <stop offset="100%" stopColor="#1A0E05" />
      </radialGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#bead)" stroke="#C9920A" strokeWidth="1.3" />
    <path d="M16 3 Q18 16 16 29 M3 16 Q16 18 29 16 M6 6 Q16 16 26 26 M26 6 Q16 16 6 26" stroke="#3B1C06" strokeWidth="0.9" fill="none" opacity="0.85" />
    <circle cx="16" cy="16" r="2.2" fill="#C9920A" />
  </svg>
);

export default function Hero({ onRegister, onKnowMore }) {
  const { content } = useSiteContent();
  const banner = pick(content, "hero.banner_image", DEFAULT_BANNER);
  const est = pick(content, "hero.est_text", "EST. 2001 · MUMBAI");
  const om = pick(content, "hero.om_text", "ॐ नमः शिवाय");
  const omSub = pick(content, "hero.om_sub", "Sacred Guidance Since 2001");
  const titleLine1 = pick(content, "hero.title_line1", "Explore the world of");
  const titleHighlight = pick(content, "hero.title_highlight", "Rudraksha");
  const titleLine2 = pick(content, "hero.title_line2", "with Rudralife");
  const tagline = pick(content, "hero.tagline", "Sacred Rudraksha · Ancient Wisdom · Modern World");
  const sub2 = pick(content, "hero.sub2", "Explore, Experience, Elevate with Rudralife");
  const registerBtn = pick(content, "hero.register_btn", "Register Now");
  const notifyBtn = pick(content, "hero.notify_btn", "Get Notified When We Visit Your City");
  const stats = pick(content, "hero.stats", [
    { num: "25+", lbl: "Years" },
    { num: "1200+", lbl: "Exhibitions" },
    { num: "5,00,000+", lbl: "Seekers" },
  ]);

  return (
    <header className="rl-hero" id="home" data-testid="hero-section">
      <div
        className="rl-hero-bg"
        style={{ backgroundImage: `url(${banner})` }}
        data-testid="hero-banner-img"
      />
      <div className="rl-hero-sheen" />

      <div className="rl-hero-wrap">
        <div className="rl-hero-text">
          <div className="rl-hero-est">{est}</div>
          <div className="rl-hero-om" data-testid="hero-om">{om}</div>
          <div className="rl-hero-om-sub">{omSub}</div>
          <h1 className="rl-hero-title">
            {titleLine1}<br /><span className="gold">{titleHighlight}</span> {titleLine2}
          </h1>
          <p className="rl-hero-tagline">{tagline}</p>
          <div className="rl-divider" aria-hidden="true">
            <span className="line" />
            <span className="ornament">✦</span>
            <span className="line" />
          </div>
          <p className="rl-hero-sub2">{sub2}</p>
          <div className="rl-hero-cta-row">
            <button className="rl-btn rl-btn-primary" data-testid="hero-register-btn" onClick={onRegister}>
              <BeadIcon size={18} />
              {registerBtn}
              <span style={{ marginLeft: 2 }}>→</span>
            </button>
            <button className="rl-btn rl-btn-ghost" data-testid="hero-know-more-btn" onClick={onKnowMore}>
              {notifyBtn}
            </button>
          </div>
          <div className="rl-hero-stats">
            {stats.map((s, i) => (
              <div className="rl-hero-stat" key={i}>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
