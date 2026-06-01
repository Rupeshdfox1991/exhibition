// Standalone exhibition page rendered at /exhibition/:slug
// URL stays EXACTLY /exhibition/:slug for the entire flow:
//   - Live exhibition: Event Details → click "Register Now" → 3-step Registration form  (URL never changes)
//   - Coming Soon exhibition: Notify-Me form                                              (URL never changes)
// On submit, modals save to sessionStorage and navigate to the universal /exhibition/thank-you
// (one URL for ALL exhibitions — marketing-friendly single conversion URL).
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import RegistrationModal from "@/components/sections/RegistrationModal";
import NotifyModal from "@/components/sections/NotifyModal";
import EventDetailsModal from "@/components/sections/EventDetailsModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ExhibitionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  // Internal view state — does NOT touch the URL.
  const [view, setView] = useState("details"); // "details" | "register"

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setView("details");
    axios.get(`${API}/exhibitions/by-slug/${slug}`)
      .then((r) => { if (alive) setExhibition(r.data); })
      .catch((e) => { if (alive) setErr(e?.response?.status === 404 ? "Exhibition not found" : "Could not load exhibition"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

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

  // Format dates for the modal (matches landing-page adaptExhibition output)
  const formatRange = (s, e) => {
    if (!s || !e) return "";
    const opts = { day: "numeric", month: "long", year: "numeric" };
    return `${new Date(s).toLocaleDateString("en-IN", opts)} – ${new Date(e).toLocaleDateString("en-IN", opts)}`;
  };

  const city = {
    ...exhibition,
    dates: formatRange(exhibition.start_date, exhibition.end_date) || "Schedule TBA",
    dateRange: exhibition.start_date && exhibition.end_date
      ? { start: exhibition.start_date, end: exhibition.end_date }
      : null,
  };

  const closeToHome = () => navigate("/");

  // Coming-soon → Notify form immediately (URL stays /exhibition/:slug)
  if (city.status !== "live") {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-soon">
        <NotifyModal city={city} type={city.type || "domestic"} urlSync onClose={closeToHome} />
      </div>
    );
  }

  // Live → either Event Details OR Registration form, both at the SAME URL.
  if (view === "register") {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-register">
        <RegistrationModal
          exhibition={city}
          slug={slug}
          urlSync
          onClose={() => setView("details")}
        />
      </div>
    );
  }

  return (
    <div className="rl-standalone-bg" data-testid="exh-standalone-default-live">
      <EventDetailsModal
        city={city}
        onClose={closeToHome}
        onRegister={() => setView("register")}
      />
    </div>
  );
}
