import { useRef } from "react";
import { products } from "@/data/content";

export default function Collection() {
  const trackRef = useRef(null);
  const row = [...products, ...products];

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
        <div className="rl-scroll-track" ref={trackRef}>
          <div className="rl-scroll-inner">
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
