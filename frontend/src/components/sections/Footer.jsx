import { useSiteContent, pick } from "@/SiteContent";

const DEFAULT_LOGO =
  "https://customer-assets.emergentagent.com/job_b271b1af-1da5-4630-96e0-320d96eb6add/artifacts/pm9yuvf5_New%20Rudralife%20final%20logo%20with%20tagline%20%28White%29%20%281%29.png";

const DEFAULT_SOCIALS = [
  { type: "instagram", url: "https://instagram.com/rudralife" },
  { type: "facebook", url: "https://facebook.com/rudralife" },
  { type: "youtube", url: "https://youtube.com/@rudralife" },
  { type: "linkedin", url: "https://www.linkedin.com/company/rudralife" },
];

const ICONS = {
  instagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E0B044" }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  facebook: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E0B044" }}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  youtube: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E0B044" }}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
  linkedin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E0B044" }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
  twitter: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E0B044" }}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>,
};

export default function Footer({ onNav }) {
  const year = new Date().getFullYear();
  const { content } = useSiteContent();
  const logo = pick(content, "footer.logo", pick(content, "navbar.logo", DEFAULT_LOGO));
  const tagline = pick(content, "footer.tagline", "Sacred Rudraksha · Ancient Wisdom · Modern World. Crafted with devotion since 2001.");
  const socials = pick(content, "footer.socials", DEFAULT_SOCIALS);
  const exploreLinks = pick(content, "footer.explore_links", [
    { label: "About", target: "about" },
    { label: "Exhibitions", target: "exhibitions" },
    { label: "Collection", target: "collection" },
    { label: "Experts", target: "experts" },
    { label: "FAQ", target: "faq" },
  ]);
  const hours = pick(content, "footer.hours", "Mon — Sat · 10 AM to 6 PM");
  const addressLines = pick(content, "footer.address_lines", [
    "Rudralife HQ",
    "305, Kailas Plaza, V. B. Lane",
    "Near Bank of Baroda, Ghatkopar East",
    "Mumbai — 400 077, Maharashtra, India",
  ]);
  const phone = pick(content, "footer.phone", "+91 22 2510 3030");
  const email = pick(content, "footer.email", "info@rudralife.com");
  const whatsapp = pick(content, "footer.whatsapp", "+91 72088 19922");
  const note = pick(content, "footer.note", "Private consultations available by appointment on Sundays.");
  const copyright = pick(content, "footer.copyright", `© ${year} Rudralife. All Rights Reserved.`);
  const devotion = pick(content, "footer.devotion", "Crafted with devotion for seekers worldwide 🙏");

  const phoneTel = (phone || "").replace(/[^\d+]/g, "");
  const waTel = (whatsapp || "").replace(/[^\d]/g, "");

  return (
    <footer className="rl-footer" data-testid="footer-section">
      <div className="rl-container">
        <div className="rl-footer-grid">
          <div className="rl-footer-brand">
            <img src={logo} alt="Rudralife" />
            <p>{tagline}</p>
            <div className="rl-footer-socials">
              {socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.type} data-testid={`social-${s.type}`}>
                  {ICONS[s.type] || ICONS.instagram}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              {exploreLinks.map((l, i) => (
                <li key={i}><button className="rl-footer-link" onClick={() => onNav(l.target)}>{l.label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Visit Us</h5>
            <ul>
              <li style={{ color: "var(--rl-gold-soft)", fontWeight: 600 }}>{hours}</li>
              {addressLines.map((line, i) => <li key={i}>{line}</li>)}
              {phone && <li style={{ marginTop: 8 }}><a href={`tel:${phoneTel}`}>{phone}</a></li>}
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
              {whatsapp && <li><a href={`https://wa.me/${waTel}`} target="_blank" rel="noopener noreferrer">WhatsApp · {whatsapp}</a></li>}
              {note && (
                <li style={{ marginTop: 10, color: "rgba(253,248,240,0.55)", fontSize: 12, lineHeight: 1.6 }}>{note}</li>
              )}
            </ul>
          </div>
        </div>
        <div className="rl-footer-bar">
          <div>{copyright}</div>
          <div className="devotion">{devotion}</div>
        </div>
      </div>
    </footer>
  );
}
