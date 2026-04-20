import { useMemo, useState } from "react";
import { domesticCities, internationalCities, allCities } from "@/data/exhibitions";

const PlaceholderImg = ({ name }) => (
  <div className="rl-city-img" style={{ background: "linear-gradient(135deg, #2A1708 0%, #0D0702 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(201,146,10,0.35)", fontSize: 64 }}>
      {name?.[0] || "•"}
    </span>
  </div>
);

function CityCard({ city, onClick, active }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <article
      className={`rl-city-card ${active ? "active" : ""}`}
      data-testid={`city-card-${city.id}`}
      onClick={() => onClick(city)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(city); }}
    >
      {city.status === "live" ? (
        <span className="rl-badge rl-badge-live" data-testid={`badge-live-${city.id}`}>
          <span className="dot" /> Live Now
        </span>
      ) : (
        <span className="rl-badge rl-badge-soon" data-testid={`badge-soon-${city.id}`}>Coming Soon</span>
      )}
      {imgErr ? (
        <PlaceholderImg name={city.name} />
      ) : (
        <>
          <div
            className="rl-city-img"
            style={{ backgroundImage: `url(${city.image})` }}
          />
          <img
            src={city.image}
            alt=""
            onError={() => setImgErr(true)}
            style={{ display: "none" }}
          />
        </>
      )}
      <div className="rl-city-body">
        <h3 className="rl-city-name">{city.name}</h3>
        {city.status === "live" ? (
          <div className="rl-city-meta">{city.dates}</div>
        ) : (
          <div className="rl-city-meta">Schedule Upcoming</div>
        )}
      </div>
    </article>
  );
}

export default function Exhibitions({ selectedCityId, onCityClick, onRegister }) {
  const [tab, setTab] = useState("domestic");
  const cities = tab === "domestic" ? domesticCities : internationalCities;
  const selected = useMemo(() => allCities.find((c) => c.id === selectedCityId && c.status === "live"), [selectedCityId]);

  return (
    <section className="rl-section rl-section-cream" id="exhibitions" data-testid="exhibitions-section">
      <div className="rl-container">
        <div className="rl-exh-head rl-reveal">
          <span className="rl-tag">Current Exhibitions</span>
          <h2 className="rl-heading">Live <span className="gold">Exhibitions</span> Near You</h2>
          <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
            Sixteen Indian cities. Four international destinations. Every exhibition hosted in
            curated five-star venues with our panel of Vedic experts on-site.
          </p>
        </div>

        <div className="rl-tabs rl-reveal" role="tablist">
          <button
            className={`rl-tab ${tab === "domestic" ? "active" : ""}`}
            onClick={() => setTab("domestic")}
            data-testid="tab-domestic"
            role="tab"
            aria-selected={tab === "domestic"}
          >
            <span>🇮🇳</span> Domestic
          </button>
          <button
            className={`rl-tab ${tab === "international" ? "active" : ""}`}
            onClick={() => setTab("international")}
            data-testid="tab-international"
            role="tab"
            aria-selected={tab === "international"}
          >
            <span>🌐</span> International
          </button>
        </div>

        <div className="rl-city-grid rl-reveal" data-testid="city-grid">
          {cities.map((c) => (
            <CityCard
              key={c.id}
              city={c}
              active={selectedCityId === c.id}
              onClick={onCityClick}
            />
          ))}
        </div>

        {selected && (
          <div className="rl-exh-detail" id="exh-detail" data-testid={`exh-detail-${selected.id}`}>
            <div
              className="rl-exh-detail-hero"
              style={{ backgroundImage: `url(${selected.image})` }}
            >
              <span className="rl-exh-detail-live"><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} /> Live Now</span>
              <h3 className="city">{selected.name}</h3>
            </div>
            <div className="rl-exh-detail-body">
              <div className="rl-exh-info-grid">
                <div className="rl-info-block">
                  <div className="lbl">📅 Dates</div>
                  <div className="val">{selected.dates}</div>
                </div>
                <div className="rl-info-block">
                  <div className="lbl">⏰ Timings</div>
                  <div className="val">{selected.timings}</div>
                </div>
                <div className="rl-info-block">
                  <div className="lbl">📍 Venue</div>
                  <a
                    className="val rl-maps-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.venue + ", " + selected.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`venue-link-${selected.id}`}
                  >
                    {selected.venue} <span className="rl-maps-ext">↗</span>
                  </a>
                </div>
                <div className="rl-info-block">
                  <div className="lbl">🗺 Address</div>
                  <a
                    className="val rl-maps-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.venue + ", " + selected.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`address-link-${selected.id}`}
                  >
                    {selected.address} <span className="rl-maps-ext">↗</span>
                  </a>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.venue + ", " + selected.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rl-venue-box rl-venue-box-link"
                data-testid={`venue-box-link-${selected.id}`}
              >
                <div className="lbl">Sacred Sanctum · Open in Google Maps ↗</div>
                <div className="val">{selected.venue}</div>
                <div className="addr">{selected.address}</div>
              </a>
              <button
                className="rl-btn rl-btn-primary"
                data-testid={`register-now-${selected.id}`}
                onClick={() => onRegister(selected)}
              >
                Register Now →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
