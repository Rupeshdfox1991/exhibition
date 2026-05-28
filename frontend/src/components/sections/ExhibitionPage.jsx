// Standalone exhibition page rendered at /exhibition/:slug/*
// - /exhibition/:slug                       → Event details + Register CTA  (or Notify form if coming-soon)
// - /exhibition/:slug/register/(step-1|2|3) → Registration form
// - /exhibition/:slug/thank-you             → Confirmation
// - /exhibition/:slug/coming-soon           → Notify form
// No nav, no other sections — share-friendly for ad campaigns.
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import axios from "axios";
import RegistrationModal from "@/components/sections/RegistrationModal";
import NotifyModal from "@/components/sections/NotifyModal";
import EventDetailsModal from "@/components/sections/EventDetailsModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function NamasteThankYou({ exhibition }) {
  useEffect(() => {
    document.title = `Thank You · Rudralife ${exhibition?.name || "Exhibition"}`;
  }, [exhibition]);
  return (
    <div className="rl-modal-overlay rl-page-overlay" data-testid="thank-you-page">
      <div className="rl-modal">
        <div className="rl-success">
          <div className="tick">✓</div>
          <h3>Registration Confirmed!</h3>
          <div className="rl-success-namaste">Namaste <span className="rl-namaste-emoji">🙏</span></div>
          <p className="rl-success-msg">
            Thank you for registering for the <strong>{exhibition?.name}</strong> Rudralife exhibition.
            Our team will reach out to you on WhatsApp & email with your confirmation shortly.
          </p>
          <p className="rl-success-farewell">We look forward to seeing you at the exhibition.</p>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a className="rl-btn rl-btn-dark" href="/" data-testid="thank-you-home">← Back to Site</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExhibitionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const [exhibition, setExhibition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    axios.get(`${API}/exhibitions/by-slug/${slug}`)
      .then((r) => { if (alive) setExhibition(r.data); })
      .catch((e) => { if (alive) setErr(e?.response?.status === 404 ? "Exhibition not found" : "Could not load exhibition"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  // SEO: set title per exhibition
  useEffect(() => {
    if (exhibition?.name) document.title = `${exhibition.name} · Rudralife Exhibition`;
  }, [exhibition?.name]);

  if (loading) {
    return <div className="rl-standalone-loading" data-testid="exh-loading">Loading exhibition…</div>;
  }
  if (err) {
    return (
      <div className="rl-standalone-error" data-testid="exh-error">
        <h2>{err}</h2>
        <p>The link you opened may have changed.</p>
        <a className="rl-btn rl-btn-primary" href="/">← Back to Rudralife</a>
      </div>
    );
  }
  if (!exhibition) return null;

  // Pretty city object the modals expect (mirrors adaptExhibition shape)
  const city = {
    ...exhibition,
    dateRange: exhibition.start_date && exhibition.end_date
      ? { start: exhibition.start_date, end: exhibition.end_date }
      : null,
  };

  // Path is currently /exhibition/:slug{rest}. Pull rest for routing inside.
  // Determine current sub-route from pathname.
  const path = loc.pathname.replace(`/exhibition/${slug}`, "") || "/";

  const closeToHome = () => navigate("/");
  const goRegister = () => navigate(`/exhibition/${slug}/register`);
  const goThankYou = () => navigate(`/exhibition/${slug}/thank-you`);

  // Coming Soon route
  if (path.startsWith("/coming-soon")) {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-soon">
        <NotifyModal city={city} type={city.type || "domestic"} onClose={closeToHome} />
      </div>
    );
  }

  // Register form (any step) — RegistrationModal handles internal step URL sync.
  if (path.startsWith("/register")) {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-register">
        <RegistrationModal
          exhibition={city}
          slug={slug}
          urlSync
          onClose={() => navigate(`/exhibition/${slug}`)}
          onSubmitted={goThankYou}
        />
      </div>
    );
  }

  if (path.startsWith("/thank-you")) {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-thank">
        <NamasteThankYou exhibition={city} />
      </div>
    );
  }

  // Default: /exhibition/:slug — Event details. Coming-soon cities go straight to notify.
  if (city.status !== "live") {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-default-soon">
        <NotifyModal city={city} type={city.type || "domestic"} onClose={closeToHome} />
      </div>
    );
  }
  return (
    <div className="rl-standalone-bg" data-testid="exh-standalone-default-live">
      <EventDetailsModal
        city={city}
        onClose={closeToHome}
        onRegister={() => goRegister()}
      />
    </div>
  );
}
