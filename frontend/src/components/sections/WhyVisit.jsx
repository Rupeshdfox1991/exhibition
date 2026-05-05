import { useSiteContent, pick } from "@/SiteContent";

const DEFAULT_POINTS = [
  { icon: "✨", title: "Special Exhibition Offers & Exclusive Discounts", body: "Enjoy exclusive exhibition-only discounts and limited-time offers specially curated for visitors." },
  { icon: "✨", title: "Rare & Powerful Rudraksha Collection", body: "Explore rare Mukhi Rudraksha ranging from 19 Mukhi to 29 Mukhi, available for darshan and deeper understanding." },
  { icon: "✨", title: "Divine & Rare Malas", body: "Experience powerful malas like Indra Mala, Siddha Mala, Narayani Mala & Nakshatra Mala and learn their spiritual significance." },
  { icon: "✨", title: "Personalized Family Guidance", body: "Visit with your family and receive expert guidance for selecting the right Rudraksha combinations for each member." },
  { icon: "✨", title: "Live Rudraksha Testing", body: "Get your Rudraksha tested using scientific methods and view its internal structure and authenticity." },
  { icon: "✨", title: "On-Site Pooja & Energization", body: "Have your Rudraksha energized through proper Vedic rituals and Pran Pratishta at the exhibition." },
];

export default function WhyVisit() {
  const { content } = useSiteContent();
  if (pick(content, "section_visibility.focus_box", true) === false) return null;

  const tag = pick(content, "focus_box.tag", "The Rudralife Experience");
  const titleLine = pick(content, "focus_box.title", "Reasons to Explore the");
  const highlight = pick(content, "focus_box.title_highlight", "Rudralife Exhibition");
  const subtitle = pick(content, "focus_box.subtitle", "Six powerful reasons that make every visit unforgettable for you and your family.");
  const points = pick(content, "focus_box.points", DEFAULT_POINTS);

  return (
    <section className="rl-focus-section" id="why-visit" data-testid="why-visit-section">
      <div className="rl-container">
        <div className="rl-focus-head rl-reveal">
          <span className="rl-tag">{tag}</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
            <span className="rl-spark" aria-hidden="true">✨</span>
            {titleLine} <span className="gold">{highlight}</span>
          </h2>
          <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "12px auto 0", maxWidth: 720 }}>
            {subtitle}
          </p>
        </div>

        <div className="rl-focus-card rl-reveal" data-testid="focus-box">
          <ul className="rl-focus-list">
            {points.map((p, i) => (
              <li className="rl-focus-item" key={i} data-testid={`focus-point-${i}`}>
                <span className="rl-focus-spark" aria-hidden="true">{p.icon || "✨"}</span>
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
