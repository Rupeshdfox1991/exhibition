import { useState, useMemo } from "react";
import { useExhibitions } from "@/App";

const MAP_URL =
  "https://customer-assets.emergentagent.com/job_sacred-rudraksha-hub/artifacts/dghkanxm_image.png";

/*
 * Pin positions calibrated for the uploaded globe projection
 * (Robinson/oval map centred roughly on 20°E).
 * Values are % of the map container: { x: left%, y: top% }.
 */
const pins = [
  { id: "gb", name: "United Kingdom", x: 47.0, y: 24.0 },
  { id: "ae", name: "UAE",            x: 62.0, y: 38.0 },
  { id: "in", name: "India",          x: 68.5, y: 40.0 },
  { id: "my", name: "Malaysia",       x: 77.0, y: 49.5 },
  { id: "sg", name: "Singapore",      x: 77.8, y: 51.5 },
];

export default function Footprint() {
  const [openIndia, setOpenIndia] = useState(false);
  const { exhibitions } = useExhibitions();
  const domesticCities = useMemo(() => exhibitions.filter((e) => e.type === "domestic"), [exhibitions]);

  return (
    <section className="rl-map-section" id="footprint" data-testid="footprint-section">
      <div className="rl-container">
        <div style={{ textAlign: "center" }} className="rl-reveal">
          <span className="rl-tag">Our Footprint</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-cream)" }}>
            Our Global <span className="gold">Presence</span>
          </h2>
          <p className="rl-subtitle" style={{ margin: "0 auto" }}>
            Five countries. One unbroken tradition. Hosted in five-star venues and private sanctums worldwide.
          </p>
        </div>

        <div className="rl-worldmap-wrap rl-reveal" data-testid="world-map">
          <div className="rl-worldmap-inner">
            <img
              src={MAP_URL}
              alt="World map of Rudralife presence"
              className="rl-worldmap-img"
              loading="lazy"
            />
            {pins.map((p) => {
              const isIndia = p.id === "in";
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`rl-worldmap-pin ${isIndia && openIndia ? "active" : ""} ${isIndia ? "clickable" : ""}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onClick={() => { if (isIndia) setOpenIndia(!openIndia); }}
                  data-testid={`worldmap-pin-${p.id}`}
                  aria-label={p.name}
                >
                  <span className="rl-worldmap-pulse" />
                  <span className="rl-worldmap-dot" />
                  <span className="rl-worldmap-label">
                    {p.name}{isIndia ? (openIndia ? " · Hide" : " · Tap") : ""}
                  </span>
                </button>
              );
            })}
          </div>
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

        <div className="rl-map-legend" style={{ marginTop: 36 }}>
          <div className="item"><span className="sw" style={{ background: "var(--rl-gold)" }} /> Exhibition Presence</div>
          <div className="item"><span className="sw" style={{ background: "var(--rl-red)" }} /> Live Now (in India)</div>
          <div className="item"><span className="sw" style={{ background: "rgba(253,248,240,0.5)" }} /> Upcoming Cities</div>
        </div>
      </div>
    </section>
  );
}
