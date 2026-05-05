# Rudralife Landing Page — PRD

## Original Problem Statement
Build India's most trusted Rudraksha exhibition company landing page (Rudralife, Est. 2001 Mumbai). Deep luxury aesthetic (Deep brown #1A0E05, Gold #C9920A, Cream #FDF8F0), Cormorant Garamond + Inter fonts. Full single-page site with Hero, Exhibitions (Domestic/International tabs, LIVE/SOON badges), Registration + Notify-Me flows, World Map footprint, Collection scroller, Experts, Testimonials, Stats, About, FAQ. Separate admin panel (JWT) to manage exhibitions, view/export Exhibition Leads and Coming Soon Leads.

## Tech Stack
- React 19 + vanilla CSS (Tailwind & Bootstrap explicitly forbidden by user)
- FastAPI + MongoDB (motor), JWT admin auth, OpenPyXL Excel export
- Cormorant Garamond (headings) + Inter (body)

## User Personas
- Spiritual seekers in India looking for authentic Rudraksha
- International seekers (Dubai, Singapore, UK, Malaysia)
- Collectors / long-time practitioners
- Rudralife admin staff managing exhibitions & leads

## Admin Credentials
See `/app/memory/test_credentials.md`

## Implemented (cumulative, latest first)

### Iteration 19 (Feb 2026) — Edit Page CMS Phase B-2 (full coverage)
- **Per-row editing for ALL remaining sections**:
  - **Header / Navigation**: logo upload + menu items list editor (label + scroll-target / external URL) + CTA button text. Public `Navbar.jsx` now reads everything from CMS.
  - **Footer**: logo, brand tagline, hours, phone, email, WhatsApp, address-lines list editor, social links list editor (Instagram / Facebook / YouTube / LinkedIn / Twitter SVG icons map), explore-menu list editor, note, copyright, devotion line. Public `Footer.jsx` rewritten to consume all of it.
  - **Panel Experts**: per-row image + name + designation + bio + social link.
  - **Trusted Clients (Seekers)**: per-row image + name + role + optional link (17 defaults pre-seeded).
  - **Video Testimonials**: per-row thumbnail + video URL + caption.
  - **Media / Recognition**: featured cards (image+label+title+desc+url) + "As Featured In" logos (image + optional link).
- **SEO / Meta Tags section** (new): Meta Title, URL Slug, Meta Description, OG Image. `SiteContentProvider` applies them to `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image` whenever content updates.
- **Form Labels section** expanded: Title, submit-button text, success+error messages, field placeholders for Name/Email/Phone, for both Register and Notify forms.
- **All defaults (cmsDefaults.js) pre-seeded** into editors: 7 experts, 17 seekers, 4 testimonials, 3 media features, 9 logos, 5 nav-menu items, 4 socials, 4 address lines.
- **Verified live**: edited an expert name → public site updated; SEO title saved → public `<title>` and `<meta description>` updated.

### Iteration 18 (Feb 2026) — Edit Page CMS (Phase B)
- **Backend**: new `site_content` singleton collection.
  - Public `GET /api/site-content` (returns full tree or `{}`).
  - Admin `GET /api/admin/site-content`, `PUT /api/admin/site-content` (replace_one, with `updated_at`/`updated_by`), `DELETE /api/admin/site-content` (Restore Defaults).
