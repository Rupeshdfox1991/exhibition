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

function CityCard({ city, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  const isLive = city.status === "live";
  return (
    <article
      className="rl-city-card"
      data-testid={`city-card-${city.id}`}
      onClick={() => onClick(city)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(city); }}
    >
      <div className="rl-city-badge-row">
        {isLive ? (
          <>
            <span className="rl-badge rl-badge-live" data-testid={`badge-live-${city.id}`}>
              <span className="dot" /> Live Now
            </span>
            <button
              type="button"
              className="rl-badge rl-badge-cta"
              data-testid={`register-cta-${city.id}`}
              onClick={(e) => { e.stopPropagation(); onClick(city); }}
            >
              Click to Register Now →
            </button>
          </>
        ) : (
          <span className="rl-badge rl-badge-soon" data-testid={`badge-soon-${city.id}`}>Coming Soon</span>
        )}
      </div>
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
        <div className="rl-city-meta">{isLive ? city.dates : "Schedule Upcoming"}</div>
        {isLive && city.venue && <div className="rl-city-venue">📍 {city.venue}</div>}
        <div className="rl-city-action">
          {isLive ? (
            <span className="rl-city-tap" data-testid={`tap-now-${city.id}`}>Tap Now for Registration →</span>
          ) : (
            <span className="rl-city-tap soon" data-testid={`notify-tap-${city.id}`}>Get Notified When We Visit Your City →</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Exhibitions({ onCityClick, onRegister, onNotify }) {
  const [tab, setTab] = useState("domestic");
  const { exhibitions } = useExhibitions();
  const allCities = useMemo(() => exhibitions.map(adaptExhibition), [exhibitions]);
  const sortLiveFirst = (a, b) => {
    if (a.status === b.status) return (a.order ?? 0) - (b.order ?? 0);
    return a.status === "live" ? -1 : 1;
  };
  const domesticCities = useMemo(
    () => allCities.filter((c) => c.type === "domestic").sort(sortLiveFirst),
    [allCities]
  );
  const internationalCities = useMemo(
    () => allCities.filter((c) => c.type === "international").sort(sortLiveFirst),
    [allCities]
  );
  const cities = tab === "domestic" ? domesticCities : internationalCities;

  return (
    <section className="rl-section rl-section-cream" id="exhibitions" data-testid="exhibitions-section">
      <div className="rl-container">
        <div className="rl-exh-head rl-reveal">
          <span className="rl-tag">Current Exhibitions</span>
          <h2 className="rl-heading">Live <span className="gold">Exhibitions</span> Near You</h2>
          <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
            Tap any live city to register instantly. For upcoming locations, leave us a note —
            we'll let you know the moment Rudralife visits your city.
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
              onClick={onCityClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
