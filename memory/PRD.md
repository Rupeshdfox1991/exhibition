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
