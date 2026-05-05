// Focus / Highlights box shown between "Live Exhibition Near You" and "Our Global Presence"
const POINTS = [
  {
    title: "Special Exhibition Offers & Exclusive Discounts",
    body: "Enjoy exclusive exhibition-only discounts and limited-time offers specially curated for visitors.",
  },
  {
    title: "Rare & Powerful Rudraksha Collection",
    body: "Explore rare Mukhi Rudraksha ranging from 19 Mukhi to 29 Mukhi, available for darshan and deeper understanding.",
  },
  {
    title: "Divine & Rare Malas",
    body: "Experience powerful malas like Indra Mala, Siddha Mala, Narayani Mala & Nakshatra Mala and learn their spiritual significance.",
  },
  {
    title: "Personalized Family Guidance",
    body: "Visit with your family and receive expert guidance for selecting the right Rudraksha combinations for each member.",
  },
  {
    title: "Live Rudraksha Testing",
    body: "Get your Rudraksha tested using scientific methods and view its internal structure and authenticity.",
  },
  {
    title: "On-Site Pooja & Energization",
    body: "Have your Rudraksha energized through proper Vedic rituals and Pran Pratishta at the exhibition.",
  },
];

export default function WhyVisit() {
  return (
    <section className="rl-focus-section" id="why-visit" data-testid="why-visit-section">
      <div className="rl-container">
        <div className="rl-focus-head rl-reveal">
          <span className="rl-tag">The Rudralife Experience</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
            <span className="rl-spark" aria-hidden="true">✨</span>
            Reasons to Explore the <span className="gold">Rudralife Exhibition</span>
          </h2>
          <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "12px auto 0", maxWidth: 720 }}>
            Six powerful reasons that make every visit unforgettable for you and your family.
          </p>
        </div>

        <div className="rl-focus-card rl-reveal" data-testid="focus-box">
          <ul className="rl-focus-list">
            {POINTS.map((p, i) => (
              <li className="rl-focus-item" key={i} data-testid={`focus-point-${i}`}>
                <span className="rl-focus-spark" aria-hidden="true">✨</span>
                <div className="rl-focus-text">
                  <h3 className="rl-focus-title">{p.title}</h3>
                  <p className="rl-focus-body">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
