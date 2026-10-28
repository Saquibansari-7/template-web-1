import { useState, useEffect } from "react";
import styles from "./admin-password-gate.module.css";

const CONFIG_URL = "https://weddappvows.vercel.app/api/admin/config";

export default function AdminPasswordGate({ customer, children }) {
  const storageKey = `admin_pass_${customer}`;
  const [step, setStep] = useState("check");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [master, setMaster] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!customer) {
      setStep("error");
      setError("Missing customer parameter");
      return;
    }

    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setStep("set");
    } else {
      setStep("enter");
    }

    fetch(`${CONFIG_URL}?customer=${encodeURIComponent(customer)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.has_master_password) setMaster(d.master_password);
      })
      .catch(() => setMaster(null));
  }, [customer, storageKey]);

  function savePassword(e) {
    e.preventDefault();
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    localStorage.setItem(storageKey, password);
    setStep("authenticated");
    setError("");
  }

  async function verifyPassword(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");

    if (master && password === master) {
      setStep("authenticated");
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem(storageKey);
    if (stored === password) {
      setStep("authenticated");
    } else {
      setError("Incorrect password");
    }
    setLoading(false);
  }

  function resetPassword() {
    localStorage.removeItem(storageKey);
    setPassword("");
    setConfirm("");
    setStep("set");
    setError("");
  }

  if (step === "error") {
    return (
      <div className={styles.gate}>
        <div className={styles.card}>
          <div className={styles.icon}>⚠️</div>
          <h2>Unable to load admin</h2>
          <p className={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  if (step === "authenticated") {
    return (
      <>
        {children}
        <button
          type="button"
          className={styles.changeLink}
          onClick={resetPassword}
        >
          Change admin password
        </button>
      </>
    );
  }

  return (
    <div className={styles.gate}>
      <div className={styles.card}>
        <div className={styles.icon}>✦</div>
        <h2>Admin Access</h2>

        {step === "set" && (
          <>
            <p className={styles.sub}>
              Set a password for your admin panel. You'll need this to make
              future edits. You can change it anytime later.
            </p>

            <div className={styles.field}>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowPwd((s) => !s)}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>

            <div className={styles.field}>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {master && (
              <p className={styles.hint}>
                Lost access? Contact support — a master password is on file.
              </p>
            )}
          </>
        )}

        {step === "enter" && (
          <>
            <form onSubmit={verifyPassword}>
              <div className={styles.field}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      verifyPassword(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setShowPwd((s) => !s)}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading}
              >
                {loading ? "Checking…" : "Sign In"}
              </button>

              {error && <p className={styles.error}>{error}</p>}
            </form>

            {master && (
              <p className={styles.hint}>
                A master password is available — contact support if you've
                forgotten yours.
              </p>
            )}
          </>
        )}

        {step === "set" && (
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={savePassword}
          >
            Set Password
          </button>
        )}

        {step === "set" && error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}