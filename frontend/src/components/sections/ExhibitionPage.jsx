// Standalone exhibition page rendered at /exhibition/:slug
// - /exhibition/:slug                  → Event details + Register CTA  (or Notify form if coming-soon)
// - /exhibition/:slug/register         → Registration form  (URL stays STATIC across all 3 steps)
// - /exhibition/:slug/coming-soon      → Notify-me form
//
// On submit (both register + notify), modals save to sessionStorage and navigate to
// the universal /exhibition/thank-you (one URL for all exhibitions, marketing-friendly).
// No nav, no other sections — share-friendly for ad campaigns.
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import RegistrationModal from "@/components/sections/RegistrationModal";
import NotifyModal from "@/components/sections/NotifyModal";
import EventDetailsModal from "@/components/sections/EventDetailsModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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

  // Format dates for the modal (matches landing-page adaptExhibition output)
  const formatRange = (s, e) => {
    if (!s || !e) return "";
    const opts = { day: "numeric", month: "long", year: "numeric" };
    return `${new Date(s).toLocaleDateString("en-IN", opts)} – ${new Date(e).toLocaleDateString("en-IN", opts)}`;
  };

  // Shape the modal expects (mirrors adaptExhibition)
  const city = {
    ...exhibition,
    dates: formatRange(exhibition.start_date, exhibition.end_date) || "Schedule TBA",
    dateRange: exhibition.start_date && exhibition.end_date
      ? { start: exhibition.start_date, end: exhibition.end_date }
      : null,
  };

  const path = loc.pathname.replace(`/exhibition/${slug}`, "") || "/";

  const closeToHome = () => navigate("/");
  const goRegister = () => navigate(`/exhibition/${slug}/register`);

  // Coming-soon notify form
  if (path.startsWith("/coming-soon")) {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-soon">
        <NotifyModal city={city} type={city.type || "domestic"} urlSync onClose={closeToHome} />
      </div>
    );
  }

  // Register form — URL stays static at /exhibition/:slug/register across all 3 steps
  if (path.startsWith("/register")) {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-register">
        <RegistrationModal
          exhibition={city}
          slug={slug}
          urlSync
          onClose={() => navigate(`/exhibition/${slug}`)}
        />
      </div>
    );
  }

  // Default: /exhibition/:slug — Event details. Coming-soon cities go straight to notify.
  if (city.status !== "live") {
    return (
      <div className="rl-standalone-bg" data-testid="exh-standalone-default-soon">
        <NotifyModal city={city} type={city.type || "domestic"} urlSync onClose={closeToHome} />
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
