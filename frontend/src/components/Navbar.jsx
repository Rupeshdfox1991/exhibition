import { useEffect, useState } from "react";
import { useSiteContent, pick } from "@/SiteContent";

const DEFAULT_LOGO =`${process.env.PUBLIC_URL}/images/logo.png`;
export default function Navbar({ onRegister }) {
  const [scrolled, setScrolled] = useState(false);
  const { content } = useSiteContent();
  const logo = pick(content, "navbar.logo", DEFAULT_LOGO);
  const menu = pick(content, "navbar.menu", [
    { label: "About", target: "about" },
    { label: "Exhibitions", target: "exhibitions" },
    { label: "Collection", target: "collection" },
    { label: "Experts", target: "experts" },
    { label: "FAQ", target: "faq" },
  ]);
  const ctaLabel = pick(content, "navbar.cta", "Register");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (target) => {
    if (!target) return;
    if (/^https?:/i.test(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`rl-nav ${scrolled ? "scrolled" : ""}`} data-testid="rl-navbar">
      <div className="rl-nav-inner">
        <a href="#" className="rl-nav-logo" data-testid="rl-logo-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <img src={logo} alt="Rudralife" />
        </a>
        <div className="rl-nav-links">
          {menu.map((m, i) => (
            <button
              className="rl-nav-link"
              data-testid={`nav-${(m.target || m.label || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              key={i}
              onClick={() => go(m.target || "")}
            >
              {m.label}
            </button>
          ))}
          <button className="rl-nav-cta" data-testid="nav-register-btn" onClick={onRegister}>{ctaLabel}</button>
        </div>
      </div>
    </nav>
  );
}
