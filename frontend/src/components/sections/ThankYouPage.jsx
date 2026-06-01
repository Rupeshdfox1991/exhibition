// Universal Thank-You page — single URL `/exhibition/thank-you` for EVERY exhibition,
// both Live registrations and Coming-Soon notify submissions. Marketing-friendly:
// admins can pixel-track this single conversion URL across all campaigns.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WHATSAPP_NUMBER = "917208819922";
const WHATSAPP_MSG =
  "Namaste 🙏 I have just registered for the Rudralife Exhibition. Looking forward to connecting with your team.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

export default function ThankYouPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Thank You · Rudralife";
  }, []);

  return (
    <div className="rl-standalone-bg" data-testid="exhibition-thank-you">
      <div className="rl-modal-overlay rl-page-overlay">
        <div className="rl-modal rl-thanks-modal">
          <button
            className="rl-modal-close"
            onClick={() => navigate("/")}
            aria-label="Close"
            data-testid="thanks-close-x"
          >
            ✕
          </button>

          <div className="rl-thanks-tick">
            <div className="tick">✓</div>
          </div>

          <h2 className="rl-thanks-title">
            Registration Confirmed! <span className="rl-thanks-celebrate">🎉</span>
          </h2>
          <div className="rl-thanks-namaste">
            Namaste <span className="rl-thanks-praying">🙏</span>
          </div>

          <p className="rl-thanks-body">
            Thank you for registering for the <strong>Rudralife Exhibition</strong>.
            Your registration has been successfully confirmed.
          </p>
          <p className="rl-thanks-body">
            We look forward to welcoming you and helping you explore our authentic
            Rudraksha collection, spiritual products, and special exhibition offers.
          </p>
          <p className="rl-thanks-body rl-thanks-tagline">See you at the exhibition!</p>

          <p className="rl-thanks-regards">
            <em>Team Rudralife</em> <span className="rl-thanks-praying">🙏✨</span>
          </p>

          <div className="rl-thanks-actions">
            <a
              className="rl-btn rl-btn-primary"
              href={WHATSAPP_URL}
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
