import { useEffect, useState } from "react";
import "@/App.css";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Exhibitions from "@/components/sections/Exhibitions";
import RegistrationModal from "@/components/sections/RegistrationModal";
import Footprint from "@/components/sections/Footprint";
import Collection from "@/components/sections/Collection";
import Experts from "@/components/sections/Experts";
import SeekersWorldwide from "@/components/sections/Testimonials";
import VideoTestimonials from "@/components/sections/VideoTestimonials";
import InMedia from "@/components/sections/InMedia";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";

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
      // Fire as soon as any part of the element enters the viewport —
      // required for tall elements (e.g. 16-card city grid on mobile).
      { threshold: 0, rootMargin: "0px 0px -5% 0px" }
    );
    els.forEach((el) => io.observe(el));

    // Safety-net: if IntersectionObserver hasn't fired for any reveal within 2s
    // of the element existing in the DOM (rare mobile browser timing issue),
    // force them visible so the grid is never blank.
    const failsafe = setTimeout(() => {
      document.querySelectorAll(".rl-reveal:not(.in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 200) el.classList.add("in");
      });
    }, 1200);

    return () => { io.disconnect(); clearTimeout(failsafe); };
  }, []);
}

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);

  useReveal();

  const openRegistration = (exhibition) => {
    setSelectedExhibition(exhibition || null);
    setModalOpen(true);
  };

  const handleCityClick = (city) => {
    if (city.status === "live") {
      setSelectedCityId(city.id);
      setTimeout(() => {
        const el = document.getElementById("exh-detail");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  };

  const scrollToExhibitions = () => {
    const el = document.getElementById("exhibitions");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="App">
      <Navbar onRegister={() => openRegistration(null)} />
      <Hero
        onRegister={scrollToExhibitions}
        onKnowMore={() => {
          const el = document.getElementById("about");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <Exhibitions
        selectedCityId={selectedCityId}
        onCityClick={handleCityClick}
        onRegister={openRegistration}
      />
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
      {modalOpen && (
        <RegistrationModal
          exhibition={selectedExhibition}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
