// Default content seeded into Edit Page list editors when admin first opens the form,
// so adding a 7th item doesn't wipe out the existing 6 defaults visible on the public site.
// Mirrors the fallbacks used in /app/frontend/src/components/sections/*.jsx.
import {
  faqs, aboutParagraphs, products, experts, seekers,
  videoTestimonials, mediaFeatures, mediaLogos,
} from "@/data/content";

export const DEFAULT_FOCUS_POINTS = [
  { icon: "✨", title: "Special Exhibition Offers & Exclusive Discounts", body: "Enjoy exclusive exhibition-only discounts and limited-time offers specially curated for visitors." },
  { icon: "✨", title: "Rare & Powerful Rudraksha Collection", body: "Explore rare Mukhi Rudraksha ranging from 19 Mukhi to 29 Mukhi, available for darshan and deeper understanding." },
  { icon: "✨", title: "Divine & Rare Malas", body: "Experience powerful malas like Indra Mala, Siddha Mala, Narayani Mala & Nakshatra Mala and learn their spiritual significance." },
  { icon: "✨", title: "Personalized Family Guidance", body: "Visit with your family and receive expert guidance for selecting the right Rudraksha combinations for each member." },
  { icon: "✨", title: "Live Rudraksha Testing", body: "Get your Rudraksha tested using scientific methods and view its internal structure and authenticity." },
  { icon: "✨", title: "On-Site Pooja & Energization", body: "Have your Rudraksha energized through proper Vedic rituals and Pran Pratishta at the exhibition." },
];

export const DEFAULT_HERO_STATS = [
  { num: "25+", lbl: "Years" },
  { num: "1200+", lbl: "Exhibitions" },
  { num: "5,00,000+", lbl: "Seekers" },
];

export const DEFAULT_STATS_SECTION = [
  { to: "500000", suffix: "+", thousands: true, label: "Believe Clients" },
  { to: "90", suffix: "%", label: "Repeat Customers" },
  { to: "25", suffix: "+", label: "Years of Expertise" },
  { to: "1200", suffix: "+", label: "Total Exhibitions" },
];

export const DEFAULT_NAV_MENU = [
  { label: "About", target: "about" },
  { label: "Exhibitions", target: "exhibitions" },
  { label: "Collection", target: "collection" },
  { label: "Experts", target: "experts" },
  { label: "FAQ", target: "faq" },
];

export const DEFAULT_FOOTER_SOCIALS = [
  { type: "instagram", url: "https://instagram.com/rudralife" },
  { type: "facebook", url: "https://facebook.com/rudralife" },
  { type: "youtube", url: "https://youtube.com/@rudralife" },
  { type: "linkedin", url: "https://www.linkedin.com/company/rudralife" },
];

export const DEFAULT_FOOTER_ADDRESS = [
  "Rudralife HQ",
  "305, Kailas Plaza, V. B. Lane",
  "Near Bank of Baroda, Ghatkopar East",
  "Mumbai — 400 077, Maharashtra, India",
];

export const DEFAULT_FAQS = faqs.map((f) => ({ q: f.q, a: f.a }));
export const DEFAULT_ABOUT_PARAGRAPHS = aboutParagraphs.map((p) => p);
export const DEFAULT_PRODUCTS = products.map((p) => ({ img: p.img, name: p.name, benefit: p.benefit }));
export const DEFAULT_EXPERTS = experts.map((e) => ({ img: e.img, name: e.name, title: e.title, bio: e.bio, social: e.social || "" }));
export const DEFAULT_TRUSTED = seekers.map((s) => ({ img: s.img, name: s.name, role: s.role, link: s.link || "" }));
export const DEFAULT_TESTIMONIALS = videoTestimonials.map((v) => ({ img: v.img, url: v.url, caption: v.caption || "Watch Story" }));
export const DEFAULT_MEDIA_FEATURES = mediaFeatures.map((m) => ({ img: m.img, label: m.label, title: m.title, desc: m.desc, url: m.url }));
export const DEFAULT_MEDIA_LOGOS = mediaLogos.map((l) => ({ img: l.img, link: "" }));

export function seedListsWithDefaults(content) {
  const next = { ...(content || {}) };

  const ensure = (path, defaults) => {
    const segs = path.split(".");
    let cur = next;
    for (let i = 0; i < segs.length - 1; i++) {
      cur[segs[i]] = { ...(cur[segs[i]] || {}) };
      cur = cur[segs[i]];
    }
    const k = segs[segs.length - 1];
    if (!Array.isArray(cur[k]) || cur[k].length === 0) cur[k] = defaults;
  };

  ensure("hero.stats", DEFAULT_HERO_STATS);
  ensure("focus_box.points", DEFAULT_FOCUS_POINTS);
  ensure("collection.products", DEFAULT_PRODUCTS);
  ensure("faq.items", DEFAULT_FAQS);
  ensure("stats.items", DEFAULT_STATS_SECTION);
  ensure("about.paragraphs", DEFAULT_ABOUT_PARAGRAPHS);
  ensure("navbar.menu", DEFAULT_NAV_MENU);
  ensure("footer.socials", DEFAULT_FOOTER_SOCIALS);
  ensure("footer.explore_links", DEFAULT_NAV_MENU);
  ensure("footer.address_lines", DEFAULT_FOOTER_ADDRESS);
  ensure("experts.items", DEFAULT_EXPERTS);
  ensure("trusted.items", DEFAULT_TRUSTED);
  ensure("testimonials.items", DEFAULT_TESTIMONIALS);
  ensure("media.features", DEFAULT_MEDIA_FEATURES);
  ensure("media.logos", DEFAULT_MEDIA_LOGOS);

  return next;
}
