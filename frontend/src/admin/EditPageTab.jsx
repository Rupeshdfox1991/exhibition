import { useEffect, useState } from "react";
import { api } from "./api";
import { seedListsWithDefaults } from "./cmsDefaults";

// ─────────── Reusable controls ───────────
function TextField({ label, value, onChange, placeholder, multiline = false, rows = 3, helper, testId }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="rl-field rl-cms-field">
      <label>{label}</label>
      <Tag
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        data-testid={testId}
        {...(multiline ? { rows } : {})}
      />
      {helper && <div className="rl-admin-helper-text">{helper}</div>}
    </div>
  );
}

function Toggle({ label, checked, onChange, testId }) {
  return (
    <label className="rl-cms-toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} />
      <span className="rl-cms-toggle-slider" />
      <span className="rl-cms-toggle-label">{label}</span>
    </label>
  );
}

function ImageField({ label, value, onChange, helper, testId }) {
  const [busy, setBusy] = useState(false);
  const upload = async (file) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { alert("Image larger than 4 MB."); return; }
    setBusy(true);
    try {
      const r = await api.uploadImage(file);
      onChange(r.absolute_url);
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    } finally { setBusy(false); }
  };
  return (
    <div className="rl-field rl-cms-field">
      <label>{label}</label>
      <div className="rl-admin-image-row">
        {value && (
          <div className="rl-admin-image-thumb"><img src={value} alt="preview" /></div>
        )}
        <div className="rl-admin-image-controls">
          <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" data-testid={testId} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label className="rl-btn rl-btn-dark rl-admin-upload-btn">
              {busy ? "Uploading…" : "📤 Upload"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                disabled={busy}
                onChange={(e) => upload(e.target.files?.[0])}
                data-testid={`${testId}-upload`}
              />
            </label>
            {value && (
              <button type="button" className="rl-btn-text rl-btn-danger" onClick={() => onChange("")} data-testid={`${testId}-clear`}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      {helper && <div className="rl-admin-helper-text">{helper}</div>}
    </div>
  );
}

function Section({ title, sectionKey, visibility, onVisibilityChange, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rl-cms-section" data-testid={`cms-section-${sectionKey}`}>
      <div className="rl-cms-section-head">
        <button type="button" className="rl-cms-section-toggle" onClick={() => setOpen(!open)}>
          <span className="rl-cms-section-chevron">{open ? "▾" : "▸"}</span>
          <span>{title}</span>
        </button>
        {visibility !== undefined && (
          <Toggle
            label={visibility ? "Visible" : "Hidden"}
            checked={visibility}
            onChange={onVisibilityChange}
            testId={`cms-vis-${sectionKey}`}
          />
        )}
      </div>
      {open && <div className="rl-cms-section-body">{children}</div>}
    </div>
  );
}

// ─────────── Array editors (add/edit/delete rows) ───────────
function ListEditor({ items, setItems, fields, addLabel, testIdPrefix }) {
  const update = (idx, key, val) => {
    const next = items.slice();
    next[idx] = { ...next[idx], [key]: val };
    setItems(next);
  };
  const remove = (idx) => {
    if (!window.confirm("Remove this item?")) return;
    setItems(items.filter((_, i) => i !== idx));
  };
  const move = (idx, dir) => {
    const next = items.slice();
    const ni = idx + dir;
    if (ni < 0 || ni >= next.length) return;
    [next[idx], next[ni]] = [next[ni], next[idx]];
    setItems(next);
  };
  const add = () => {
    const blank = {};
    fields.forEach((f) => { blank[f.key] = f.default ?? ""; });
    setItems([...items, blank]);
  };
  return (
    <div className="rl-cms-list">
      {items.map((it, i) => (
        <div className="rl-cms-list-item" key={i} data-testid={`${testIdPrefix}-${i}`}>
          <div className="rl-cms-list-item-head">
            <span className="rl-cms-list-num">#{i + 1}</span>
            <div className="rl-cms-list-actions">
              <button type="button" className="rl-btn-text" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" className="rl-btn-text" onClick={() => move(i, +1)} disabled={i === items.length - 1}>↓</button>
              <button type="button" className="rl-btn-text rl-btn-danger" onClick={() => remove(i)} data-testid={`${testIdPrefix}-${i}-delete`}>✕ Delete</button>
            </div>
          </div>
          <div className="rl-cms-list-fields">
            {fields.map((f) => f.type === "image" ? (
              <ImageField key={f.key} label={f.label} value={it[f.key]} onChange={(v) => update(i, f.key, v)} testId={`${testIdPrefix}-${i}-${f.key}`} helper={f.helper} />
            ) : (
              <TextField key={f.key} label={f.label} value={it[f.key]} onChange={(v) => update(i, f.key, v)} placeholder={f.placeholder} multiline={f.multiline} rows={f.rows} testId={`${testIdPrefix}-${i}-${f.key}`} />
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="rl-btn rl-btn-dark rl-cms-list-add" onClick={add} data-testid={`${testIdPrefix}-add`}>
        + {addLabel}
      </button>
    </div>
  );
}

// ─────────── Main Edit Page Tab ───────────
const IMG_HELPERS = {
  banner: "Recommended 1920 × 720 px · landscape · max 4 MB · JPG/PNG/WebP",
  square: "Recommended 800 × 800 px · square · max 4 MB",
  portrait: "Recommended 600 × 800 px · portrait · max 4 MB",
  logo: "Transparent PNG preferred · ~400 × 200 px · max 2 MB",
};

export default function EditPageTab() {
  const [content, setContent] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    api.getSiteContent()
      .then((d) => { if (alive) setContent(seedListsWithDefaults(d || {})); })
      .catch((e) => setErr(e.message))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const setKey = (path, value) => {
    setContent((prev) => {
      const next = { ...(prev || {}) };
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...(cur[parts[i]] || {}) };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };
  const get = (path, fallback) => {
    const parts = path.split(".");
    let cur = content || {};
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else return fallback;
    }
    return cur === undefined ? fallback : cur;
  };

  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      const r = await api.saveSiteContent(content || {});
      setSavedAt(r.updated_at);
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    } finally { setSaving(false); }
  };

  const resetAll = async () => {
    if (!window.confirm("Restore the entire page to defaults? All custom edits will be cleared on the live site.")) return;
    setSaving(true);
    setErr("");
    try {
      await api.resetSiteContent();
      const fresh = await api.getSiteContent();
      setContent(seedListsWithDefaults(fresh || {}));
      setSavedAt(new Date().toISOString());
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "rgba(253,248,240,0.6)" }}>Loading site content…</div>;

  return (
    <div data-testid="edit-page-tab">
      <div className="rl-cms-toolbar">
        <div className="rl-cms-toolbar-text">
          <h2>Edit Full Page</h2>
          <p>Change anything on the public site — header, banner, sections, images, FAQs, autoscroll. Hit <strong>Save Changes</strong> when you're done; the live site updates instantly.</p>
        </div>
        <div className="rl-cms-toolbar-actions">
          <button className="rl-btn-text rl-cms-reset" onClick={resetAll} disabled={saving} data-testid="cms-reset-btn">
            ↺ Restore Defaults
          </button>
          <button className="rl-btn rl-btn-primary rl-cms-save" onClick={save} disabled={saving} data-testid="cms-save-btn">
            {saving ? "Saving…" : "💾 Save Changes"}
          </button>
          {savedAt && <span className="rl-cms-saved">Saved {new Date(savedAt).toLocaleTimeString()}</span>}
        </div>
      </div>
      {err && <div className="rl-admin-form-error" data-testid="cms-error">{err}</div>}

      {/* HEADER */}
      <Section title="🏛 Header / Navigation" sectionKey="navbar" defaultOpen>
        <ImageField label="Logo Image" value={get("navbar.logo")} onChange={(v) => setKey("navbar.logo", v)} helper={IMG_HELPERS.logo} testId="cms-navbar-logo" />
        <TextField label="CTA Button Text" value={get("navbar.cta")} onChange={(v) => setKey("navbar.cta", v)} placeholder="Register" testId="cms-navbar-cta" />
        <h4 className="rl-cms-sub-h">Menu Items (label + scroll target / URL)</h4>
        <ListEditor
          items={get("navbar.menu", [])}
          setItems={(v) => setKey("navbar.menu", v)}
          fields={[
            { key: "label", label: "Label", placeholder: "About" },
            { key: "target", label: "Section ID or Full URL", placeholder: "about · or https://..." },
          ]}
          addLabel="Add Menu Item"
          testIdPrefix="cms-nav-menu"
        />
      </Section>

      {/* BANNER / HERO */}
      <Section title="🖼 Banner (Hero Section)" sectionKey="hero" defaultOpen>
        <ImageField label="Banner Image" value={get("hero.banner_image")} onChange={(v) => setKey("hero.banner_image", v)} helper={IMG_HELPERS.banner} testId="cms-hero-banner" />
        <div className="rl-admin-form-grid">
          <TextField label="Established Tagline" value={get("hero.est_text")} onChange={(v) => setKey("hero.est_text", v)} placeholder="EST. 2001 · MUMBAI" testId="cms-hero-est" />
          <TextField label="Sanskrit / OM Text" value={get("hero.om_text")} onChange={(v) => setKey("hero.om_text", v)} placeholder="ॐ नमः शिवाय" testId="cms-hero-om" />
          <TextField label="OM Subtext" value={get("hero.om_sub")} onChange={(v) => setKey("hero.om_sub", v)} placeholder="Sacred Guidance Since 2001" testId="cms-hero-om-sub" />
          <TextField label="Main Title — Line 1" value={get("hero.title_line1")} onChange={(v) => setKey("hero.title_line1", v)} placeholder="Explore the world of" testId="cms-hero-title1" />
          <TextField label="Main Title — Highlight (gold)" value={get("hero.title_highlight")} onChange={(v) => setKey("hero.title_highlight", v)} placeholder="Rudraksha" testId="cms-hero-title-hl" />
          <TextField label="Main Title — Line 2" value={get("hero.title_line2")} onChange={(v) => setKey("hero.title_line2", v)} placeholder="with Rudralife" testId="cms-hero-title2" />
        </div>
        <TextField label="Tagline" value={get("hero.tagline")} onChange={(v) => setKey("hero.tagline", v)} placeholder="Sacred Rudraksha · Ancient Wisdom · Modern World" testId="cms-hero-tagline" />
        <TextField label="Sub-tagline" value={get("hero.sub2")} onChange={(v) => setKey("hero.sub2", v)} placeholder="Explore, Experience, Elevate with Rudralife" testId="cms-hero-sub2" />
        <div className="rl-admin-form-grid">
          <TextField label="Primary Button Text" value={get("hero.register_btn")} onChange={(v) => setKey("hero.register_btn", v)} placeholder="Register Now" testId="cms-hero-cta1" />
          <TextField label="Secondary Button Text" value={get("hero.notify_btn")} onChange={(v) => setKey("hero.notify_btn", v)} placeholder="Get Notified When We Visit Your City" testId="cms-hero-cta2" />
        </div>
        <h4 className="rl-cms-sub-h">Stat Cards (number + label)</h4>
        <ListEditor
          items={get("hero.stats", [])}
          setItems={(v) => setKey("hero.stats", v)}
          fields={[
            { key: "num", label: "Number", placeholder: "25+" },
            { key: "lbl", label: "Label", placeholder: "Years" },
          ]}
          addLabel="Add Stat"
          testIdPrefix="cms-hero-stat"
        />
      </Section>

      {/* FOCUS BOX */}
      <Section
        title="✨ Focus Box (Reasons to Explore)"
        sectionKey="focus_box"
        visibility={get("section_visibility.focus_box", true)}
        onVisibilityChange={(v) => setKey("section_visibility.focus_box", v)}
      >
        <div className="rl-admin-form-grid">
          <TextField label="Section Tag" value={get("focus_box.tag")} onChange={(v) => setKey("focus_box.tag", v)} placeholder="The Rudralife Experience" testId="cms-focus-tag" />
          <TextField label="Title" value={get("focus_box.title")} onChange={(v) => setKey("focus_box.title", v)} placeholder="Reasons to Explore the" testId="cms-focus-title" />
          <TextField label="Title Highlight (gold)" value={get("focus_box.title_highlight")} onChange={(v) => setKey("focus_box.title_highlight", v)} placeholder="Rudralife Exhibition" testId="cms-focus-hl" />
          <TextField label="Subtitle" value={get("focus_box.subtitle")} onChange={(v) => setKey("focus_box.subtitle", v)} placeholder="Six powerful reasons…" testId="cms-focus-sub" />
        </div>
        <h4 className="rl-cms-sub-h">Focus Points (add / edit / delete)</h4>
        <ListEditor
          items={get("focus_box.points", [])}
          setItems={(v) => setKey("focus_box.points", v)}
          fields={[
            { key: "icon", label: "Icon / Emoji", placeholder: "✨", default: "✨" },
            { key: "title", label: "Title", placeholder: "Special Exhibition Offers" },
            { key: "body", label: "Description", placeholder: "Enjoy exclusive…", multiline: true, rows: 2 },
          ]}
          addLabel="Add Point"
          testIdPrefix="cms-focus-point"
        />
      </Section>

      {/* GLOBAL PRESENCE */}
      <Section
        title="🌐 Global Presence (Footprint Map)"
        sectionKey="global_presence"
        visibility={get("section_visibility.global_presence", true)}
        onVisibilityChange={(v) => setKey("section_visibility.global_presence", v)}
      >
        <ImageField label="Map Image" value={get("global_presence.map_image")} onChange={(v) => setKey("global_presence.map_image", v)} helper={IMG_HELPERS.banner} testId="cms-map-image" />
        <div className="rl-admin-form-grid">
          <TextField label="Section Tag" value={get("global_presence.tag")} onChange={(v) => setKey("global_presence.tag", v)} placeholder="Our Footprint" testId="cms-gp-tag" />
          <TextField label="Title" value={get("global_presence.title")} onChange={(v) => setKey("global_presence.title", v)} placeholder="Our Global" testId="cms-gp-title" />
          <TextField label="Title Highlight" value={get("global_presence.title_highlight")} onChange={(v) => setKey("global_presence.title_highlight", v)} placeholder="Presence" testId="cms-gp-hl" />
        </div>
        <TextField label="Subtitle" value={get("global_presence.subtitle")} onChange={(v) => setKey("global_presence.subtitle", v)} placeholder="Five countries…" multiline rows={2} testId="cms-gp-sub" />
      </Section>

      {/* COLLECTION */}
      <Section
        title="📿 Rudraksha Collection"
        sectionKey="collection"
        visibility={get("section_visibility.collection", true)}
        onVisibilityChange={(v) => setKey("section_visibility.collection", v)}
      >
        <div className="rl-admin-form-grid">
          <TextField label="Section Tag" value={get("collection.tag")} onChange={(v) => setKey("collection.tag", v)} placeholder="Sacred Collection" testId="cms-coll-tag" />
          <TextField label="Title" value={get("collection.title")} onChange={(v) => setKey("collection.title", v)} placeholder="Our Rudraksha" testId="cms-coll-title" />
          <TextField label="Title Highlight" value={get("collection.title_highlight")} onChange={(v) => setKey("collection.title_highlight", v)} placeholder="Collection" testId="cms-coll-hl" />
        </div>
        <TextField label="Subtitle" value={get("collection.subtitle")} onChange={(v) => setKey("collection.subtitle", v)} placeholder="Handpicked, lab-certified Rudraksha…" multiline rows={2} testId="cms-coll-sub" />
        <div className="rl-cms-autoscroll-row">
          <Toggle label="Auto-scroll Enabled" checked={get("collection.autoplay", true) !== false} onChange={(v) => setKey("collection.autoplay", v)} testId="cms-coll-autoplay" />
          <div className="rl-field rl-cms-field" style={{ minWidth: 200 }}>
            <label>Scroll Speed</label>
            <select value={get("collection.speed", "medium")} onChange={(e) => setKey("collection.speed", e.target.value)} data-testid="cms-coll-speed">
              <option value="slow">Slow</option>
              <option value="medium">Medium (default)</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>
        <h4 className="rl-cms-sub-h">Products (add / edit / delete)</h4>
        <ListEditor
          items={get("collection.products", [])}
          setItems={(v) => setKey("collection.products", v)}
          fields={[
            { key: "img", label: "Image", type: "image", helper: IMG_HELPERS.square },
            { key: "name", label: "Product Name", placeholder: "Indra Mala" },
            { key: "benefit", label: "Description", placeholder: "For Supreme Power…", multiline: true, rows: 2 },
          ]}
          addLabel="Add Product"
          testIdPrefix="cms-coll-product"
        />
      </Section>

      {/* EXPERTS */}
      <Section
        title="👤 Panel Experts"
        sectionKey="experts"
        visibility={get("section_visibility.experts", true)}
        onVisibilityChange={(v) => setKey("section_visibility.experts", v)}
      >
        <div className="rl-admin-form-grid">
          <TextField label="Section Tag" value={get("experts.tag")} onChange={(v) => setKey("experts.tag", v)} placeholder="Guided by Masters" testId="cms-exp-tag" />
          <TextField label="Title" value={get("experts.title")} onChange={(v) => setKey("experts.title", v)} placeholder="Panel" testId="cms-exp-title" />
          <TextField label="Title Highlight" value={get("experts.title_highlight")} onChange={(v) => setKey("experts.title_highlight", v)} placeholder="Experts" testId="cms-exp-hl" />
          <TextField label="Title Suffix" value={get("experts.title_suffix")} onChange={(v) => setKey("experts.title_suffix", v)} placeholder="of Rudralife" testId="cms-exp-suffix" />
        </div>
        <TextField label="Subtitle" value={get("experts.subtitle")} onChange={(v) => setKey("experts.subtitle", v)} placeholder="Meet the guiding minds…" multiline rows={2} testId="cms-exp-sub" />
        <h4 className="rl-cms-sub-h">Experts (add / edit / delete)</h4>
        <ListEditor
          items={get("experts.items", [])}
          setItems={(v) => setKey("experts.items", v)}
          fields={[
            { key: "img", label: "Photo", type: "image", helper: IMG_HELPERS.portrait },
            { key: "name", label: "Name", placeholder: "Dr. Tanay Seetha" },
            { key: "title", label: "Designation", placeholder: "Founder of Rudralife" },
            { key: "bio", label: "Short Bio", placeholder: "Founder and visionary leader…", multiline: true, rows: 2 },
            { key: "social", label: "Social / Profile URL (optional)", placeholder: "https://linkedin.com/..." },
          ]}
          addLabel="Add Expert"
          testIdPrefix="cms-expert"
        />
      </Section>

      {/* TRUSTED */}
      <Section
        title="🤝 Trusted Clients (Logos / Faces strip)"
        sectionKey="trusted"
        visibility={get("section_visibility.trusted", true)}
        onVisibilityChange={(v) => setKey("section_visibility.trusted", v)}
      >
        <div className="rl-admin-form-grid">
          <TextField label="Section Tag" value={get("trusted.tag")} onChange={(v) => setKey("trusted.tag", v)} placeholder="Seekers Worldwide" testId="cms-trusted-tag" />
          <TextField label="Title" value={get("trusted.title")} onChange={(v) => setKey("trusted.title", v)} placeholder="Trusted by" testId="cms-trusted-title" />
          <TextField label="Title Highlight" value={get("trusted.title_highlight")} onChange={(v) => setKey("trusted.title_highlight", v)} placeholder="Seekers Worldwide" testId="cms-trusted-hl" />
        </div>
        <TextField label="Subtitle" value={get("trusted.subtitle")} onChange={(v) => setKey("trusted.subtitle", v)} placeholder="From spiritual practitioners…" multiline rows={2} testId="cms-trusted-sub" />
        <h4 className="rl-cms-sub-h">Trusted Clients / Seekers</h4>
        <ListEditor
          items={get("trusted.items", [])}
          setItems={(v) => setKey("trusted.items", v)}
          fields={[
            { key: "img", label: "Photo / Logo", type: "image", helper: IMG_HELPERS.square },
            { key: "name", label: "Name", placeholder: "Milind Soman" },
            { key: "role", label: "Role", placeholder: "Model" },
            { key: "link", label: "Optional Link", placeholder: "https://..." },
          ]}
          addLabel="Add Trusted Client"
          testIdPrefix="cms-trusted"
        />
      </Section>

      {/* VIDEO TESTIMONIALS */}
      <Section
        title="🎥 Video Testimonials"
        sectionKey="testimonials"
        visibility={get("section_visibility.testimonials", true)}
        onVisibilityChange={(v) => setKey("section_visibility.testimonials", v)}
      >
        <div className="rl-admin-form-grid">
          <TextField label="Section Tag" value={get("testimonials.tag")} onChange={(v) => setKey("testimonials.tag", v)} placeholder="Real Stories" testId="cms-testi-tag" />
          <TextField label="Title" value={get("testimonials.title")} onChange={(v) => setKey("testimonials.title", v)} placeholder="What Our" testId="cms-testi-title" />
          <TextField label="Title Highlight" value={get("testimonials.title_highlight")} onChange={(v) => setKey("testimonials.title_highlight", v)} placeholder="Clients Say" testId="cms-testi-hl" />
        </div>
        <TextField label="Subtitle" value={get("testimonials.subtitle")} onChange={(v) => setKey("testimonials.subtitle", v)} placeholder="Hear from those whose lives…" multiline rows={2} testId="cms-testi-sub" />
        <h4 className="rl-cms-sub-h">Video Cards</h4>
        <ListEditor
          items={get("testimonials.items", [])}
          setItems={(v) => setKey("testimonials.items", v)}
          fields={[
            { key: "img", label: "Thumbnail", type: "image", helper: IMG_HELPERS.square },
            { key: "url", label: "Video URL (YouTube / Vimeo / direct)", placeholder: "https://youtu.be/..." },
            { key: "caption", label: "Caption", placeholder: "Watch Story" },
          ]}
          addLabel="Add Video"
          testIdPrefix="cms-testi"
        />
      </Section>

      {/* MEDIA / RECOGNITION */}
      <Section
        title="📰 Media / Recognition"
        sectionKey="media"
        visibility={get("section_visibility.media", true)}
        onVisibilityChange={(v) => setKey("section_visibility.media", v)}
      >
        <div className="rl-admin-form-grid">
          <TextField label="Section Tag" value={get("media.tag")} onChange={(v) => setKey("media.tag", v)} placeholder="In The Media" testId="cms-media-tag" />
          <TextField label="Title" value={get("media.title")} onChange={(v) => setKey("media.title", v)} placeholder="Featured &" testId="cms-media-title" />
          <TextField label="Title Highlight" value={get("media.title_highlight")} onChange={(v) => setKey("media.title_highlight", v)} placeholder="Recognised" testId="cms-media-hl" />
          <TextField label="'Featured In' Strip Label" value={get("media.featured_label")} onChange={(v) => setKey("media.featured_label", v)} placeholder="As Featured In" testId="cms-media-featured" />
        </div>
        <TextField label="Subtitle" value={get("media.subtitle")} onChange={(v) => setKey("media.subtitle", v)} placeholder="Rudralife has been featured…" multiline rows={2} testId="cms-media-sub" />
        <h4 className="rl-cms-sub-h">Featured Cards (image + title + link)</h4>
        <ListEditor
          items={get("media.features", [])}
          setItems={(v) => setKey("media.features", v)}
          fields={[
            { key: "img", label: "Image", type: "image", helper: IMG_HELPERS.square },
            { key: "label", label: "Outlet Label", placeholder: "Bombay Times" },
            { key: "title", label: "Title", placeholder: "Bombay Times Feature" },
            { key: "desc", label: "Description", placeholder: "Rudralife featured in…", multiline: true, rows: 2 },
            { key: "url", label: "Article / Video URL", placeholder: "https://..." },
          ]}
          addLabel="Add Media Feature"
          testIdPrefix="cms-media-feature"
        />
        <h4 className="rl-cms-sub-h">"As Featured In" Logos</h4>
        <ListEditor
          items={get("media.logos", [])}
          setItems={(v) => setKey("media.logos", v)}
          fields={[
            { key: "img", label: "Logo", type: "image", helper: IMG_HELPERS.logo },
            { key: "link", label: "Optional Link", placeholder: "https://..." },
          ]}
          addLabel="Add Logo"
          testIdPrefix="cms-media-logo"
        />
      </Section>

      {/* FAQ */}
      <Section title="❓ Frequently Asked Questions" sectionKey="faq">
        <div className="rl-admin-form-grid">
          <TextField label="Section Tag" value={get("faq.tag")} onChange={(v) => setKey("faq.tag", v)} placeholder="Seeker's Questions" testId="cms-faq-tag" />
          <TextField label="Title" value={get("faq.title")} onChange={(v) => setKey("faq.title", v)} placeholder="Frequently Asked" testId="cms-faq-title" />
          <TextField label="Title Highlight" value={get("faq.title_highlight")} onChange={(v) => setKey("faq.title_highlight", v)} placeholder="Questions" testId="cms-faq-hl" />
        </div>
        <h4 className="rl-cms-sub-h">Questions & Answers</h4>
        <ListEditor
          items={get("faq.items", [])}
          setItems={(v) => setKey("faq.items", v)}
          fields={[
            { key: "q", label: "Question", placeholder: "Where are exhibitions held?" },
            { key: "a", label: "Answer", placeholder: "We conduct exhibitions across…", multiline: true, rows: 3 },
          ]}
          addLabel="Add Q & A"
          testIdPrefix="cms-faq-item"
        />
      </Section>

      {/* STATS */}
      <Section
        title="📊 Years of Service / Stats"
        sectionKey="stats"
        visibility={get("section_visibility.stats", true)}
        onVisibilityChange={(v) => setKey("section_visibility.stats", v)}
      >
        <ListEditor
          items={get("stats.items", [])}
          setItems={(v) => setKey("stats.items", v)}
          fields={[
            { key: "to", label: "Number (e.g. 25 → animates from 0)", placeholder: "25" },
            { key: "suffix", label: "Suffix", placeholder: "+ or %" },
            { key: "label", label: "Label", placeholder: "Years of Expertise" },
          ]}
          addLabel="Add Stat"
          testIdPrefix="cms-stat"
        />
      </Section>

      {/* ABOUT */}
      <Section
        title="📜 About Section (25 Years of Care)"
        sectionKey="about"
        visibility={get("section_visibility.about", true)}
        onVisibilityChange={(v) => setKey("section_visibility.about", v)}
      >
        <div className="rl-admin-form-grid">
          <TextField label="Tag" value={get("about.tag")} onChange={(v) => setKey("about.tag", v)} placeholder="Since 2001" testId="cms-about-tag" />
          <TextField label="Title" value={get("about.title")} onChange={(v) => setKey("about.title", v)} placeholder="25 Years of" testId="cms-about-title" />
          <TextField label="Title Highlight" value={get("about.title_highlight")} onChange={(v) => setKey("about.title_highlight", v)} placeholder="Sacred Service" testId="cms-about-hl" />
        </div>
        <h4 className="rl-cms-sub-h">Paragraphs (one per row)</h4>
        <ListEditor
          items={(get("about.paragraphs", []) || []).map((p) => (typeof p === "string" ? { text: p } : p))}
          setItems={(v) => setKey("about.paragraphs", v.map((x) => x.text || ""))}
          fields={[{ key: "text", label: "Paragraph", multiline: true, rows: 4 }]}
          addLabel="Add Paragraph"
          testIdPrefix="cms-about-para"
        />
      </Section>

      {/* FOOTER */}
      <Section title="📨 Footer / Contact" sectionKey="footer">
        <ImageField label="Footer Logo (defaults to navbar logo)" value={get("footer.logo")} onChange={(v) => setKey("footer.logo", v)} helper={IMG_HELPERS.logo} testId="cms-footer-logo" />
        <TextField label="Brand Tagline" value={get("footer.tagline")} onChange={(v) => setKey("footer.tagline", v)} placeholder="Sacred Rudraksha · Ancient Wisdom…" multiline rows={2} testId="cms-footer-tagline" />
        <div className="rl-admin-form-grid">
          <TextField label="Hours" value={get("footer.hours")} onChange={(v) => setKey("footer.hours", v)} placeholder="Mon — Sat · 10 AM to 6 PM" testId="cms-footer-hours" />
          <TextField label="Phone" value={get("footer.phone")} onChange={(v) => setKey("footer.phone", v)} placeholder="+91 22 2510 3030" testId="cms-footer-phone" />
          <TextField label="Email" value={get("footer.email")} onChange={(v) => setKey("footer.email", v)} placeholder="info@rudralife.com" testId="cms-footer-email" />
          <TextField label="WhatsApp" value={get("footer.whatsapp")} onChange={(v) => setKey("footer.whatsapp", v)} placeholder="+91 72088 19922" testId="cms-footer-whatsapp" />
        </div>
        <h4 className="rl-cms-sub-h">Address Lines</h4>
        <ListEditor
          items={(get("footer.address_lines", []) || []).map((p) => (typeof p === "string" ? { text: p } : p))}
          setItems={(v) => setKey("footer.address_lines", v.map((x) => x.text || ""))}
          fields={[{ key: "text", label: "Line", placeholder: "305, Kailas Plaza…" }]}
          addLabel="Add Line"
          testIdPrefix="cms-footer-addr"
        />
        <h4 className="rl-cms-sub-h">Social Links</h4>
        <ListEditor
          items={get("footer.socials", [])}
          setItems={(v) => setKey("footer.socials", v)}
          fields={[
            { key: "type", label: "Platform (instagram / facebook / youtube / linkedin / twitter)", placeholder: "instagram" },
            { key: "url", label: "Profile URL", placeholder: "https://instagram.com/rudralife" },
          ]}
          addLabel="Add Social Link"
          testIdPrefix="cms-footer-social"
        />
        <h4 className="rl-cms-sub-h">Footer Explore Menu</h4>
        <ListEditor
          items={get("footer.explore_links", [])}
          setItems={(v) => setKey("footer.explore_links", v)}
          fields={[
            { key: "label", label: "Label", placeholder: "About" },
            { key: "target", label: "Section ID or URL", placeholder: "about" },
          ]}
          addLabel="Add Link"
          testIdPrefix="cms-footer-explore"
        />
        <TextField label="Note (small text under contact)" value={get("footer.note")} onChange={(v) => setKey("footer.note", v)} placeholder="Private consultations available…" multiline rows={2} testId="cms-footer-note" />
        <div className="rl-admin-form-grid">
          <TextField label="Copyright" value={get("footer.copyright")} onChange={(v) => setKey("footer.copyright", v)} placeholder="© 2026 Rudralife. All Rights Reserved." testId="cms-footer-copyright" />
          <TextField label="Devotion Line" value={get("footer.devotion")} onChange={(v) => setKey("footer.devotion", v)} placeholder="Crafted with devotion for seekers worldwide 🙏" testId="cms-footer-devotion" />
        </div>
      </Section>

      {/* SEO */}
      <Section title="🔍 SEO / Meta Tags" sectionKey="seo">
        <div className="rl-admin-form-grid">
          <TextField label="Meta Title (≤ 60 chars)" value={get("seo.title")} onChange={(v) => setKey("seo.title", v)} placeholder="Rudralife · Authentic Rudraksha Exhibitions Worldwide" testId="cms-seo-title" />
          <TextField label="URL Slug (path)" value={get("seo.slug")} onChange={(v) => setKey("seo.slug", v)} placeholder="/" testId="cms-seo-slug" />
        </div>
        <TextField label="Meta Description (≤ 160 chars)" value={get("seo.description")} onChange={(v) => setKey("seo.description", v)} placeholder="Lab-certified Rudraksha guidance from Mumbai since 2001…" multiline rows={2} testId="cms-seo-desc" />
        <TextField label="Open Graph / Social Share Image" value={get("seo.og_image")} onChange={(v) => setKey("seo.og_image", v)} placeholder="https://… (1200×630 recommended)" testId="cms-seo-og" />
        <p className="rl-admin-helper-text">SEO fields are saved to the CMS doc; they automatically apply to &lt;title&gt; and &lt;meta&gt; tags after refresh.</p>
      </Section>

      {/* FORMS */}
      <Section title="📝 Form Labels & Messages" sectionKey="forms">
        <div className="rl-admin-form-grid">
          <TextField label="Register Form Title" value={get("forms.register_title")} onChange={(v) => setKey("forms.register_title", v)} placeholder="Register to Visit" testId="cms-forms-reg-title" />
          <TextField label="Register Submit Button" value={get("forms.register_btn")} onChange={(v) => setKey("forms.register_btn", v)} placeholder="Submit Registration" testId="cms-forms-reg-btn" />
          <TextField label="Register Success Message" value={get("forms.register_success")} onChange={(v) => setKey("forms.register_success", v)} placeholder="Registration Confirmed" testId="cms-forms-reg-success" />
          <TextField label="Register Error Message" value={get("forms.register_error")} onChange={(v) => setKey("forms.register_error", v)} placeholder="Something went wrong. Please try again." testId="cms-forms-reg-error" />
          <TextField label="Notify Form Title" value={get("forms.notify_title")} onChange={(v) => setKey("forms.notify_title", v)} placeholder="Notify Me When You Visit" testId="cms-forms-notify-title" />
          <TextField label="Notify Submit Button" value={get("forms.notify_btn")} onChange={(v) => setKey("forms.notify_btn", v)} placeholder="Notify Me →" testId="cms-forms-notify-btn" />
          <TextField label="Notify Success Message" value={get("forms.notify_success")} onChange={(v) => setKey("forms.notify_success", v)} placeholder="You're on the List!" testId="cms-forms-notify-success" />
          <TextField label="Field Placeholder — Name" value={get("forms.ph_name")} onChange={(v) => setKey("forms.ph_name", v)} placeholder="e.g. Anjali Mehta" testId="cms-forms-ph-name" />
          <TextField label="Field Placeholder — Email" value={get("forms.ph_email")} onChange={(v) => setKey("forms.ph_email", v)} placeholder="you@example.com" testId="cms-forms-ph-email" />
          <TextField label="Field Placeholder — Phone" value={get("forms.ph_phone")} onChange={(v) => setKey("forms.ph_phone", v)} placeholder="98xxxxxxxx" testId="cms-forms-ph-phone" />
        </div>
      </Section>

      {/* Footer save bar */}
      <div className="rl-cms-toolbar rl-cms-toolbar-footer">
        <span className="rl-admin-helper-text">All changes apply across the entire site after saving.</span>
        <button className="rl-btn rl-btn-primary rl-cms-save" onClick={save} disabled={saving} data-testid="cms-save-btn-bottom">
          {saving ? "Saving…" : "💾 Save Changes"}
        </button>
      </div>
    </div>
  );
}
