import { useEffect, useRef, useState } from "react";

const stats = [
  { to: 500000, fmt: (n) => n.toLocaleString("en-IN") + "+", label: "Believe Clients" },
  { to: 90, fmt: (n) => n + "%", label: "Repeat Customers" },
  { to: 25, fmt: (n) => n + "+", label: "Years of Expertise" },
  { to: 1200, fmt: (n) => n + "+", label: "Total Exhibitions" },
];

function Counter({ to, fmt, start }) {
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
  return <div className="rl-stat-num">{fmt(n)}</div>;
}

export default function Stats() {
  const ref = useRef(null);
  const [start, setStart] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setStart(true); }); },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section className="rl-stats" id="stats" ref={ref} data-testid="stats-section">
      <div className="rl-container">
        <div className="rl-stats-grid">
          {stats.map((s, i) => (
            <div key={i} data-testid={`stat-${i}`}>
              <Counter to={s.to} fmt={s.fmt} start={start} />
              <div className="rl-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
