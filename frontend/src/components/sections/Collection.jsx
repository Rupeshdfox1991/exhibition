import { products } from "@/data/content";

export default function Collection() {
  // duplicate for seamless scroll
  const row = [...products, ...products];
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
      <div className="rl-scroll-track">
        <div className="rl-scroll-inner">
          {row.map((p, i) => (
            <div className="rl-product" key={p.id + i} data-testid={`product-${p.id}-${i}`}>
              <div className="rl-product-img" style={{ backgroundImage: `url(${p.img})` }} />
              <h4>{p.name}</h4>
              <p>{p.benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
