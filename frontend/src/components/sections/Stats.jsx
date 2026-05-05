import { useEffect, useRef, useState } from "react";
import { useSiteContent, pick } from "@/SiteContent";

const DEFAULT_STATS = [
  { to: 500000, suffix: "+", thousands: true, label: "Believe Clients" },
  { to: 90, suffix: "%", label: "Repeat Customers" },
  { to: 25, suffix: "+", label: "Years of Expertise" },
  { to: 1200, suffix: "+", label: "Total Exhibitions" },
];

const fmtNum = (n, suffix, thousands) => {
  const base = thousands ? n.toLocaleString("en-IN") : String(n);
  return base + (suffix || "");
};

function Counter({ to, suffix, thousands, start }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const duration = 1800;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(eased * to));
      if (p < 1) raf = requestAnimationFrame(step);
      else setN(to);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, to]);
  return <div className="rl-stat-num">{fmtNum(n, suffix, thousands)}</div>;
}

export default function Stats() {
  const ref = useRef(null);
  const [start, setStart] = useState(false);
  const { content } = useSiteContent();
  const items = pick(content, "stats.items", DEFAULT_STATS);
  const hidden = pick(content, "section_visibility.stats", true) === false;
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setStart(true); }); },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  if (hidden) return null;
  return (
    <section className="rl-stats" id="stats" ref={ref} data-testid="stats-section">
      <div className="rl-container">
        <div className="rl-stats-grid">
          {items.map((s, i) => (
            <div key={i} data-testid={`stat-${i}`}>
              <Counter to={Number(s.to) || 0} suffix={s.suffix} thousands={!!s.thousands} start={start} />
              <div className="rl-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
