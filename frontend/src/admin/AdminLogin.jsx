import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { api, auth } from "./api";

const LOGO =
  "https://customer-assets.emergentagent.com/job_b271b1af-1da5-4630-96e0-320d96eb6add/artifacts/pm9yuvf5_New%20Rudralife%20final%20logo%20with%20tagline%20%28White%29%20%281%29.png";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (auth.isAuthed()) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await api.login(email.trim().toLowerCase(), password);
      nav("/admin", { replace: true });
    } catch (ex) {
      const d = ex?.response?.data?.detail;
      setErr(typeof d === "string" ? d : "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rl-admin-login" data-testid="admin-login-page">
      <div className="rl-admin-login-card">
        <img src={LOGO} alt="Rudralife" className="rl-admin-login-logo" />
        <span className="rl-tag" style={{ color: "var(--rl-gold)" }}>Admin Console</span>
        <h1 className="rl-admin-login-title">Welcome back</h1>
        <p className="rl-admin-login-sub">Sign in to manage exhibitions & seeker leads.</p>
        <form onSubmit={submit} className="rl-admin-login-form">
          <div className="rl-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="admin-login-email"
              required
              placeholder="admin@rudralife.com"
            />
          </div>
          <div className="rl-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="admin-login-password"
              required
              placeholder="••••••••"
            />
          </div>
          {err && <div className="rl-field-err" data-testid="admin-login-error">{err}</div>}
          <button
            type="submit"
            className="rl-btn rl-btn-primary"
            data-testid="admin-login-submit"
            disabled={busy}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {busy ? "Signing in…" : "Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}
