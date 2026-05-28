import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { countries } from "@/data/countries";
import { useExhibitions } from "@/App";
import { adaptExhibition } from "@/components/sections/Exhibitions";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generate date options with "Select a date…" placeholder
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

// Country code → dial code lookup (used when admin set country_code but not dial_code)
const DIAL_BY_COUNTRY = {
  IN: "+91", US: "+1", GB: "+44", AE: "+971", SG: "+65", MY: "+60", CA: "+1",
  AU: "+61", QA: "+974", OM: "+968", TH: "+66", LK: "+94", NP: "+977", BD: "+880",
};

export default function RegistrationModal({ exhibition, onClose, urlSync = false, slug = "", onSubmitted }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const { exhibitions: rawExhibitions } = useExhibitions();
  const allCities = useMemo(() => rawExhibitions.map(adaptExhibition), [rawExhibitions]);
  const liveList = useMemo(() => allCities.filter((c) => c.status === "live"), [allCities]);

  // Determine starting step from URL when urlSync is on (refresh-safe deep links)
  const stepFromUrl = () => {
    if (!urlSync) return 1;
    const p = loc.pathname;
    if (p.endsWith("/register/contact")) return 2;
    if (p.endsWith("/register/details")) return 3;
    return 1;
  };
  const [step, setStep] = useState(stepFromUrl());

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-fill dial code + country from exhibition (admin-controlled per exhibition)
  const defaultDial = exhibition?.dial_code
    || DIAL_BY_COUNTRY[exhibition?.country_code]
    || (exhibition?.type === "international" ? "+1" : "+91");
  const defaultCountry = exhibition?.country_code
    ? (countries.find((c) => c.code === exhibition.country_code)?.name)
      || (exhibition?.type === "international" ? "United States" : "India")
    : "India";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    dial_code: defaultDial,
    phone: "",
    profession: "",
    country: defaultCountry,
    exhibition_id: (exhibition?.status === "live" ? exhibition?.id : "") || (liveList[0]?.id ?? ""),
    visit_date: "",   // start empty so the "Select…" placeholder shows
    message: "",
  });

  // If live list loads after modal mounts, set the default exhibition id
  useEffect(() => {
    if (!form.exhibition_id && liveList.length > 0) {
      // Prefer URL-bound exhibition if it's live, else first live in list
      const fromUrl = exhibition?.status === "live" ? exhibition.id : null;
      setForm((f) => ({ ...f, exhibition_id: fromUrl || liveList[0].id }));
    }
    // eslint-disable-next-line
  }, [liveList.length, exhibition?.id]);

  const currentExhibition = useMemo(
    () => allCities.find((c) => c.id === form.exhibition_id) || exhibition || liveList[0],
    [form.exhibition_id, exhibition, allCities, liveList]
  );

  // When the selected exhibition changes, auto-adjust dial code + country
  useEffect(() => {
    if (!currentExhibition) return;
    const d = currentExhibition.dial_code
      || DIAL_BY_COUNTRY[currentExhibition.country_code]
      || (currentExhibition.type === "international" ? "+1" : "+91");
    const c = (countries.find((c) => c.code === currentExhibition.country_code)?.name)
      || (currentExhibition.type === "international" ? "United States" : "India");
    setForm((f) => ({ ...f, dial_code: d, country: c }));
  }, [currentExhibition?.id]); // eslint-disable-line

  const dateOptions = useMemo(() => getDateOptions(currentExhibition?.dateRange), [currentExhibition]);

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

  // Sync step → URL when in url-sync standalone mode
  const setStepAndUrl = (s) => {
    setStep(s);
    if (!urlSync || !slug) return;
    const path =
      s === 1 ? `/exhibition/${slug}/register`
      : s === 2 ? `/exhibition/${slug}/register/contact`
      : `/exhibition/${slug}/register/details`;
    if (loc.pathname !== path) navigate(path, { replace: false });
  };

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
      if (!form.profession.trim()) e.profession = "Please enter your profession";
      if (!form.country.trim()) e.country = "Select a country";
    }
    if (s === 3) {
      if (!form.exhibition_id) e.exhibition_id = "Select an exhibition";
      if (!form.visit_date) e.visit_date = "Please select a visit date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStepAndUrl(step + 1); };
  const back = () => setStepAndUrl(step - 1);

  const submit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/register`, {
        ...form,
        city: form.profession,    // keep legacy "city" field populated with profession for back-compat
        exhibition_city: currentExhibition?.name || "",
      });
      setSuccess(true);
      if (onSubmitted) onSubmitted();
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

  // When success in urlSync mode, the parent navigates to /thank-you and unmounts us
  if (success && urlSync) return null;

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
              Thank you, <strong>{form.full_name.split(" ")[0] || "seeker"}</strong>. We will reach
              out to you shortly on WhatsApp & email with the confirmation details for
              <strong> {currentExhibition?.name}</strong>.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="rl-btn rl-btn-dark" onClick={onClose} data-testid="success-close">Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="rl-modal-head">
              <div className="rl-modal-steps" data-testid="modal-steps">Step {step} of 3</div>
              <h3 className="rl-modal-title">Register to Visit</h3>
              {currentExhibition && (
                <p className="rl-modal-sub">
                  <strong>{currentExhibition.name}</strong> · {currentExhibition.dates}
                </p>
              )}
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
                    <label>Profession</label>
                    <input
                      type="text"
                      data-testid="input-profession"
                      value={form.profession}
                      onChange={(e) => update("profession", e.target.value)}
                      placeholder="e.g. Business owner, Doctor, Software Engineer…"
                    />
                    {errors.profession && <div className="rl-field-err">{errors.profession}</div>}
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
                      {liveList.length === 0 && (
                        <option value="">No live exhibitions right now</option>
                      )}
                      {liveList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.dates}{c.timings ? ` · ${c.timings}` : ""}
                        </option>
                      ))}
                    </select>
                    {currentExhibition && (
                      <div className="rl-form-meta-line" style={{ marginTop: 8 }} data-testid="exhibition-meta-line">
                        <span className="rl-form-meta-strong">📅 {currentExhibition.dates}</span>
                        {currentExhibition.timings && <span>🕒 {currentExhibition.timings}</span>}
                        {currentExhibition.venue && <span>📍 {currentExhibition.venue}</span>}
                      </div>
                    )}
                    {errors.exhibition_id && <div className="rl-field-err">{errors.exhibition_id}</div>}
                  </div>
                  <div className="rl-field">
                    <label>Choose Visit Date</label>
                    <select
                      data-testid="select-visit-date"
                      value={form.visit_date}
                      onChange={(e) => update("visit_date", e.target.value)}
                    >
                      <option value="">Select a date…</option>
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
