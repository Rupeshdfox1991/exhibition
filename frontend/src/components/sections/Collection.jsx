import { useEffect, useRef } from "react";
import { products } from "@/data/content";

export default function Collection() {
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  const interactRef = useRef({ paused: false, dragging: false, startX: 0, startScroll: 0, resumeAt: 0 });
  const row = [...products, ...products];

  // Continuous autoplay + manual control (arrows, wheel, touch-swipe, cursor-drag).
  // Strategy: rAF advances scrollLeft each frame UNLESS user is interacting,
  // in which case the browser/user owns scrollLeft and rAF stays out of the way.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const SPEED = 0.6; // px per frame ≈ 36px/sec
    let alive = true;
    let pos = el.scrollLeft || 0;

    const tick = () => {
      if (!alive) return;
      const i = interactRef.current;
      const now = performance.now();
      // If user paused us (arrow/wheel/touch), wait until resumeAt and resync from real scrollLeft
      if (i.paused && now < i.resumeAt) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (i.paused && now >= i.resumeAt) {
        i.paused = false;
        pos = el.scrollLeft; // resync so autoplay continues from wherever the user left it
      }
      if (i.dragging) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (el.scrollWidth > el.clientWidth) {
        const half = el.scrollWidth / 2;
        pos += SPEED;
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Pause autoplay for `ms` while user interacts; resync when expired
    const pauseFor = (ms) => {
      const i = interactRef.current;
      i.paused = true;
      i.resumeAt = performance.now() + ms;
    };

    // Wheel = pause briefly so trackpad / mouse-wheel-horizontal works
    const onWheel = () => pauseFor(1500);
    el.addEventListener("wheel", onWheel, { passive: true });

    // Native touch-swipe (overflow-x:auto handles scrolling). We just pause autoplay.
    const onTouchStart = () => { interactRef.current.dragging = true; };
    const onTouchEnd = () => {
      interactRef.current.dragging = false;
      pauseFor(2000);
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // Cursor-drag (desktop): mousedown → translate scrollLeft on mousemove
    const onMouseDown = (e) => {
      // Ignore drags that originate on arrow buttons / images selection
      if (e.button !== 0) return;
      const i = interactRef.current;
      i.dragging = true;
      i.startX = e.pageX;
      i.startScroll = el.scrollLeft;
      el.classList.add("rl-grabbing");
      e.preventDefault();
    };
    const onMouseMove = (e) => {
      const i = interactRef.current;
      if (!i.dragging) return;
      const dx = e.pageX - i.startX;
      el.scrollLeft = i.startScroll - dx;
    };
    const onMouseUp = () => {
      const i = interactRef.current;
      if (!i.dragging) return;
      i.dragging = false;
      el.classList.remove("rl-grabbing");
      pauseFor(2000);
    };
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Expose helper to arrow handler via the ref
    interactRef.current.pauseFor = pauseFor;

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const scrollByDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // Pause autoplay so the smooth-scroll animation isn't overwritten by rAF
    interactRef.current.pauseFor?.(900);
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
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
