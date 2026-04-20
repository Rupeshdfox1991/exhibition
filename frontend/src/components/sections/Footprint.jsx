import { useState } from "react";
import { domesticCities } from "@/data/exhibitions";

const countries = [
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    summary: "16 Cities · Flagship Exhibitions",
    img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80",
    expandable: true,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    summary: "Dubai · Sacred Consultations",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    summary: "London · International Previews",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80",
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    summary: "Marina Bay · Private Sessions",
    img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&q=80",
  },
  {
    code: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    summary: "Kuala Lumpur · Seekers Meet",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600&q=80",
  },
];

const LOGO_MARK =
  "https://customer-assets.emergentagent.com/job_b271b1af-1da5-4630-96e0-320d96eb6add/artifacts/pm9yuvf5_New%20Rudralife%20final%20logo%20with%20tagline%20%28White%29%20%281%29.png";

export default function Footprint() {
  const [openIndia, setOpenIndia] = useState(false);

  return (
    <section className="rl-map-section" id="footprint" data-testid="footprint-section">
      <div className="rl-container">
        <div style={{ textAlign: "center" }} className="rl-reveal">
          <span className="rl-tag">Our Footprint</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-cream)" }}>
            Our Global <span className="gold">Presence</span>
          </h2>
          <p className="rl-subtitle" style={{ margin: "0 auto" }}>
            Hosted in five-star venues across India and at private sanctums worldwide —
            Rudralife exhibitions arrive where seekers are.
          </p>
        </div>

        <div className="rl-country-grid rl-reveal">
          {countries.map((c) => (
            <div
              key={c.code}
              className={`rl-country-card ${c.expandable ? "expandable" : ""} ${openIndia && c.expandable ? "open" : ""}`}
              data-testid={`country-${c.code.toLowerCase()}`}
              onClick={() => c.expandable && setOpenIndia(!openIndia)}
              role={c.expandable ? "button" : undefined}
              tabIndex={c.expandable ? 0 : -1}
              onKeyDown={(e) => { if (c.expandable && e.key === "Enter") setOpenIndia(!openIndia); }}
            >
              <div className="rl-country-img" style={{ backgroundImage: `url(${c.img})` }} />
              <div className="rl-country-flag-row">
                <span className="rl-country-flag">{c.flag}</span>
                <div className="rl-rl-mark" title="Rudralife presence">
                  <img src={LOGO_MARK} alt="Rudralife" />
                </div>
              </div>
              <div className="rl-country-body">
                <h3>{c.name}</h3>
                <div className="rl-country-sum">{c.summary}</div>
                {c.expandable && (
                  <div className="rl-country-cta">
                    {openIndia ? "Hide Cities ↑" : "Explore Cities ↓"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {openIndia && (
          <div className="rl-country-expand" data-testid="india-cities-expand">
            <div className="rl-country-expand-head">
              <span>🇮🇳 India · Domestic Exhibition Cities</span>
              <span>{domesticCities.length} Cities</span>
            </div>
            <div className="rl-city-chip-grid">
              {domesticCities.map((city) => (
                <div
                  key={city.id}
                  className={`rl-city-chip ${city.status === "live" ? "live" : ""}`}
                  data-testid={`chip-${city.id}`}
                >
                  <span className="rl-city-chip-dot" />
                  <span className="rl-city-chip-name">{city.name}</span>
                  {city.status === "live" && (
                    <span className="rl-city-chip-badge">Live</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* World map with 5 presence pins */}
        <div className="rl-worldmap-wrap rl-reveal" data-testid="world-map">
          <div className="rl-worldmap-caption">
            <span className="rl-tag" style={{ color: "var(--rl-gold)" }}>Five Countries · One Tradition</span>
          </div>
          <div className="rl-worldmap-inner">
            <img
              src="https://customer-assets.emergentagent.com/job_sacred-rudraksha-hub/artifacts/igwpit0x_image.png"
              alt="World map of Rudralife presence"
              className="rl-worldmap-img"
              loading="lazy"
            />
            {/* Pins — positions are % of map width/height */}
            {[
              { id: "in", name: "India",     x: 71.5, y: 51 },
              { id: "ae", name: "UAE",       x: 64,   y: 49 },
              { id: "gb", name: "UK",        x: 49,   y: 33 },
              { id: "sg", name: "Singapore", x: 77.5, y: 63 },
              { id: "my", name: "Malaysia", x: 78.2, y: 60.5 },
            ].map((p) => (
              <span
                key={p.id}
                className="rl-worldmap-pin"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                data-testid={`worldmap-pin-${p.id}`}
              >
                <span className="rl-worldmap-pulse" />
                <span className="rl-worldmap-dot" />
                <span className="rl-worldmap-label">{p.name}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="rl-map-legend" style={{ marginTop: 36 }}>
          <div className="item"><span className="sw" style={{ background: "var(--rl-red)" }} /> Live Now</div>
          <div className="item"><span className="sw" style={{ background: "var(--rl-gold)" }} /> Upcoming</div>
          <div className="item"><span className="sw" style={{ background: "rgba(253,248,240,0.5)" }} /> Past Host Cities</div>
        </div>
      </div>
    </section>
  );
}
