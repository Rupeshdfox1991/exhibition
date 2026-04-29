import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TOKEN_KEY = "rl_admin_token";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  isAuthed: () => !!localStorage.getItem(TOKEN_KEY),
};

const authHeaders = () => ({ Authorization: `Bearer ${auth.getToken()}` });

export const api = {
  // Public
  publicExhibitions: async () => (await axios.get(`${API}/exhibitions`)).data,
  register: async (payload) => (await axios.post(`${API}/register`, payload)).data,

  // Admin auth
  login: async (email, password) => {
    const { data } = await axios.post(`${API}/admin/login`, { email, password });
    auth.setToken(data.token);
    return data;
  },
  me: async () => (await axios.get(`${API}/admin/me`, { headers: authHeaders() })).data,

  // Exhibitions
  listExhibitions: async () =>
    (await axios.get(`${API}/admin/exhibitions`, { headers: authHeaders() })).data,
  createExhibition: async (payload) =>
    (await axios.post(`${API}/admin/exhibitions`, payload, { headers: authHeaders() })).data,
  updateExhibition: async (id, payload) =>
    (await axios.put(`${API}/admin/exhibitions/${id}`, payload, { headers: authHeaders() })).data,
  toggleExhibitionStatus: async (id, status) =>
    (await axios.patch(`${API}/admin/exhibitions/${id}/status`, { status }, { headers: authHeaders() })).data,
  deleteExhibition: async (id) =>
    (await axios.delete(`${API}/admin/exhibitions/${id}`, { headers: authHeaders() })).data,

  // Registrations
  listRegistrations: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const { data } = await axios.get(`${API}/admin/registrations?${params.toString()}`, { headers: authHeaders() });
    return data;
  },
  exportUrl: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return `${API}/admin/registrations/export?${params.toString()}`;
  },
  exportRegistrations: async (filters = {}) => {
    const res = await axios.get(api.exportUrl(filters), {
      headers: authHeaders(),
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const cd = res.headers["content-disposition"] || "";
    const m = cd.match(/filename="?([^"]+)"?/);
    a.download = m ? m[1] : `rudralife_leads_${new Date().toISOString().slice(0,19).replace(/[-:]/g,"")}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

// Auto-logout on 401 across the app
axios.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && err.config?.headers?.Authorization) {
      auth.clear();
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);
