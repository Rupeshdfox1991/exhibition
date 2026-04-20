import { useEffect, useState } from "react";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_b271b1af-1da5-4630-96e0-320d96eb6add/artifacts/pm9yuvf5_New%20Rudralife%20final%20logo%20with%20tagline%20%28White%29%20%281%29.png";

export default function Navbar({ onRegister }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`rl-nav ${scrolled ? "scrolled" : ""}`} data-testid="rl-navbar">
      <div className="rl-nav-inner">
        <a href="#" className="rl-nav-logo" data-testid="rl-logo-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <img src={LOGO_URL} alt="Rudralife" />
        </a>
        <div className="rl-nav-links">
          <button className="rl-nav-link" data-testid="nav-about" onClick={() => go("about")}>About</button>
          <button className="rl-nav-link" data-testid="nav-exhibitions" onClick={() => go("exhibitions")}>Exhibitions</button>
          <button className="rl-nav-link" data-testid="nav-collection" onClick={() => go("collection")}>Collection</button>
          <button className="rl-nav-link" data-testid="nav-experts" onClick={() => go("experts")}>Experts</button>
          <button className="rl-nav-link" data-testid="nav-faq" onClick={() => go("faq")}>FAQ</button>
          <button className="rl-nav-cta" data-testid="nav-register-btn" onClick={onRegister}>Register</button>
        </div>
      </div>
    </nav>
  );
}
