import { useState } from "react";
import { faqs as defaultFaqs } from "@/data/content";
import { useSiteContent, pick } from "@/SiteContent";

export default function FAQ() {
  const [open, setOpen] = useState(0);
  const { content } = useSiteContent();
  const tag = pick(content, "faq.tag", "Seeker's Questions");
  const titleLine = pick(content, "faq.title", "Frequently Asked");
  const highlight = pick(content, "faq.title_highlight", "Questions");
  const items = pick(content, "faq.items", defaultFaqs);
  return (
    <section className="rl-faq" id="faq" data-testid="faq-section">
      <div className="rl-container">
        <div className="rl-faq-head rl-reveal">
          <span className="rl-tag">{tag}</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
            {titleLine} <span className="gold">{highlight}</span>
          </h2>
        </div>
        <div className="rl-faq-wrap rl-reveal">
          {items.map((f, i) => (
            <div key={i} className={`rl-faq-item ${open === i ? "open" : ""}`}>
              <button
                className="rl-faq-q"
                data-testid={`faq-q-${i}`}
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span>{f.q}</span>
                <span className="plus">+</span>
              </button>
              <div className="rl-faq-a" data-testid={`faq-a-${i}`}>
                <div>{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
