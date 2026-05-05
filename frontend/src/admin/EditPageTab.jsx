import { useEffect, useState } from "react";
import { api } from "./api";

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
      .then((d) => { if (alive) setContent(d || {}); })
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

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "rgba(253,248,240,0.6)" }}>Loading site content…</div>;

  return (
    <div data-testid="edit-page-tab">
      <div className="rl-cms-toolbar">
        <div className="rl-cms-toolbar-text">
          <h2>Edit Full Page</h2>
          <p>Change anything on the public site — header, banner, sections, images, FAQs, autoscroll. Hit <strong>Save Changes</strong> when you're done; the live site updates instantly.</p>
        </div>
        <div className="rl-cms-toolbar-actions">
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
        <div className="rl-admin-form-grid">
          <TextField label="Menu — About" value={get("navbar.menu_about")} onChange={(v) => setKey("navbar.menu_about", v)} placeholder="About" testId="cms-menu-about" />
          <TextField label="Menu — Exhibitions" value={get("navbar.menu_exhibitions")} onChange={(v) => setKey("navbar.menu_exhibitions", v)} placeholder="Exhibitions" testId="cms-menu-exhibitions" />
          <TextField label="Menu — Collection" value={get("navbar.menu_collection")} onChange={(v) => setKey("navbar.menu_collection", v)} placeholder="Collection" testId="cms-menu-collection" />
          <TextField label="Menu — Experts" value={get("navbar.menu_experts")} onChange={(v) => setKey("navbar.menu_experts", v)} placeholder="Experts" testId="cms-menu-experts" />
          <TextField label="Menu — FAQ" value={get("navbar.menu_faq")} onChange={(v) => setKey("navbar.menu_faq", v)} placeholder="FAQ" testId="cms-menu-faq" />
          <TextField label="CTA Button Text" value={get("navbar.cta")} onChange={(v) => setKey("navbar.cta", v)} placeholder="Register" testId="cms-navbar-cta" />
        </div>
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
        <p className="rl-admin-helper-text" style={{ marginBottom: 14 }}>
          Toggle the section ON/OFF using the switch above. Detailed expert-by-expert editing (photos + bios) — coming in next iteration; for now, the experts displayed on the public site come from the seed list. Use the visibility toggle to hide the entire section.
        </p>
      </Section>

      {/* TRUSTED / TESTIMONIALS / MEDIA — visibility only for now */}
      <Section
        title="🤝 Trusted Clients (Logos Section)"
        sectionKey="trusted"
        visibility={get("section_visibility.trusted", true)}
        onVisibilityChange={(v) => setKey("section_visibility.trusted", v)}
      >
        <p className="rl-admin-helper-text">Toggle the Trusted-by-Seekers logos strip on/off. Per-logo upload — next iteration.</p>
      </Section>
      <Section
        title="🎥 Video Testimonials"
        sectionKey="testimonials"
        visibility={get("section_visibility.testimonials", true)}
        onVisibilityChange={(v) => setKey("section_visibility.testimonials", v)}
      >
        <p className="rl-admin-helper-text">Toggle the section on/off. Per-video upload + caption editor — next iteration.</p>
      </Section>
      <Section
        title="📰 Media / Recognition"
        sectionKey="media"
        visibility={get("section_visibility.media", true)}
        onVisibilityChange={(v) => setKey("section_visibility.media", v)}
      >
        <p className="rl-admin-helper-text">Toggle the In-Media section on/off. Per-card upload + caption editor — next iteration.</p>
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
        <div className="rl-admin-form-grid">
          <TextField label="Email" value={get("footer.email")} onChange={(v) => setKey("footer.email", v)} placeholder="info@rudralife.com" testId="cms-footer-email" />
          <TextField label="Phone" value={get("footer.phone")} onChange={(v) => setKey("footer.phone", v)} placeholder="+91 90000 00000" testId="cms-footer-phone" />
        </div>
        <TextField label="Address" value={get("footer.address")} onChange={(v) => setKey("footer.address", v)} placeholder="Rudralife · Mumbai" multiline rows={2} testId="cms-footer-address" />
        <TextField label="Tagline / Devotion Line" value={get("footer.tagline")} onChange={(v) => setKey("footer.tagline", v)} placeholder="Sacred Rudraksha · Ancient Wisdom" testId="cms-footer-tagline" />
      </Section>

      {/* FORMS */}
      <Section title="📝 Form Labels" sectionKey="forms">
        <div className="rl-admin-form-grid">
          <TextField label="Register Form Title" value={get("forms.register_title")} onChange={(v) => setKey("forms.register_title", v)} placeholder="Register to Visit" testId="cms-forms-reg-title" />
          <TextField label="Register Submit Button" value={get("forms.register_btn")} onChange={(v) => setKey("forms.register_btn", v)} placeholder="Submit Registration" testId="cms-forms-reg-btn" />
          <TextField label="Notify Form Title" value={get("forms.notify_title")} onChange={(v) => setKey("forms.notify_title", v)} placeholder="Notify Me When You Visit" testId="cms-forms-notify-title" />
          <TextField label="Notify Submit Button" value={get("forms.notify_btn")} onChange={(v) => setKey("forms.notify_btn", v)} placeholder="Notify Me →" testId="cms-forms-notify-btn" />
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
