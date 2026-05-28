import { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import "@/App.css";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Exhibitions from "@/components/sections/Exhibitions";
import RegistrationModal from "@/components/sections/RegistrationModal";
import NotifyModal from "@/components/sections/NotifyModal";
import EventDetailsModal from "@/components/sections/EventDetailsModal";
import Footprint from "@/components/sections/Footprint";
import WhyVisit from "@/components/sections/WhyVisit";
import Collection from "@/components/sections/Collection";
import Experts from "@/components/sections/Experts";
import SeekersWorldwide from "@/components/sections/Testimonials";
import VideoTestimonials from "@/components/sections/VideoTestimonials";
import InMedia from "@/components/sections/InMedia";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import AdminLogin from "@/admin/AdminLogin";
import AdminDashboard from "@/admin/AdminDashboard";
import ProtectedRoute from "@/admin/ProtectedRoute";
import ExhibitionPage from "@/components/sections/ExhibitionPage";
import { SiteContentProvider } from "@/SiteContent";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Public exhibitions context — fetched once and shared by Exhibitions + RegistrationModal
export const ExhibitionsContext = createContext({ exhibitions: [], loading: true });
export const useExhibitions = () => useContext(ExhibitionsContext);

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".rl-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" }
    );
    els.forEach((el) => io.observe(el));
    const failsafe = setTimeout(() => {
      document.querySelectorAll(".rl-reveal:not(.in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 200) el.classList.add("in");
      });
    }, 1200);
    return () => { io.disconnect(); clearTimeout(failsafe); };
  }, []);
}

function Landing() {
  const navigate = useNavigate();
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useReveal();

  useEffect(() => {
    let alive = true;
    const fetchEx = async () => {
      try {
        const { data } = await axios.get(`${API}/exhibitions`);
        if (alive) setExhibitions(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setExhibitions([]);
      } finally { if (alive) setLoading(false); }
    };
    fetchEx();
    const t = setInterval(fetchEx, 30000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  // Per-exhibition deep linking — clicking a city navigates to /exhibition/:slug
  // which renders the standalone ExhibitionPage (no nav, no other sections).
  const handleCityClick = (city) => {
    if (!city) return;
    const slug = city.slug || (city.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (city.status === "live") {
      navigate(`/exhibition/${slug}`);
    } else {
      navigate(`/exhibition/${slug}/coming-soon`);
    }
  };

  const scrollToExhibitions = () => {
    const el = document.getElementById("exhibitions");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ExhibitionsContext.Provider value={{ exhibitions, loading }}>
      <div className="App">
        <Navbar onRegister={scrollToExhibitions} />
        <Hero
          onRegister={scrollToExhibitions}
          onKnowMore={scrollToExhibitions}
        />
        <Exhibitions onCityClick={handleCityClick} />
        <WhyVisit />
        <Footprint />
        <Collection />
        <Experts />
        <SeekersWorldwide />
        <VideoTestimonials />
        <InMedia />
        <Stats />
        <About />
        <FAQ />
        <Footer
          onNav={(id) => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>
    </ExhibitionsContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteContentProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          {/* Standalone per-exhibition pages — ad-friendly shareable URLs.
              /exhibition/:slug                    → event details + register CTA (live) or notify form (soon)
              /exhibition/:slug/register           → registration form step 1
              /exhibition/:slug/register/contact   → step 2
              /exhibition/:slug/register/details   → step 3
              /exhibition/:slug/thank-you          → confirmation
              /exhibition/:slug/coming-soon        → notify-me form */}
          <Route path="/exhibition/:slug/*" element={<ExhibitionPage />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </SiteContentProvider>
    </BrowserRouter>
  );
}
