import { useState, useMemo } from "react";
import { useExhibitions } from "@/App";
import { useSiteContent, pick } from "@/SiteContent";
const DEFAULT_MAP_URL =`${process.env.PUBLIC_URL}/images/dghkanxm_image.png`;

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
  const { exhibitions } = useExhibitions();
  const { content } = useSiteContent();
  const tag = pick(content, "global_presence.tag", "Our Footprint");
  const titleLine = pick(content, "global_presence.title", "Our Global");
  const highlight = pick(content, "global_presence.title_highlight", "Presence");
  const subtitle = pick(content, "global_presence.subtitle", "Five countries. One unbroken tradition. Hosted in five-star venues and private sanctums worldwide.");
  const MAP_URL = pick(content, "global_presence.map_image", DEFAULT_MAP_URL);
  if (pick(content, "section_visibility.global_presence", true) === false) return null;

  return (
    <section className="rl-map-section" id="footprint" data-testid="footprint-section">
      <div className="rl-container">
        <div style={{ textAlign: "center" }} className="rl-reveal">
          <span className="rl-tag">{tag}</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-cream)" }}>
            {titleLine} <span className="gold">{highlight}</span>
          </h2>
          <p className="rl-subtitle" style={{ margin: "0 auto" }}>
            {subtitle}
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
              return (
                <span
                  key={p.id}
                  className="rl-worldmap-pin static"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  data-testid={`worldmap-pin-${p.id}`}
                  aria-label={p.name}
                >
                  <span className="rl-worldmap-pulse" />
                  <span className="rl-worldmap-dot" />
                  <span className="rl-worldmap-label">{p.name}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="rl-map-legend" style={{ marginTop: 36 }}>
          <div className="item"><span className="sw" style={{ background: "var(--rl-gold)" }} /> Exhibition Presence</div>
          <div className="item"><span className="sw" style={{ background: "rgba(253,248,240,0.5)" }} /> Upcoming Cities</div>
        </div>
      </div>
    </section>
  );
}
