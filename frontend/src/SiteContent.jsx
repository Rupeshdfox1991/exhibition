// Provides admin-managed Edit Page content to all public components.
// All components consume via `useSiteContent()` and FALL BACK to existing hard-coded
// defaults when an admin field is empty/unset, so the site keeps working even with
// an empty CMS document.
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Ctx = createContext({ content: {}, loading: true });

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    axios
      .get(`${API}/site-content`)
      .then((r) => { if (alive) setContent(r.data || {}); })
      .catch(() => { if (alive) setContent({}); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return <Ctx.Provider value={{ content, loading }}>{children}</Ctx.Provider>;
}

export const useSiteContent = () => useContext(Ctx);

// Helper: read a path "hero.title" with fallback. Returns the value if it's a
// non-empty string / array / object, otherwise the fallback.
export function pick(obj, path, fallback) {
  if (!obj) return fallback;
  const segs = path.split(".");
  let cur = obj;
  for (const s of segs) {
    if (cur && typeof cur === "object" && s in cur) cur = cur[s];
    else return fallback;
  }
  if (cur === undefined || cur === null) return fallback;
  if (typeof cur === "string" && cur.trim() === "") return fallback;
  if (Array.isArray(cur) && cur.length === 0) return fallback;
  return cur;
}
