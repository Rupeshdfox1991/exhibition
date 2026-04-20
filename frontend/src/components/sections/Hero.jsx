export default function Hero({ onRegister, onKnowMore }) {
  return (
    <header className="rl-hero" id="home" data-testid="hero-section">
      <div className="rl-hero-banner" />
      <div className="rl-hero-overlay" />
      <div className="rl-hero-mandala" />
      <div className="rl-hero-inner">
        <div className="rl-hero-est">EST. 2001 · MUMBAI</div>
        <div className="rl-hero-om" data-testid="hero-om">ॐ नमः शिवाय — Sacred Guidance Since 2001</div>
        <h1 className="rl-hero-title">
          Rudra<span className="gold">life</span>
        </h1>
        <p className="rl-hero-tagline">Sacred Rudraksha · Ancient Wisdom · Modern World</p>
        <div className="rl-divider" aria-hidden="true">
          <span className="line" />
          <span className="ornament">✦</span>
          <span className="line" />
        </div>
        <p className="rl-hero-sub2">Explore, Experience, Elevate with Rudralife</p>
        <div className="rl-hero-cta-row">
          <button className="rl-btn rl-btn-primary" data-testid="hero-register-btn" onClick={onRegister}>
            Register Now →
          </button>
          <button className="rl-btn rl-btn-ghost" data-testid="hero-know-more-btn" onClick={onKnowMore}>
            Know More
          </button>
        </div>
        <div className="rl-hero-stats">
          <div className="rl-hero-stat"><div className="num">25+</div><div className="lbl">Years</div></div>
          <div className="rl-hero-stat"><div className="num">1200+</div><div className="lbl">Exhibitions</div></div>
          <div className="rl-hero-stat"><div className="num">5,00,000+</div><div className="lbl">Seekers</div></div>
        </div>
      </div>
    </header>
  );
}
