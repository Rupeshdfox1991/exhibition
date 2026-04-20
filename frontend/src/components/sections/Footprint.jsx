import { useState } from "react";

const MAP_URL = "https://customer-assets.emergentagent.com/job_b271b1af-1da5-4630-96e0-320d96eb6add/artifacts/iqr4bwmn_image.png";

// Approximate positions on the world map (0–100% for x and y) for each exhibition city
const dots = [
  // Domestic (India) — cluster around x=70% y=48%
  { id: "mumbai",         name: "Mumbai",         x: 69.0, y: 55.5, status: "soon" },
  { id: "delhi",          name: "Delhi",          x: 70.5, y: 46.5, status: "soon" },
  { id: "ahmedabad",      name: "Ahmedabad",      x: 68.2, y: 52.5, status: "soon" },
  { id: "vadodara",       name: "Vadodara",       x: 68.4, y: 53.2, status: "soon" },
  { id: "rajkot",         name: "Rajkot",         x: 67.3, y: 53.5, status: "soon" },
  { id: "surat",          name: "Surat",          x: 68.6, y: 54.2, status: "soon" },
  { id: "jamnagar",       name: "Jamnagar",       x: 66.8, y: 53.8, status: "soon" },
  { id: "gandhinagar",    name: "Gandhinagar",    x: 68.1, y: 52.2, status: "soon" },
  { id: "jaipur",         name: "Jaipur",         x: 69.5, y: 48.8, status: "soon" },
  { id: "indore",         name: "Indore",         x: 70.0, y: 53.0, status: "soon" },
  { id: "kolkata",        name: "Kolkata",        x: 74.0, y: 52.0, status: "soon" },
  { id: "pune",           name: "Pune",           x: 69.5, y: 57.0, status: "soon" },
  { id: "chennai",        name: "Chennai",        x: 71.5, y: 60.5, status: "soon" },
  { id: "bengaluru",      name: "Bengaluru",      x: 70.8, y: 60.0, status: "active" },
  { id: "hyderabad",      name: "Hyderabad",      x: 71.0, y: 57.5, status: "active" },
  { id: "visakhapatnam",  name: "Visakhapatnam",  x: 73.0, y: 56.5, status: "active" },
  // International
  { id: "dubai",          name: "Dubai",          x: 60.5, y: 52.5, status: "soon" },
  { id: "singapore",      name: "Singapore",      x: 78.0, y: 64.0, status: "soon" },
  { id: "malaysia",       name: "Kuala Lumpur",   x: 78.5, y: 62.5, status: "soon" },
  { id: "uk",             name: "London",         x: 47.2, y: 34.5, status: "soon" },
];

export default function Footprint() {
  const [hover, setHover] = useState(null);

  // Dashed connector lines from India (Mumbai) to international cities
  const mumbai = dots.find((d) => d.id === "mumbai");
  const intl = dots.filter((d) => ["dubai", "singapore", "malaysia", "uk"].includes(d.id));

  return (
    <section className="rl-map-section" id="footprint" data-testid="footprint-section">
      <div className="rl-container">
        <div style={{ textAlign: "center" }} className="rl-reveal">
          <span className="rl-tag">Our Footprint</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-cream)" }}>
            A Sacred Path <span className="gold">Across the World</span>
          </h2>
          <p className="rl-subtitle" style={{ margin: "0 auto" }}>
            From five-star venues in sixteen Indian cities to international sanctums
            across four countries — every Rudralife exhibition is a pilgrimage point.
          </p>
        </div>

        <div className="rl-map-wrap rl-reveal">
          <img src={MAP_URL} alt="World map" className="rl-map-img" />
          <svg
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            {intl.map((d) => (
              <line
                key={`line-${d.id}`}
                x1={mumbai.x} y1={mumbai.y / 2}
                x2={d.x} y2={d.y / 2}
                stroke="#C9920A"
                strokeWidth="0.15"
                strokeDasharray="0.6 0.6"
                opacity="0.6"
              />
            ))}
          </svg>
          {dots.map((d) => (
            <button
              key={d.id}
              className={`rl-map-dot ${d.status}`}
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
              data-testid={`map-dot-${d.id}`}
              aria-label={d.name}
            >
              <span className="label">{d.name}</span>
            </button>
          ))}
        </div>

        <div className="rl-map-legend">
          <div className="item"><span className="sw" style={{ background: "var(--rl-red)" }} /> Active Now</div>
          <div className="item"><span className="sw" style={{ background: "var(--rl-gold)" }} /> Upcoming</div>
          <div className="item"><span className="sw" style={{ background: "rgba(253,248,240,0.5)" }} /> Past Host Cities</div>
        </div>
      </div>
    </section>
  );
}
