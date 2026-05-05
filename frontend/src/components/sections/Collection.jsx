import { useEffect, useRef } from "react";
import { products as defaultProducts } from "@/data/content";
import { useSiteContent, pick } from "@/SiteContent";

const SPEED_MAP = { slow: 0.5, medium: 0.75, fast: 1.1 };

export default function Collection() {
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef({ pos: 0, arrowQueue: 0, dragging: false, dragStartX: 0, dragStartScroll: 0 });
  const { content } = useSiteContent();
  const products = pick(content, "collection.products", defaultProducts);
  const autoplayEnabled = pick(content, "collection.autoplay", true) !== false;
  const speedKey = pick(content, "collection.speed", "medium");
  const speed = SPEED_MAP[speedKey] ?? SPEED_MAP.medium;
  const tag = pick(content, "collection.tag", "Sacred Collection");
  const title = pick(content, "collection.title", "Our Rudraksha");
  const highlight = pick(content, "collection.title_highlight", "Collection");
  const subtitle = pick(content, "collection.subtitle", "Handpicked, lab-certified Rudraksha for every intention — authentically sourced and expertly curated.");
  const hidden = pick(content, "section_visibility.collection", true) === false;
  const row = [...products, ...products];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let alive = true;
    stateRef.current.pos = el.scrollLeft || 0;

    const tick = () => {
      if (!alive) return;
      const s = stateRef.current;
      if (s.dragging) {
        s.pos = el.scrollLeft;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (Math.abs(el.scrollLeft - Math.floor(s.pos)) > 2) s.pos = el.scrollLeft;
      let extra = 0;
      if (s.arrowQueue !== 0) {
        const step = s.arrowQueue * 0.18;
        extra = step;
        s.arrowQueue -= step;
        if (Math.abs(s.arrowQueue) < 0.5) { extra += s.arrowQueue; s.arrowQueue = 0; }
      }
      if (el.scrollWidth > el.clientWidth) {
        const half = el.scrollWidth / 2;
        const baseSpeed = autoplayEnabled ? speed : 0;
        s.pos += baseSpeed + extra;
        if (s.pos >= half) s.pos -= half;
        else if (s.pos < 0) s.pos += half;
        el.scrollLeft = s.pos;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

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
  }, [autoplayEnabled, speed]);

  const scrollByDir = (dir) => { stateRef.current.arrowQueue += dir * 320; };

  if (hidden) return null;

  return (
    <section className="rl-collection" id="collection" data-testid="collection-section">
      <div className="rl-container rl-collection-head rl-reveal">
        <span className="rl-tag">{tag}</span>
        <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
          {title} <span className="gold">{highlight}</span>
        </h2>
        <p className="rl-subtitle rl-subtitle-dark" style={{ margin: "0 auto" }}>
          {subtitle}
        </p>
      </div>
      <div className="rl-collection-row" data-testid="collection-row">
        <button className="rl-collection-arrow left" onClick={() => scrollByDir(-1)} aria-label="Scroll left" data-testid="collection-arrow-left">‹</button>
        <div className="rl-scroll-track rl-scroll-auto" ref={trackRef} data-testid="collection-track">
          <div className="rl-scroll-inner rl-scroll-inner-static">
            {row.map((p, i) => (
              <div className="rl-product" key={(p.id || p.name || i) + "-" + i} data-testid={`product-${p.id || i}-${i}`}>
                <div className="rl-product-img">
                  <img src={p.img} alt={p.name} loading="lazy" draggable="false" />
                </div>
                <h4>{p.name}</h4>
                <p>{p.benefit}</p>
              </div>
            ))}
          </div>
        </div>
        <button className="rl-collection-arrow right" onClick={() => scrollByDir(1)} aria-label="Scroll right" data-testid="collection-arrow-right">›</button>
      </div>
    </section>
  );
}
