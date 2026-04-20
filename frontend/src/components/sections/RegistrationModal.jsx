import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { countries } from "@/data/countries";
import { allCities, getDateOptions } from "@/data/exhibitions";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const liveExhibitions = allCities.filter((c) => c.status === "live");

export default function RegistrationModal({ exhibition, onClose }) {
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
    exhibition_id: exhibition?.id || (liveExhibitions[0]?.id ?? ""),
    visit_date: "",
    message: "",
  });

  const currentExhibition = useMemo(
    () => allCities.find((c) => c.id === form.exhibition_id) || exhibition || liveExhibitions[0],
    [form.exhibition_id, exhibition]
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
            <h3>Registration Confirmed</h3>
            <p>Thank you, {form.full_name.split(" ")[0] || "seeker"}. Our team will contact you shortly with a confirmed consultation slot at <strong>{currentExhibition?.name}</strong>.</p>
            <div style={{ marginTop: 28 }}>
              <button className="rl-btn rl-btn-dark" data-testid="modal-success-close" onClick={onClose}>Close</button>
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
                      {liveExhibitions.map((c) => (
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
              ) : <span />}
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
