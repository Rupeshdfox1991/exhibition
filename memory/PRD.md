# Rudralife Landing Page — PRD

## Original Problem Statement
Build India's most trusted Rudraksha exhibition company landing page (Rudralife, Est. 2001 Mumbai). Deep luxury aesthetic (Deep brown #1A0E05, Gold #C9920A, Cream #FDF8F0), Cormorant Garamond + Inter fonts, mandala backgrounds. Full single-page site with Hero, Exhibitions (Domestic/International tabs, 16+4 cities, LIVE/SOON badges, expandable detail panel), 3-step registration modal, World Map footprint, Collection scroller, Experts flip cards, Testimonials, Stats counter, About, FAQ, Footer.

## Tech Stack
- React 19 + Tailwind (utility only, custom CSS for luxury theme)
- FastAPI + MongoDB (registrations persisted)
- Cormorant Garamond (Google Fonts) for headings, Inter for body

## User Personas
- Spiritual seekers in India looking for authentic Rudraksha
- International seekers in Dubai, Singapore, UK, Malaysia
- Collectors and long-time practitioners

## Implemented (Dec 2025)
- Hero with OM tagline, dual CTA (Register Now → scrolls to exhibitions, Know More → about), animated mandala
- Navbar (transparent → solid on scroll, logo top-left)
- Exhibitions section: Domestic/International tab switcher, 20 city cards, Live Now (Hyderabad/Visakhapatnam/Bengaluru) vs Coming Soon badges, click-to-expand detail panel with dates/timings/venue/address
- 3-step registration modal (Name+Email, Phone+City+Country with dial-code dropdown, Exhibition+Visit-Date+Message), form validation per step, submits to POST /api/register, success screen with gold tick
- World-map footprint with positioned dots (active/upcoming/past) + dashed gold lines from Mumbai to international cities
- Collection auto-scroll (9 products, pause on hover)
- Experts flip cards (6 experts, click to toggle)
- Testimonials 2-row infinite scroll (10 cards)
- Stats IntersectionObserver counters
- About with drop-cap and sticky aside
- FAQ accordion (10 Q&A)
- Luxury footer with socials, links, contact, devotion line

## Backend
- GET /api/ → welcome
- POST /api/register → saves registration doc
- GET /api/registrations → list most recent
- MongoDB collection: `registrations`

## Testing
- iteration_1: 6/6 backend pytest, ~95% frontend Playwright, no critical bugs

## Prioritized Backlog
- P1: Captcha / rate limit on /api/register for spam protection
- P2: Admin panel to view/export registrations (CSV)
- P2: Email confirmation to seeker + notification to Rudralife team (Resend/SendGrid)
- P2: Individual exhibition gallery lightbox
- P3: i18n (Hindi / Tamil)
- P3: Payment integration for direct Rudraksha purchase
