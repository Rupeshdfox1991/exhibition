import { useEffect, useRef } from "react";
import { products } from "@/data/content";

export default function Collection() {
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  // Continuous-scroll state. arrowQueue carries any extra pixels queued by left/right arrow
  // clicks so the autoplay loop can ease toward the new position WITHOUT ever pausing.
  const stateRef = useRef({ pos: 0, arrowQueue: 0, dragging: false, dragStartX: 0, dragStartScroll: 0 });
  const row = [...products, ...products];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const SPEED = 0.75; // px per frame ≈ 45px/sec (was 36 — +25% as requested)
    let alive = true;
    stateRef.current.pos = el.scrollLeft || 0;

    const tick = () => {
      if (!alive) return;
      const s = stateRef.current;
      // While the user is actively dragging with the mouse, browser owns scrollLeft.
      // Touch-swipe is also handled natively by the browser via overflow-x:auto.
      if (s.dragging) {
        s.pos = el.scrollLeft;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      // Detect external (touch / wheel) scroll: if scrollLeft has drifted from our
      // last write, resync `pos` so autoplay continues seamlessly from there.
      if (Math.abs(el.scrollLeft - Math.floor(s.pos)) > 2) {
        s.pos = el.scrollLeft;
      }
      // Autoplay base movement
      let extra = 0;
      // Arrow momentum: ease toward 0, contributing to this frame's movement.
      if (s.arrowQueue !== 0) {
        const step = s.arrowQueue * 0.18; // ~85ms ease-out feel
        extra = step;
        s.arrowQueue -= step;
        if (Math.abs(s.arrowQueue) < 0.5) {
          extra += s.arrowQueue;
          s.arrowQueue = 0;
        }
      }
      if (el.scrollWidth > el.clientWidth) {
        const half = el.scrollWidth / 2;
        s.pos += SPEED + extra;
        // Wrap around in both directions (left arrow can drive pos negative)
        if (s.pos >= half) s.pos -= half;
        else if (s.pos < 0) s.pos += half;
        el.scrollLeft = s.pos;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Cursor-drag (desktop): mousedown → translate scrollLeft on mousemove
    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      const s = stateRef.current;
      s.dragging = true;
      s.dragStartX = e.pageX;
      s.dragStartScroll = el.scrollLeft;
      el.classList.add("rl-grabbing");
      e.preventDefault();
    };
    const onMouseMove = (e) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dx = e.pageX - s.dragStartX;
      el.scrollLeft = s.dragStartScroll - dx;
    };
    const onMouseUp = () => {
      const s = stateRef.current;
      if (!s.dragging) return;
      s.dragging = false;
      el.classList.remove("rl-grabbing");
      s.pos = el.scrollLeft;
    };
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Arrow click: queue extra movement; autoplay rAF eases toward it without ever stopping.
  const scrollByDir = (dir) => {
    stateRef.current.arrowQueue += dir * 320;
  };

  return (
    <section className="rl-collection" id="collection" data-testid="collection-section">
      <div className="rl-container rl-collection-head rl-reveal">
        <span className="rl-tag">Sacred Collection</span>
        <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
          Our Rudraksha <span className="gold">Collection</span>
        </h2>
        <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
          Handpicked, lab-certified Rudraksha for every intention — authentically sourced and expertly curated.
        </p>
      </div>
      <div className="rl-collection-row" data-testid="collection-row">
        <button
          className="rl-collection-arrow left"
          onClick={() => scrollByDir(-1)}
          aria-label="Scroll left"
          data-testid="collection-arrow-left"
        >
          ‹
        </button>
        <div className="rl-scroll-track rl-scroll-auto" ref={trackRef} data-testid="collection-track">
          <div className="rl-scroll-inner rl-scroll-inner-static">
            {row.map((p, i) => (
              <div className="rl-product" key={p.id + i} data-testid={`product-${p.id}-${i}`}>
                <div className="rl-product-img">
                  <img src={p.img} alt={p.name} loading="lazy" draggable="false" />
                </div>
                <h4>{p.name}</h4>
                <p>{p.benefit}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          className="rl-collection-arrow right"
          onClick={() => scrollByDir(1)}
          aria-label="Scroll right"
          data-testid="collection-arrow-right"
        >
          ›
        </button>
      </div>
    </section>
  );
}
