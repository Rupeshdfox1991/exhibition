import { useEffect } from "react";

// "2026-04-16" + "2026-04-20" → "16th to 20th April 2026"
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function formatRange(startISO, endISO) {
  if (!startISO) return "Schedule TBA";
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const s = new Date(startISO + "T00:00:00");
  const e = endISO ? new Date(endISO + "T00:00:00") : null;
  const sd = s.getDate(), sm = s.getMonth(), sy = s.getFullYear();
  if (!e) return `${ordinal(sd)} ${months[sm]} ${sy}`;
  const ed = e.getDate(), em = e.getMonth(), ey = e.getFullYear();
  if (sm === em && sy === ey) return `${ordinal(sd)} to ${ordinal(ed)} ${months[sm]} ${sy}`;
  if (sy === ey) return `${ordinal(sd)} ${months[sm]} to ${ordinal(ed)} ${months[em]} ${sy}`;
  return `${ordinal(sd)} ${months[sm]} ${sy} to ${ordinal(ed)} ${months[em]} ${ey}`;
}

export default function EventDetailsModal({ city, onClose, onRegister }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  if (!city) return null;
  const dates = formatRange(city.start_date, city.end_date);
  const mapsQuery = encodeURIComponent([city.venue, city.address].filter(Boolean).join(", "));
  const mapsUrl = mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : null;

  const overlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="rl-modal-overlay" data-testid="event-details-modal" onClick={overlayClick}>
      <div className="rl-modal rl-event-modal" role="dialog" aria-modal="true">
        <button className="rl-modal-close" data-testid="event-details-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="rl-modal-head">
          <span className="rl-badge rl-badge-live" style={{ alignSelf: "flex-start" }}>
            <span className="dot" /> Live Exhibition
          </span>
          <h3 className="rl-modal-title" style={{ marginTop: 10 }}>
            Rudralife in <span className="gold">{city.name}</span>
          </h3>
          <p className="rl-modal-sub">
            An exclusive opportunity to experience authentic, lab-certified Rudraksha under expert guidance.
          </p>
        </div>

        <div className="rl-event-info" data-testid="event-info">
          <div className="rl-event-row">
            <div className="rl-event-icon" aria-hidden="true">📅</div>
            <div>
              <div className="rl-event-label">Dates</div>
              <div className="rl-event-value" data-testid="event-dates">{dates}</div>
            </div>
          </div>

          <div className="rl-event-row">
            <div className="rl-event-icon" aria-hidden="true">🕒</div>
            <div>
              <div className="rl-event-label">Timings</div>
              <div className="rl-event-value" data-testid="event-timings">
                {city.timings || "10:00 AM to 8:00 PM (Sunday Open)"}
              </div>
            </div>
          </div>

          {(city.venue || city.address) && (
            <div className="rl-event-row">
              <div className="rl-event-icon" aria-hidden="true">📍</div>
              <div style={{ minWidth: 0 }}>
                <div className="rl-event-label">Venue</div>
                {city.venue && <div className="rl-event-value" data-testid="event-venue">{city.venue}</div>}
                {city.address && (
                  mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rl-event-maps-link"
                      data-testid="event-maps-link"
                    >
                      {city.address}
                      <span className="rl-event-maps-arrow">↗ Open in Google Maps</span>
                    </a>
                  ) : (
                    <div className="rl-event-value">{city.address}</div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rl-modal-foot rl-event-foot">
          <button className="rl-btn-text" onClick={onClose} data-testid="event-details-cancel">Maybe Later</button>
          <button
            className="rl-btn rl-btn-primary"
            data-testid="event-register-now-btn"
            onClick={() => onRegister(city)}
          >
            Register Now →
          </button>
        </div>
      </div>
    </div>
  );
}
