import { useEffect, useRef } from "react";
import { products } from "@/data/content";

export default function Collection() {
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  const row = [...products, ...products];

  // Continuous, non-stop autoplay via requestAnimationFrame.
  // Hover/touch does NOT pause. Manual arrows simply scrollBy on top of the drift.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const SPEED = 0.45; // px per frame ≈ 27px/sec
    const tick = () => {
      if (el.scrollWidth > el.clientWidth) {
        const half = el.scrollWidth / 2;
        el.scrollLeft += SPEED;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
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
          onClick={() => scrollBy(-1)}
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
                  <img src={p.img} alt={p.name} loading="lazy" />
                </div>
                <h4>{p.name}</h4>
                <p>{p.benefit}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          className="rl-collection-arrow right"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          data-testid="collection-arrow-right"
        >
          ›
        </button>
      </div>
    </section>
  );
}
