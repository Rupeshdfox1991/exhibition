import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { countries } from "@/data/countries";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function NotifyModal({ city, type = "domestic", onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    dial_code: "+91",
    phone: "",
    interested_city: city?.name || "",
    exhibition_id: city?.id || "",
    exhibition_type: city?.type || type,
  });

  // Fetch admin-managed city list (synced with exhibitions, manageable from admin panel)
  useEffect(() => {
    let alive = true;
    axios.get(`${API}/notify-cities`)
      .then((r) => { if (alive) setCities(Array.isArray(r.data) ? r.data : []); })
      .catch(() => { if (alive) setCities([]); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const grouped = useMemo(() => {
    const dom = cities.filter((c) => c.type === "domestic").map((c) => c.name);
    const intl = cities.filter((c) => c.type === "international").map((c) => c.name);
    return { dom, intl };
  }, [cities]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Please enter your name";
    if (!form.email.trim()) e.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Please enter phone number";
    else if (!/^\d{6,15}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a valid number";
    if (!form.interested_city.trim()) e.interested_city = "Please select a city";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/notify-interest`, form);
      setSuccess(true);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally { setSubmitting(false); }
  };

  const overlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="rl-modal-overlay" data-testid="notify-modal" onClick={overlayClick}>
      <div className="rl-modal" role="dialog" aria-modal="true">
        <button className="rl-modal-close" data-testid="notify-close-btn" onClick={onClose} aria-label="Close">✕</button>
        {success ? (
          <div className="rl-success" data-testid="notify-success">
            <div className="tick">✓</div>
            <h3>You're on the List!</h3>
            <div className="rl-success-namaste">Namaste 🙏</div>
            <p className="rl-success-msg">
              Thank you, <strong>{form.full_name.split(" ")[0] || "seeker"}</strong>. We will notify you the moment a Rudralife exhibition is announced in <strong>{form.interested_city}</strong>.
            </p>
            <div style={{ marginTop: 24 }}>
              <button className="rl-btn rl-btn-dark" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="rl-modal-head">
              <span className="rl-tag" style={{ color: "#C9920A" }}>Get Notified</span>
              <h3 className="rl-modal-title">Notify Me When You Visit</h3>
              <p className="rl-modal-sub">
                We will reach out as soon as Rudralife is announced in {city?.name ? <strong>{city.name}</strong> : "your city"}.
              </p>
            </div>
            <div className="rl-modal-body">
              <div className="rl-field">
                <label>Full Name</label>
                <input type="text" data-testid="notify-fullname" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. Anjali Mehta" />
                {errors.full_name && <div className="rl-field-err">{errors.full_name}</div>}
              </div>
              <div className="rl-field">
                <label>Email Address</label>
                <input type="email" data-testid="notify-email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
                {errors.email && <div className="rl-field-err">{errors.email}</div>}
              </div>
              <div className="rl-field">
                <label>Phone Number</label>
                <div className="rl-phone-row">
                  <select data-testid="notify-dialcode" value={form.dial_code} onChange={(e) => update("dial_code", e.target.value)}>
                    {countries.map((c) => (<option key={c.code + c.dial} value={c.dial}>{c.flag} {c.dial}</option>))}
                  </select>
                  <input type="tel" data-testid="notify-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="98xxxxxxxx" />
                </div>
                {errors.phone && <div className="rl-field-err">{errors.phone}</div>}
              </div>
              <div className="rl-field">
                <label>Interested City</label>
                <select
                  data-testid="notify-city"
                  value={form.interested_city}
                  onChange={(e) => update("interested_city", e.target.value)}
                >
                  <option value="">
                    {cities.length === 0 ? "Loading cities…" : "Select a city…"}
                  </option>
                  {grouped.dom.length > 0 && (
                    <optgroup label="Domestic (India)">
                      {grouped.dom.map((c) => <option key={`d-${c}`} value={c}>{c}</option>)}
                    </optgroup>
                  )}
                  {grouped.intl.length > 0 && (
                    <optgroup label="International">
                      {grouped.intl.map((c) => <option key={`i-${c}`} value={c}>{c}</option>)}
                    </optgroup>
                  )}
                </select>
                {errors.interested_city && <div className="rl-field-err">{errors.interested_city}</div>}
              </div>
            </div>
            <div className="rl-modal-foot">
              <button className="rl-btn-text" data-testid="notify-maybe-later-btn" onClick={onClose}>
                Maybe Later
              </button>
              <button className="rl-btn rl-btn-primary" data-testid="notify-submit-btn" disabled={submitting} onClick={submit}>
                {submitting ? "Submitting..." : "Notify Me →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
