import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { countries } from "@/data/countries";
import { useExhibitions } from "@/App";
import { adaptExhibition } from "@/components/sections/Exhibitions";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generate "16 April 2026 (Thursday)" style date options between start & end ISO dates
function getDateOptions(dateRange) {
  if (!dateRange) return [];
  const dates = [];
  const start = new Date(dateRange.start + "T00:00:00");
  const end = new Date(dateRange.end + "T00:00:00");
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDate(), mon = monthNames[d.getMonth()], yr = d.getFullYear(), wk = dayNames[d.getDay()];
    dates.push({ value: `${day} ${mon} ${yr}`, label: `${day} ${mon} ${yr} (${wk})` });
  }
  return dates;
}

const liveExhibitions = (exhibitions) => exhibitions.filter((c) => c.status === "live");

export default function RegistrationModal({ exhibition, onClose }) {
  const { exhibitions: rawExhibitions } = useExhibitions();
  const allCities = useMemo(() => rawExhibitions.map(adaptExhibition), [rawExhibitions]);
  const liveList = useMemo(() => liveExhibitions(allCities), [allCities]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    dial_code: "+91",
    phone: "",
    city: "",
    country: "India",
    exhibition_id: exhibition?.id || (liveList[0]?.id ?? ""),
    visit_date: "",
    message: "",
  });

  // If live list loads after modal mounts, set the default exhibition id
  useEffect(() => {
    if (!form.exhibition_id && liveList.length > 0) {
      setForm((f) => ({ ...f, exhibition_id: liveList[0].id }));
    }
    // eslint-disable-next-line
  }, [liveList.length]);

  const currentExhibition = useMemo(
    () => allCities.find((c) => c.id === form.exhibition_id) || exhibition || liveList[0],
    [form.exhibition_id, exhibition, allCities, liveList]
  );
  const dateOptions = useMemo(() => getDateOptions(currentExhibition?.dateRange), [currentExhibition]);

  // Auto-select first available date when exhibition changes
  useEffect(() => {
    if (dateOptions.length > 0 && !dateOptions.find((d) => d.value === form.visit_date)) {
      setForm((f) => ({ ...f, visit_date: dateOptions[0].value }));
    }
  }, [dateOptions]); // eslint-disable-line

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.full_name.trim()) e.full_name = "Please enter your name";
      if (!form.email.trim()) e.email = "Please enter your email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    }
    if (s === 2) {
      if (!form.phone.trim()) e.phone = "Please enter phone number";
      else if (!/^\d{6,15}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a valid number";
      if (!form.city.trim()) e.city = "Please enter your city";
      if (!form.country.trim()) e.country = "Select a country";
    }
    if (s === 3) {
      if (!form.exhibition_id) e.exhibition_id = "Select an exhibition";
      if (!form.visit_date) e.visit_date = "Choose a visit date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/register`, {
        ...form,
        exhibition_city: currentExhibition?.name || "",
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const overlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="rl-modal-overlay" data-testid="registration-modal" onClick={overlayClick}>
      <div className="rl-modal" role="dialog" aria-modal="true">
        <button className="rl-modal-close" data-testid="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        {success ? (
          <div className="rl-success" data-testid="registration-success">
            <div className="tick">✓</div>
            <h3>Registration Confirmed!</h3>
            <div className="rl-success-namaste">Namaste <span className="rl-namaste-emoji">🙏</span></div>
            <p className="rl-success-msg">
              Thank you, <strong>{form.full_name.split(" ")[0] || "seeker"}</strong>, for registering for our exhibition.
              We are delighted to have you with us.
            </p>
            <p className="rl-success-msg">
              Your reserved consultation slot is noted below. Our team will reach out to you
              shortly with a confirmation on WhatsApp & email.
            </p>

            {currentExhibition && (
              <div className="rl-success-card" data-testid="success-details">
                <div className="rl-success-card-head">
                  <span className="rl-tag" style={{ color: "var(--rl-gold)" }}>Your Exhibition Pass</span>
                  <span className="rl-success-city">{currentExhibition.name}</span>
                </div>
                <div className="rl-success-grid">
                  <div>
                    <div className="k">Exhibition</div>
                    <div className="v">Rudralife · {currentExhibition.name}</div>
                  </div>
                  <div>
                    <div className="k">Visit Date</div>
                    <div className="v">{form.visit_date}</div>
                  </div>
                  <div>
                    <div className="k">Timings</div>
                    <div className="v">{currentExhibition.timings || "10:00 AM – 8:00 PM"}</div>
                  </div>
                  <div>
                    <div className="k">Full Schedule</div>
                    <div className="v">{currentExhibition.dates}</div>
                  </div>
                  <div className="rl-success-grid-full">
                    <div className="k">Venue · Hotel</div>
                    <div className="v">{currentExhibition.venue}</div>
                  </div>
                  <div className="rl-success-grid-full">
                    <div className="k">Address</div>
                    <a
                      className="v rl-maps-link"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((currentExhibition.venue || "") + ", " + (currentExhibition.address || ""))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="success-map-link"
                    >
                      {currentExhibition.address} <span className="rl-maps-ext">↗ Open in Maps</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <p className="rl-success-farewell">
              If you have any questions, feel free to reach out to us anytime.<br />
              We look forward to seeing you at the exhibition.
            </p>
            <div className="rl-success-regards">
              Warm regards,<br />
              <em>Team Rudralife</em>
            </div>

            <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href={`https://wa.me/917208819922?text=${encodeURIComponent(`Namaste 🙏 I have just registered for the Rudralife ${currentExhibition?.name || ""} exhibition on ${form.visit_date}. My name is ${form.full_name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rl-btn rl-btn-primary"
                data-testid="success-whatsapp"
              >
                WhatsApp Us ↗
              </a>
              <button className="rl-btn-text" data-testid="modal-success-close" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="rl-modal-head">
              <span className="rl-tag" style={{ color: "#C9920A" }}>Register To Visit</span>
              <h3 className="rl-modal-title">
                {currentExhibition ? `Rudralife · ${currentExhibition.name}` : "Rudralife Exhibition"}
              </h3>
              <p className="rl-modal-sub">A quiet conversation with our panel experts awaits.</p>
              <div className="rl-steps">
                <span className={`rl-step-dot ${step === 1 ? "active" : step > 1 ? "done" : ""}`} />
                <span className={`rl-step-dot ${step === 2 ? "active" : step > 2 ? "done" : ""}`} />
                <span className={`rl-step-dot ${step === 3 ? "active" : ""}`} />
              </div>
            </div>

            <div className="rl-modal-body">
              {step === 1 && (
                <div>
                  <div className="rl-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      data-testid="input-fullname"
                      value={form.full_name}
                      onChange={(e) => update("full_name", e.target.value)}
                      placeholder="e.g. Anjali Mehta"
                    />
                    {errors.full_name && <div className="rl-field-err">{errors.full_name}</div>}
                  </div>
                  <div className="rl-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      data-testid="input-email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                    {errors.email && <div className="rl-field-err">{errors.email}</div>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="rl-field">
                    <label>Phone Number</label>
                    <div className="rl-phone-row">
                      <select
                        data-testid="select-dialcode"
                        value={form.dial_code}
                        onChange={(e) => update("dial_code", e.target.value)}
                      >
                        {countries.map((c) => (
                          <option key={c.code + c.dial} value={c.dial}>
                            {c.flag} {c.dial}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        data-testid="input-phone"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="98xxxxxxxx"
                      />
                    </div>
                    {errors.phone && <div className="rl-field-err">{errors.phone}</div>}
                  </div>
                  <div className="rl-field">
                    <label>Your City</label>
                    <input
                      type="text"
                      data-testid="input-city"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="e.g. Mumbai"
                    />
                    {errors.city && <div className="rl-field-err">{errors.city}</div>}
                  </div>
                  <div className="rl-field">
                    <label>Your Country</label>
                    <select
                      data-testid="select-country"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                    {errors.country && <div className="rl-field-err">{errors.country}</div>}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="rl-field">
                    <label>Select Exhibition</label>
                    <select
                      data-testid="select-exhibition"
                      value={form.exhibition_id}
                      onChange={(e) => update("exhibition_id", e.target.value)}
                    >
                      {liveList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} — {c.dates}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rl-field">
                    <label>Choose Visit Date</label>
                    <select
                      data-testid="select-visit-date"
                      value={form.visit_date}
                      onChange={(e) => update("visit_date", e.target.value)}
                    >
                      {dateOptions.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    {errors.visit_date && <div className="rl-field-err">{errors.visit_date}</div>}
                  </div>
                  <div className="rl-field">
                    <label>Optional Message</label>
                    <textarea
                      data-testid="input-message"
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Share your intention or any specific Rudraksha you wish to discuss..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rl-modal-foot">
              {step > 1 ? (
                <button className="rl-btn-text" data-testid="modal-back-btn" onClick={back}>← Back</button>
              ) : (
                <button className="rl-btn-text" data-testid="modal-maybe-later-btn" onClick={onClose}>Maybe Later</button>
              )}
              {step < 3 ? (
                <button className="rl-btn rl-btn-dark" data-testid="modal-next-btn" onClick={next}>
                  Next →
                </button>
              ) : (
                <button
                  className="rl-btn rl-btn-primary"
                  data-testid="modal-submit-btn"
                  disabled={submitting}
                  onClick={submit}
                >
                  {submitting ? "Submitting..." : "Submit Registration"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