- **Frontend `SiteContentProvider`** (`/app/frontend/src/SiteContent.jsx`): fetches once, exposed via `useSiteContent()`. Includes `pick(obj, "a.b.c", fallback)` helper that returns the fallback for missing/empty values so the public site never breaks with an empty CMS doc.
- **Components wired to CMS** (with hard-coded fallbacks): Hero, WhyVisit/FocusBox, Footprint, Collection, FAQ, Stats, About + visibility toggles for Experts, Trusted/Seekers, VideoTestimonials, InMedia.
- **Admin "Edit Page" tab** (`/app/frontend/src/admin/EditPageTab.jsx`):
  - 14 collapsible sections: Header, Banner (Hero), Focus Box, Global Presence, Collection, Experts, Trusted, Video Testimonials, Media, FAQ, Stats, About, Footer, Forms.
  - Reusable controls: TextField, ImageField (with upload + remove + thumbnail), Toggle, ListEditor (add/edit/delete/reorder).
  - Visibility on/off per section (Focus Box, Global Presence, Collection, Experts, Trusted, Testimonials, Media, Stats, About).
  - Image-upload helper text everywhere — **1920×720 banners**, **800×800 square**, **600×800 portrait**, **transparent PNG logos**.
  - Auto-scroll controls: enable/disable + slow/medium/fast.
  - **Defaults pre-seeded** (`/app/frontend/src/admin/cmsDefaults.js`) into list editors so admins see existing 6 focus points / FAQs / products / paragraphs and can edit-in-place rather than re-typing.
  - **💾 Save Changes** + **↺ Restore Defaults** buttons in toolbar; live-time "Saved 06:00:30" indicator.
- **Verified end-to-end**: edit Hero highlight, save → public site updates instantly; add 7th focus point → 7 visible publicly; Restore Defaults → reverts to 6.
- **Test report**: iteration_13.json (13/13 backend new + 59/59 regression, plus the two HIGH/MEDIUM frontend issues raised by testing agent are now resolved).

### Iteration 17 — Phase A (Feb 2026): Focus Box + Auto-scroll polish
- **Focus Box** ("Reasons to Explore the Rudralife Exhibition") inserted between Exhibitions and Global Presence. 6 sparkle ✨ bullet points rendered as gold-on-cream highlight card with subtle gradients, 2-column desktop / 1-column mobile, gold ring sparkle icon. Replaced the older "Why Visit" content with the user's exact copy. (`/app/frontend/src/components/sections/WhyVisit.jsx`, `.rl-focus-section`/`.rl-focus-card` styles in App.css.)
- **Collection auto-scroll**: full rewrite of arrow behavior. Speed bumped from 0.6 → 0.75 px/frame (+25%). Arrows now queue extra pixels into a `arrowQueue` accumulator that the rAF loop eases to zero — autoplay literally never stops, arrows just shift position smoothly. Drift verified at 45 px/sec; arrow click adds 320 px boost while drift continues monotonically.

### Phase B — CMS for full-page editing (planned, next iteration)
- Build `site_content` singleton in Mongo + new "Edit Page" admin tab covering Header, Banner, Focus Box, FAQ, Stats, About in the first cut, then Collection / Experts / Trusted / Video Testimonials / In-Media as Phase B-2.
- Image upload helper text: 1920×720 (banner), 800×800 (square), 600×800 (portrait), PNG transparent for logos.

### Iteration 16 (Feb 2026) — Coming-Soon dropdown sync, image upload, carousel rewrite
- **NotifyModal**: dropdown options now fetched from `GET /api/notify-cities` (admin-managed). Added **"Maybe Later"** button that closes the modal without submitting.
- **Backend `notify_cities` collection** + endpoints:
  - Public `GET /api/notify-cities`
  - Admin `GET/POST /api/admin/notify-cities`, `DELETE /api/admin/notify-cities/{id}`
  - Auto-seeded from existing exhibitions on first run.
- **Image upload**: new `POST /api/admin/upload-image` endpoint (multipart, JPG/PNG/WebP, ≤4 MB) that saves to `/app/backend/uploads/` and serves via `/api/uploads/{filename}` (StaticFiles mount). Admin Exhibitions form now has an Upload button + thumbnail preview + helper text "Recommended 1200 × 800 px · 3:2 · max 4 MB".
- **Admin Dashboard** new **"Notify Cities"** tab with chip-style add/delete grouped by Domestic/International. Inline error feedback on duplicates/validation failures.
- **Experts label**: shrunk to 9px, repositioned to top-left with `max-width: calc(100% - 20px)` to prevent mobile overflow. Text changed to **"Tap to See"**.
- **Collection carousel rewrite** (`Collection.jsx`):
  - Continuous rAF autoplay with `pauseFor()` helper that resyncs from real `scrollLeft` after user interaction.
  - Manual arrows now actually move the track (~320 px/click), no longer reverted by autoplay.
  - Native touch-swipe (overflow-x: auto) + custom cursor-drag on desktop (mousedown → translate scrollLeft → mouseup → resume autoplay 2s later).
  - `wheel` events also pause autoplay briefly so trackpad/horizontal-wheel works.

