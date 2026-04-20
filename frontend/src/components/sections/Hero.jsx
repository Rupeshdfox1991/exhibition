export default function Hero({ onRegister, onKnowMore }) {
  return (
    <header className="rl-hero" id="home" data-testid="hero-section">
      <div className="rl-hero-split">
        <div className="rl-hero-art">
          <img
            src="https://customer-assets.emergentagent.com/job_b271b1af-1da5-4630-96e0-320d96eb6add/artifacts/sczw4czf_1920%20x%20720%20Siddha%20Mala%20website%20Banner%2002%20copy.jpg.jpeg"
            alt="Sacred Siddha Mala Rudraksha"
            className="rl-hero-art-img"
            data-testid="hero-banner-img"
          />
        </div>
        <div className="rl-hero-content">
          <div className="rl-hero-mandala-sm" />
          <div className="rl-hero-est">EST. 2001 · MUMBAI</div>
          <div className="rl-hero-om" data-testid="hero-om">ॐ नमः शिवाय</div>
          <div className="rl-hero-om-sub">Sacred Guidance Since 2001</div>
          <h1 className="rl-hero-title">
            Empower<br /><span className="gold">Yourself</span>
          </h1>
          <p className="rl-hero-tagline">
            Sacred Rudraksha · Ancient Wisdom · Modern World
          </p>
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
      </div>
    </header>
  );
}
