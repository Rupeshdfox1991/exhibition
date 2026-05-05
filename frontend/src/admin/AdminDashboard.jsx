import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, auth } from "./api";
import EditPageTab from "./EditPageTab";

const LOGO =
  "https://customer-assets.emergentagent.com/job_b271b1af-1da5-4630-96e0-320d96eb6add/artifacts/pm9yuvf5_New%20Rudralife%20final%20logo%20with%20tagline%20%28White%29%20%281%29.png";

const fmt = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
  catch { return iso; }
};

// ─────────── Leads Tab ───────────
function LeadsTab({ exhibitions }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_from: "", date_to: "", exhibition_id: "", visit_date: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listRegistrations(filters);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  };

  // Initial + auto-refresh every 3s for "appears within 2-3 sec" requirement
  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [filters]);

  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const clear = () => setFilters({ date_from: "", date_to: "", exhibition_id: "", visit_date: "" });

  const visitDates = useMemo(() => {
    const set = new Set(items.map((i) => i.visit_date).filter(Boolean));
    return Array.from(set);
  }, [items]);

  return (
    <div data-testid="leads-tab">
      <div className="rl-admin-bar">
        <div className="rl-admin-bar-grid">
          <div className="rl-field">
            <label>From Date</label>
            <input type="date" value={filters.date_from} onChange={(e) => update("date_from", e.target.value)} data-testid="filter-date-from" />
          </div>
          <div className="rl-field">
            <label>To Date</label>
            <input type="date" value={filters.date_to} onChange={(e) => update("date_to", e.target.value)} data-testid="filter-date-to" />
          </div>
          <div className="rl-field">
            <label>Exhibition</label>
            <select value={filters.exhibition_id} onChange={(e) => update("exhibition_id", e.target.value)} data-testid="filter-exhibition">
              <option value="">All Exhibitions</option>
              {exhibitions.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.type})</option>
              ))}
            </select>
          </div>
          <div className="rl-field">
            <label>Visit Date</label>
            <select value={filters.visit_date} onChange={(e) => update("visit_date", e.target.value)} data-testid="filter-visit-date">
              <option value="">Any Visit Date</option>
              {visitDates.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="rl-admin-actions">
          <button className="rl-btn-text" onClick={clear} data-testid="filter-clear">Clear Filters</button>
          <button className="rl-btn rl-btn-primary" onClick={() => api.exportRegistrations(filters)} data-testid="export-excel">
            ⬇ Export Excel
          </button>
        </div>
      </div>

      <div className="rl-admin-meta">
        <span>{loading ? "Loading…" : `${total} lead${total !== 1 ? "s" : ""}`}</span>
        <span className="rl-admin-live"><span className="rl-admin-dot" /> Live · refresh every 3s</span>
      </div>

      <div className="rl-admin-table-wrap">
        <table className="rl-admin-table" data-testid="leads-table">
          <thead>
            <tr>
              <th>Created</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Country</th>
              <th>Exhibition</th>
              <th>Visit Date</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 28, color: "rgba(253,248,240,0.55)" }}>No leads yet</td></tr>
            )}
            {items.map((r) => (
              <tr key={r.id} data-testid={`lead-row-${r.id}`}>
                <td>{fmt(r.created_at)}</td>
                <td>{r.full_name}</td>
                <td>{r.email}</td>
                <td>{r.dial_code} {r.phone}</td>
                <td>{r.city}</td>
                <td>{r.country}</td>
                <td>{r.exhibition_city}</td>
                <td>{r.visit_date}</td>
                <td className="rl-admin-msg">{r.message || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────── Coming Soon Leads Tab ───────────
function ComingSoonLeadsTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_from: "", date_to: "", city: "", exhibition_type: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listNotifyInterest(filters);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [filters]);

  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const clear = () => setFilters({ date_from: "", date_to: "", city: "", exhibition_type: "" });

  const cityOptions = useMemo(() => {
    const set = new Set(items.map((i) => i.interested_city).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  return (
    <div data-testid="notify-leads-tab">
      <div className="rl-admin-bar">
        <div className="rl-admin-bar-grid">
          <div className="rl-field">
            <label>From Date</label>
            <input type="date" value={filters.date_from} onChange={(e) => update("date_from", e.target.value)} data-testid="notify-filter-date-from" />
          </div>
          <div className="rl-field">
            <label>To Date</label>
            <input type="date" value={filters.date_to} onChange={(e) => update("date_to", e.target.value)} data-testid="notify-filter-date-to" />
          </div>
          <div className="rl-field">
            <label>City</label>
            <select value={filters.city} onChange={(e) => update("city", e.target.value)} data-testid="notify-filter-city">
              <option value="">All Cities</option>
              {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="rl-field">
            <label>Type</label>
            <select value={filters.exhibition_type} onChange={(e) => update("exhibition_type", e.target.value)} data-testid="notify-filter-type">
              <option value="">All</option>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>
        <div className="rl-admin-actions">
          <button className="rl-btn-text" onClick={clear} data-testid="notify-filter-clear">Clear Filters</button>
          <button className="rl-btn rl-btn-primary" onClick={() => api.exportNotifyInterest(filters)} data-testid="notify-export-excel">
            ⬇ Export Excel
          </button>
        </div>
      </div>

      <div className="rl-admin-meta">
        <span>{loading ? "Loading…" : `${total} inquiry${total !== 1 ? " · inquiries" : ""}`}</span>
        <span className="rl-admin-live"><span className="rl-admin-dot" /> Live · refresh every 3s</span>
      </div>

      <div className="rl-admin-table-wrap">
        <table className="rl-admin-table" data-testid="notify-leads-table">
          <thead>
            <tr>
              <th>Created</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Interested City</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, color: "rgba(253,248,240,0.55)" }}>No coming-soon inquiries yet</td></tr>
            )}
            {items.map((r) => (
              <tr key={r.id} data-testid={`notify-row-${r.id}`}>
                <td>{fmt(r.created_at)}</td>
                <td>{r.full_name}</td>
                <td>{r.email}</td>
                <td>{r.dial_code} {r.phone}</td>
                <td>{r.interested_city}</td>
                <td style={{ textTransform: "capitalize" }}>{r.exhibition_type || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────── Notify Cities Tab (manages dropdown shown in public Notify-Me form) ───────────
function NotifyCitiesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", type: "domestic", order: 50 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listNotifyCities();
      setItems(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => ({
    domestic: items.filter((i) => i.type === "domestic").slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name)),
    international: items.filter((i) => i.type === "international").slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name)),
  }), [items]);

  const add = async () => {
    setErr("");
    if (!form.name.trim()) { setErr("City name is required"); return; }
    setBusy(true);
    try {
      await api.createNotifyCity({ name: form.name.trim(), type: form.type, order: form.order });
      setForm({ name: "", type: form.type, order: 50 });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || "Failed to add city");
    } finally { setBusy(false); }
  };

  const remove = async (city) => {
    if (!window.confirm(`Remove "${city.name}" from the Coming-Soon dropdown?`)) return;
    await api.deleteNotifyCity(city.id);
    await load();
  };

  return (
    <div data-testid="notify-cities-tab">
      <div className="rl-admin-helper-text" style={{ marginBottom: 16 }}>
        These are the cities visitors can choose from in the public <strong>"Notify Me When You Visit"</strong> form.
        Add or remove cities to match where Rudralife is planning to visit. Cities are auto-seeded from your Exhibitions list on first run.
      </div>
      <div className="rl-admin-form" data-testid="notify-city-form">
        <h3>Add a City</h3>
        <div className="rl-admin-form-grid">
          <div className="rl-field"><label>City Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lucknow" data-testid="notify-city-name" />
          </div>
          <div className="rl-field"><label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} data-testid="notify-city-type">
              <option value="domestic">Domestic (India)</option>
              <option value="international">International</option>
            </select>
          </div>
          <div className="rl-field"><label>Display Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value || "0", 10) })} data-testid="notify-city-order" />
          </div>
        </div>
        <div className="rl-admin-form-actions">
          <span />
          <button className="rl-btn rl-btn-primary" onClick={add} disabled={busy} data-testid="notify-city-add">
            {busy ? "Adding…" : "+ Add City"}
          </button>
        </div>
        {err && (
          <div className="rl-admin-form-error" data-testid="notify-city-error">{err}</div>
        )}
      </div>

      {["domestic", "international"].map((t) => (
        <div key={t} style={{ marginTop: 30 }}>
          <h3 className="rl-admin-section-title">
            {t === "domestic" ? "🇮🇳 Domestic" : "🌐 International"} ({grouped[t].length})
          </h3>
          <div className="rl-admin-chips">
            {grouped[t].length === 0 && (
              <div style={{ padding: 18, color: "rgba(253,248,240,0.55)" }}>
                {loading ? "Loading…" : "No cities yet"}
              </div>
            )}
            {grouped[t].map((c) => (
              <div className="rl-admin-chip" key={c.id} data-testid={`notify-city-chip-${c.id}`}>
                <span className="rl-admin-chip-name">{c.name}</span>
                <button
                  className="rl-admin-chip-x"
                  onClick={() => remove(c)}
                  data-testid={`notify-city-delete-${c.id}`}
                  aria-label={`Remove ${c.name}`}
                  title="Remove"
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────── Exhibitions Tab ───────────
function emptyExhibition() {
  return { name: "", type: "domestic", image: "", status: "soon", start_date: "", end_date: "", timings: "10:00 AM to 8:00 PM (Sunday Open)", venue: "", address: "", order: 50 };
}

function ExhibitionsTab({ exhibitions, reload }) {
  const [editing, setEditing] = useState(null); // null | "new" | exhibition object
  const [form, setForm] = useState(emptyExhibition());
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const startNew = () => { setForm(emptyExhibition()); setEditing("new"); };
  const startEdit = (ex) => {
    setForm({
      name: ex.name || "", type: ex.type || "domestic", image: ex.image || "",
      status: ex.status || "soon",
      start_date: ex.start_date || "", end_date: ex.end_date || "",
      timings: ex.timings || "", venue: ex.venue || "", address: ex.address || "",
      order: ex.order ?? 50,
    });
    setEditing(ex);
  };
  const cancel = () => { setEditing(null); setForm(emptyExhibition()); };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) { alert("Exhibition name is required"); return; }
    setBusy(true);
    try {
      if (editing === "new") {
        await api.createExhibition(form);
      } else {
        await api.updateExhibition(editing.id, form);
      }
      cancel();
      await reload();
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    } finally { setBusy(false); }
  };

  const toggle = async (ex) => {
    const next = ex.status === "live" ? "soon" : "live";
    await api.toggleExhibitionStatus(ex.id, next);
    await reload();
  };

  const remove = async (ex) => {
    if (!window.confirm(`Delete "${ex.name}"? This cannot be undone.`)) return;
    await api.deleteExhibition(ex.id);
    await reload();
  };

  const mapsUrl = useMemo(() => {
    const q = `${form.venue || ""} ${form.address || ""}`.trim();
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "";
  }, [form.venue, form.address]);

  const grouped = useMemo(() => {
    const sortLiveFirst = (a, b) => {
      if (a.status === b.status) return (a.order ?? 0) - (b.order ?? 0);
      return a.status === "live" ? -1 : 1;
    };
    return {
      domestic: exhibitions.filter((e) => e.type === "domestic").slice().sort(sortLiveFirst),
      international: exhibitions.filter((e) => e.type === "international").slice().sort(sortLiveFirst),
    };
  }, [exhibitions]);

  return (
    <div data-testid="exhibitions-tab">
      <div className="rl-admin-actions" style={{ justifyContent: "flex-end", marginBottom: 22 }}>
        <button className="rl-btn rl-btn-primary" onClick={startNew} data-testid="add-exhibition">+ Add Exhibition</button>
      </div>

      {editing && (
        <div className="rl-admin-form" data-testid="exhibition-form">
          <h3>{editing === "new" ? "Add Exhibition" : `Edit: ${editing.name}`}</h3>
          <div className="rl-admin-form-grid">
            <div className="rl-field"><label>Name *</label><input value={form.name} onChange={(e) => update("name", e.target.value)} data-testid="exh-name" /></div>
            <div className="rl-field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => update("type", e.target.value)} data-testid="exh-type">
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
              </select>
            </div>
            <div className="rl-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} data-testid="exh-status">
                <option value="live">Live Now</option>
                <option value="soon">Coming Soon</option>
              </select>
            </div>
            <div className="rl-field" style={{ gridColumn: "1 / -1" }}>
              <label>Exhibition Image</label>
              <div className="rl-admin-image-row">
                {form.image && (
                  <div className="rl-admin-image-thumb" data-testid="exh-image-thumb">
                    <img src={form.image} alt="preview" />
                  </div>
                )}
                <div className="rl-admin-image-controls">
                  <input
                    value={form.image}
                    onChange={(e) => update("image", e.target.value)}
                    placeholder="https://… or upload below"
                    data-testid="exh-image"
                  />
                  <label className="rl-btn rl-btn-dark rl-admin-upload-btn" data-testid="exh-image-upload-label">
                    {uploading ? "Uploading…" : "📤 Upload Image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      disabled={uploading}
                      data-testid="exh-image-upload"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (f.size > 4 * 1024 * 1024) {
                          alert("Image is larger than 4 MB. Please compress or pick a smaller file.");
                          e.target.value = "";
                          return;
                        }
                        setUploading(true);
                        try {
                          const res = await api.uploadImage(f);
                          update("image", res.absolute_url);
                        } catch (err) {
                          alert(err?.response?.data?.detail || err.message);
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="rl-admin-helper-text">
                Recommended <strong>1200 × 800 px</strong> · 3:2 aspect ratio · JPG / PNG / WebP · max 4 MB.
                Larger or differently-shaped images will be auto-cropped to fit the card.
              </div>
            </div>
            <div className="rl-field"><label>Start Date</label><input type="date" value={form.start_date || ""} onChange={(e) => update("start_date", e.target.value)} data-testid="exh-start" /></div>
            <div className="rl-field"><label>End Date</label><input type="date" value={form.end_date || ""} onChange={(e) => update("end_date", e.target.value)} data-testid="exh-end" /></div>
            <div className="rl-field"><label>Timings</label><input value={form.timings} onChange={(e) => update("timings", e.target.value)} data-testid="exh-timings" /></div>
            <div className="rl-field"><label>Display Order</label><input type="number" value={form.order} onChange={(e) => update("order", parseInt(e.target.value || "0", 10))} data-testid="exh-order" /></div>
            <div className="rl-field" style={{ gridColumn: "1 / -1" }}>
              <label>Venue (Hotel / Place name)</label>
              <input value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="e.g. Lemon Tree Hotel" data-testid="exh-venue" />
            </div>
            <div className="rl-field" style={{ gridColumn: "1 / -1" }}>
              <label>Venue Address</label>
              <input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="e.g. Banjara Hills, Hyderabad, Telangana" data-testid="exh-address" />
            </div>
          </div>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="rl-admin-maps-preview" data-testid="exh-maps-preview">
              📍 Preview on Google Maps ↗
            </a>
          )}
          <div className="rl-admin-form-actions">
            <button className="rl-btn-text" onClick={cancel} disabled={busy}>Cancel</button>
            <button className="rl-btn rl-btn-primary" onClick={save} disabled={busy} data-testid="exh-save">
              {busy ? "Saving…" : (editing === "new" ? "Create" : "Save Changes")}
            </button>
          </div>
        </div>
      )}

      {["domestic", "international"].map((t) => (
        <div key={t} style={{ marginTop: 30 }}>
          <h3 className="rl-admin-section-title">{t === "domestic" ? "🇮🇳 Domestic" : "🌐 International"} ({grouped[t].length})</h3>
          <div className="rl-admin-grid">
            {grouped[t].map((ex) => (
              <div key={ex.id} className={`rl-admin-card ${ex.status === "live" ? "live" : ""}`} data-testid={`admin-card-${ex.id}`}>
                {ex.image && <img src={ex.image} alt={ex.name} className="rl-admin-card-img" loading="lazy" />}
                <div className="rl-admin-card-body">
                  <div className="rl-admin-card-head">
                    <h4>{ex.name}</h4>
                    <label className="rl-switch" title="Toggle Live / Coming Soon">
                      <input type="checkbox" checked={ex.status === "live"} onChange={() => toggle(ex)} data-testid={`toggle-${ex.id}`} />
                      <span className="rl-switch-slider" />
                    </label>
                  </div>
                  <div className={`rl-admin-status ${ex.status}`}>{ex.status === "live" ? "● LIVE NOW" : "○ Coming Soon"}</div>
                  {ex.start_date && <div className="rl-admin-meta-line">📅 {ex.start_date} → {ex.end_date || "—"}</div>}
                  {ex.venue && <div className="rl-admin-meta-line">📍 {ex.venue}</div>}
                  {ex.address && <div className="rl-admin-meta-line">🗺 {ex.address}</div>}
                  <div className="rl-admin-card-actions">
                    <button className="rl-btn-text" onClick={() => startEdit(ex)} data-testid={`edit-${ex.id}`}>Edit</button>
                    <button className="rl-btn-text rl-btn-danger" onClick={() => remove(ex)} data-testid={`delete-${ex.id}`}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {grouped[t].length === 0 && (
              <div style={{ padding: 30, color: "rgba(253,248,240,0.55)" }}>No {t} exhibitions yet</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────── Dashboard ───────────
export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("leads");
  const [exhibitions, setExhibitions] = useState([]);
  const [admin, setAdmin] = useState(null);

  const reload = async () => {
    try {
      const [me, exs] = await Promise.all([api.me(), api.listExhibitions()]);
      setAdmin(me);
      setExhibitions(exs);
    } catch (e) { /* 401 handled by axios interceptor */ }
  };

  useEffect(() => { reload(); }, []);

  const logout = () => { auth.clear(); nav("/admin/login", { replace: true }); };

  return (
    <div className="rl-admin-app" data-testid="admin-dashboard">
      <header className="rl-admin-header">
        <div className="rl-admin-header-inner">
          <div className="rl-admin-brand">
            <img src={LOGO} alt="Rudralife" />
            <div>
              <div className="rl-admin-brand-title">Rudralife Admin</div>
              <div className="rl-admin-brand-sub">{admin?.email || ""}</div>
            </div>
          </div>
          <nav className="rl-admin-tabs">
            <button className={`rl-admin-tab ${tab === "leads" ? "active" : ""}`} onClick={() => setTab("leads")} data-testid="tab-leads">Exhibition Leads</button>
            <button className={`rl-admin-tab ${tab === "notify" ? "active" : ""}`} onClick={() => setTab("notify")} data-testid="tab-notify-leads">Coming Soon Leads</button>
            <button className={`rl-admin-tab ${tab === "exhibitions" ? "active" : ""}`} onClick={() => setTab("exhibitions")} data-testid="tab-exhibitions">Exhibitions</button>
            <button className={`rl-admin-tab ${tab === "cities" ? "active" : ""}`} onClick={() => setTab("cities")} data-testid="tab-notify-cities">Notify Cities</button>
            <button className={`rl-admin-tab rl-admin-tab-cms ${tab === "edit-page" ? "active" : ""}`} onClick={() => setTab("edit-page")} data-testid="tab-edit-page">✎ Edit Page</button>
          </nav>
          <div className="rl-admin-user-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="rl-btn-text">View Site ↗</a>
            <button className="rl-btn-text" onClick={logout} data-testid="admin-logout">Logout</button>
          </div>
        </div>
      </header>
      <main className="rl-admin-main">
        {tab === "leads" && <LeadsTab exhibitions={exhibitions} />}
        {tab === "notify" && <ComingSoonLeadsTab />}
        {tab === "exhibitions" && <ExhibitionsTab exhibitions={exhibitions} reload={reload} />}
        {tab === "cities" && <NotifyCitiesTab />}
        {tab === "edit-page" && <EditPageTab />}
      </main>
    </div>
  );
}
