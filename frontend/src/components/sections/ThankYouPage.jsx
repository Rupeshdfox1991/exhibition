// Universal Thank-You page. Same URL for ALL exhibitions — content driven by
// data left in sessionStorage by the modal on submit. Marketing-friendly:
// admins can pixel-track /exhibition/thank-you as a single conversion URL.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WHATSAPP_NUMBER = "917208819922"; // matches footer default

function buildWhatsAppUrl(record) {
  const exhName = record?.exhibition_name || "the exhibition";
  const msg = record?.kind === "notify"
    ? `Namaste 🙏 I registered my interest for ${exhName}. Could you please confirm once it is announced?`
    : `Namaste 🙏 I have registered for ${exhName} on ${record?.visit_date || "the upcoming visit date"}. My name is ${record?.full_name || ""}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function ThankYouPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("rl_last_submission");
      if (raw) setData(JSON.parse(raw));
    } catch {}
    document.title = "Thank You · Rudralife";
  }, []);

  const isNotify = data?.kind === "notify";
  const exhName = data?.exhibition_name || "your selected exhibition";
  const mapsUrl = data?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([data.venue, data.address].filter(Boolean).join(", "))}`
    : null;

  return (
    <div className="rl-standalone-bg" data-testid="exhibition-thank-you">
      <div className="rl-modal-overlay rl-page-overlay">
        <div className="rl-modal rl-thanks-modal">
          <button className="rl-modal-close" onClick={() => navigate("/")} aria-label="Close" data-testid="thanks-close-x">✕</button>

          <div className="rl-thanks-tick">
            <div className="tick">✓</div>
          </div>

          <h2 className="rl-thanks-title">
            {isNotify ? "We Have Your Interest!" : "Registration Confirmed!"}
          </h2>
          <div className="rl-thanks-namaste">Namaste <span className="rl-thanks-praying">🙏</span></div>

          {isNotify ? (
            <>
              <p className="rl-thanks-body">
                Thank you{data?.full_name ? <>, <strong>{data.full_name.split(" ")[0]}</strong></> : ""}, for showing interest in the upcoming
                {" "}<strong>{exhName}</strong> exhibition.
              </p>
              <p className="rl-thanks-body">
                Rudralife is preparing to visit your city very soon. The moment dates are
                finalised, we will notify you on WhatsApp and email — so you can plan
                your darshan with our panel of experts.
              </p>
            </>
          ) : (
            <>
              <p className="rl-thanks-body">
                Thank you{data?.full_name ? <>, <strong>{data.full_name.split(" ")[0]}</strong></> : ""}, for registering for our exhibition.
                We are delighted to have you with us.
              </p>
              <p className="rl-thanks-body">
                Your reserved consultation slot is noted below. Our team will reach out
                to you shortly with a confirmation on WhatsApp &amp; email.
              </p>
            </>
          )}

          {!isNotify && (
            <div className="rl-thanks-pass" data-testid="thanks-pass">
              <div className="rl-thanks-pass-head">
                <span className="rl-thanks-pass-label">Your Exhibition Pass</span>
                <span className="rl-thanks-pass-city">{data?.exhibition_city || exhName}</span>
              </div>
              <div className="rl-thanks-pass-grid">
                <div>
                  <div className="rl-thanks-k">Exhibition</div>
                  <div className="rl-thanks-v">Rudralife · {data?.exhibition_city || exhName}</div>
                </div>
                <div>
                  <div className="rl-thanks-k">Visit Date</div>
                  <div className="rl-thanks-v">{data?.visit_date || "—"}</div>
                </div>
                <div>
                  <div className="rl-thanks-k">Timings</div>
                  <div className="rl-thanks-v">{data?.timings || "—"}</div>
                </div>
                <div>
                  <div className="rl-thanks-k">Full Schedule</div>
                  <div className="rl-thanks-v">{data?.dates || "—"}</div>
                </div>
                {data?.venue && (
                  <div className="rl-thanks-pass-wide">
                    <div className="rl-thanks-k">Venue · Hotel</div>
                    <div className="rl-thanks-v">{data.venue}</div>
                  </div>
                )}
                {data?.address && (
                  <div className="rl-thanks-pass-wide">
                    <div className="rl-thanks-k">Address</div>
                    <div className="rl-thanks-v">{data.address}</div>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rl-thanks-maps"
                        data-testid="thanks-open-in-maps"
                      >
                        ↗ Open in Maps
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="rl-thanks-body" style={{ marginTop: isNotify ? 24 : 28 }}>
            If you have any questions, feel free to reach out to us anytime.<br />
            {isNotify
              ? "We are honored by your interest in Rudralife."
              : "We look forward to seeing you at the exhibition."}
          </p>
          <p className="rl-thanks-regards">
            Warm regards,<br />
            <em>Team Rudralife</em>
          </p>

          <div className="rl-thanks-actions">
            <a
              className="rl-btn rl-btn-primary"
              href={buildWhatsAppUrl(data)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="thanks-whatsapp-btn"
            >
              WhatsApp Us ↗
            </a>
            <button
              className="rl-btn-text"
              onClick={() => navigate("/")}
              data-testid="thanks-close-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
