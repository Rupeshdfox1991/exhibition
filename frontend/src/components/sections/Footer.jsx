const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_b271b1af-1da5-4630-96e0-320d96eb6add/artifacts/pm9yuvf5_New%20Rudralife%20final%20logo%20with%20tagline%20%28White%29%20%281%29.png";

export default function Footer({ onNav }) {
  const year = new Date().getFullYear();
  return (
    <footer className="rl-footer" data-testid="footer-section">
      <div className="rl-container">
        <div className="rl-footer-grid">
          <div className="rl-footer-brand">
            <img src={LOGO_URL} alt="Rudralife" />
            <p>Sacred Rudraksha · Ancient Wisdom · Modern World. Crafted with devotion since 2001.</p>
            <div className="rl-footer-socials">
              <a href="#" aria-label="Instagram" data-testid="social-instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E0B044" }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
              <a href="#" aria-label="Facebook" data-testid="social-facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E0B044" }}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
              <a href="#" aria-label="YouTube" data-testid="social-youtube"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E0B044" }}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></a>
            </div>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><button className="rl-footer-link" onClick={() => onNav("about")}>About</button></li>
              <li><button className="rl-footer-link" onClick={() => onNav("exhibitions")}>Exhibitions</button></li>
              <li><button className="rl-footer-link" onClick={() => onNav("collection")}>Collection</button></li>
              <li><button className="rl-footer-link" onClick={() => onNav("experts")}>Experts</button></li>
              <li><button className="rl-footer-link" onClick={() => onNav("faq")}>FAQ</button></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li>Rudralife HQ</li>
              <li>Mumbai, Maharashtra</li>
              <li>India · 400 050</li>
              <li><a href="mailto:info@rudralife.com">info@rudralife.com</a></li>
            </ul>
          </div>
          <div>
            <h5>Visit Us</h5>
            <ul>
              <li>Mon — Sat · 10 AM to 7 PM</li>
              <li>Sunday by appointment</li>
              <li>Private consultations on request</li>
            </ul>
          </div>
        </div>
        <div className="rl-footer-bar">
          <div>© {year} Rudralife. All Rights Reserved.</div>
          <div className="devotion">Crafted with devotion for seekers worldwide 🙏</div>
        </div>
      </div>
    </footer>
  );
}
