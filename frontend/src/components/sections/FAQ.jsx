import { useState } from "react";
import { faqs } from "@/data/content";

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="rl-faq" id="faq" data-testid="faq-section">
      <div className="rl-container">
        <div className="rl-faq-head rl-reveal">
          <span className="rl-tag">Seeker's Questions</span>
          <h2 className="rl-heading" style={{ color: "var(--rl-bg-deep)" }}>
            Frequently Asked <span className="gold">Questions</span>
          </h2>
        </div>
        <div className="rl-faq-wrap rl-reveal">
          {faqs.map((f, i) => (
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