### Iteration 14 (Feb 2026) — UI/UX Enhancements
- **Hero**: "Know More" button renamed to **"Get Notified When We Visit Your City"**; smooth-scrolls to `#exhibitions`.
- **Live Exhibition Flow**: Clicking a Live city card now opens a new **EventDetailsModal** first (Dates, Timings, Venue with **Google Maps link**). A "Register Now" CTA inside the modal then opens `RegistrationModal`. No page scroll.
- **Coming Soon Flow**: NotifyModal `interested_city` is now a **scrollable `<select>` dropdown** (India + International optgroups + "Other"). Pre-filled with the clicked city when applicable.
- **Admin**: Separate **"Coming Soon Leads"** tab (distinct from "Exhibition Leads") with filters (date range, city, type) + Excel export via `/api/admin/notify-interest/export`.
- **Collection Slider**: Continuous `requestAnimationFrame`-driven autoplay using a float accumulator (sub-pixel-safe). Does NOT pause on hover/touch. Manual left/right arrows still work.
- **Experts**: Removed all "Years of Experience" badges. Replaced with "Tap for More Information" label. Mobile grid tightened (2-col on ≤760px, smaller typography on ≤420px).
- New files: `frontend/src/components/sections/EventDetailsModal.jsx`, `frontend/src/data/cities.js`.

### Iteration 13 (Dec 2025/Jan 2026)
- Separated backend flows: `/api/notify-interest` (public) + `/api/admin/notify-interest` list & xlsx export
- Registration modal wired to backend; RegistrationModal opens instantly on live card click (replaced inline detail panel)
- NotifyModal created for Coming Soon leads
- Collection section got manual left/right arrow buttons
- Admin API layer (`admin/api.js`) extended with `listNotifyInterest` / `exportNotifyInterest`

### Earlier
- Hero, Navbar, Exhibitions (Domestic/International), World-map footprint, Collection auto-scroll, Experts flip cards, Testimonials, Stats counters, About, FAQ, Luxury footer
- Full admin panel (JWT auth) — exhibitions CRUD, status toggle (live/soon), live-first sorting, registration Excel export
- "Why Visit" section with Key Highlights list
- Mobile responsiveness fixes (IntersectionObserver thresholds, map pin alignment)

## Key Backend Endpoints
- Public: `GET /api/exhibitions`, `POST /api/register`, `POST /api/notify-interest`
- Admin auth: `POST /api/admin/login`, `GET /api/admin/me`
- Admin exhibitions: `GET/POST /api/admin/exhibitions`, `PUT /api/admin/exhibitions/{id}`, `PATCH /api/admin/exhibitions/{id}/status`, `DELETE /api/admin/exhibitions/{id}`
- Admin leads: `GET /api/admin/registrations` + `/export`, `GET /api/admin/notify-interest` + `/export`

## Mongo Collections
- `admins`, `exhibitions`, `registrations`, `notify_interest`

## Testing
- iteration_1..10: earlier phases — backend & frontend passed
- **iteration_11 (Feb 2026)**: 32/32 backend pytest pass, 15/15 frontend Playwright assertions after the Collection autoplay fix. Covered EventDetailsModal, Notify dropdown, separate Coming Soon Leads admin tab, Experts "Tap for more info", Hero scroll, Collection continuous autoplay (no hover pause).

## Prioritized Backlog
- **P1** Captcha / rate-limit on `/api/register` + `/api/notify-interest` to deter spam
- **P2** Email confirmation to seekers + team notification (Resend/SendGrid)
- **P2** Individual exhibition gallery lightbox
- **P3** i18n (Hindi / Tamil)
- **P3** Payment integration for direct Rudraksha purchase
- **P3** Refactor: split `App.css` (2100+ lines) into per-section partials
