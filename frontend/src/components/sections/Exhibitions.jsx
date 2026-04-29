import { useMemo, useState } from "react";
import { useExhibitions } from "@/App";

// "2026-04-16" + "2026-04-20" → "16th to 20th April 2026"
function ordinal(n) {
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function formatRange(startISO, endISO) {
  if (!startISO) return "";
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const s = new Date(startISO + "T00:00:00");
  const e = endISO ? new Date(endISO + "T00:00:00") : null;
  const sd = s.getDate(), sm = s.getMonth(), sy = s.getFullYear();
  if (!e) return `${ordinal(sd)} ${months[sm]} ${sy}`;
  const ed = e.getDate(), em = e.getMonth(), ey = e.getFullYear();
  if (sm === em && sy === ey) return `${ordinal(sd)} to ${ordinal(ed)} ${months[sm]} ${sy}`;
  if (sy === ey) return `${ordinal(sd)} ${months[sm]} to ${ordinal(ed)} ${months[em]} ${sy}`;
  return `${ordinal(sd)} ${months[sm]} ${sy} to ${ordinal(ed)} ${months[em]} ${ey}`;
}
export function adaptExhibition(ex) {
  return {
    ...ex,
    dates: formatRange(ex.start_date, ex.end_date) || "Schedule TBA",
    dateRange: ex.start_date && ex.end_date ? { start: ex.start_date, end: ex.end_date } : null,
  };
}

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
      <div className="rl-city-img-wrap">
        {!imgErr && (
          <img
            src={city.image}
            alt={city.name}
            className="rl-city-img-el"
            loading="lazy"
            decoding="async"
            onError={() => setImgErr(true)}
          />
        )}
        {imgErr && (
          <div className="rl-city-fallback">
            <span>{city.name?.[0] || "•"}</span>
          </div>
        )}
      </div>
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
  const { exhibitions } = useExhibitions();
  const allCities = useMemo(() => exhibitions.map(adaptExhibition), [exhibitions]);
  const domesticCities = useMemo(() => allCities.filter((c) => c.type === "domestic"), [allCities]);
  const internationalCities = useMemo(() => allCities.filter((c) => c.type === "international"), [allCities]);
  const cities = tab === "domestic" ? domesticCities : internationalCities;
  const selected = useMemo(() => allCities.find((c) => c.id === selectedCityId && c.status === "live"), [selectedCityId, allCities]);

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
