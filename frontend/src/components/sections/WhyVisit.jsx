const highlights = [
  "Explore rare and collectible Rudraksha beads",
  "Get visual testing of your existing Rudraksha",
  "Receive free private consultation for you and your family",
  "Guidance on selection, correction, and remaking of bead combinations",
  "Access to customized Rudraksha combinations based on personal needs",
  "Discover a wide variety of exclusive malas, Jap Malas, and spiritual combinations",
  "Connect with Rudraksha seekers in your city",
  "Learn proper usage, do's and don'ts of Rudraksha",
  "Gain authentic and guided knowledge from experts",
];

export default function WhyVisit() {
  return (
    <section className="rl-why-visit" id="why-visit" data-testid="why-visit-section">
      <div className="rl-container">
        <div className="rl-why-head rl-reveal">
          <span className="rl-tag">The Rudralife Experience</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
            Why should one visit the <span className="gold">Rudralife Exhibition?</span>
          </h2>
        </div>
        <div className="rl-why-body rl-reveal">
          <p>
            The Rudralife Exhibition offers a unique and enriching experience for spiritual seekers
            and collectors. Visitors can explore rare Rudraksha beads, test their existing ones,
            and receive free expert consultation for themselves and their family.
          </p>
          <p>
            The exhibition also provides customized combinations, exclusive malas, and valuable
            guidance on proper usage, helping you deepen your understanding of Rudraksha in an
            authentic and meaningful way.
          </p>
        </div>

        <div className="rl-why-highlights rl-reveal">
          <h3 className="rl-why-highlights-title">
            Key Highlights of the <span className="gold">Rudralife Exhibition</span>
          </h3>
          <ul className="rl-why-list">
            {highlights.map((h, i) => (
              <li key={i} data-testid={`why-highlight-${i}`}>
                <span className="rl-why-bead" aria-hidden="true">
                  <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
                    <defs>
                      <radialGradient id={`why-bead-${i}`} cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#6B3A10" />
                        <stop offset="60%" stopColor="#3B1C06" />
                        <stop offset="100%" stopColor="#1A0E05" />
                      </radialGradient>
                    </defs>
                    <circle cx="16" cy="16" r="13" fill={`url(#why-bead-${i})`} stroke="#C9920A" strokeWidth="1.3" />
                    <path d="M16 4 Q18 16 16 28 M4 16 Q16 18 28 16 M7 7 Q16 16 25 25 M25 7 Q16 16 7 25" stroke="#3B1C06" strokeWidth="0.85" fill="none" opacity="0.85" />
                    <circle cx="16" cy="16" r="2" fill="#C9920A" />
                  </svg>
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
