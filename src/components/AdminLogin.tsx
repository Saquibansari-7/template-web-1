import { useState, useEffect } from 'react';
import './AdminLogin.css';

interface AdminLoginProps {
  customer: string;
  onLogin: () => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;
const VERIFY_API = 'https://weddappvows.vercel.app/api/admin/verify-password';

function setCookie(name: string, value: string, days = 7) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${days * 86400};samesite=strict`;
  } catch {
    // ignore
  }
}

function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function clearCookie(name: string) {
  try {
    document.cookie = `${name}=;path=/;max-age=0`;
  } catch {
    // ignore
  }
}

function AdminLogin({ customer, onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(() => {
    try {
      const stored = localStorage.getItem('adminLoginAttempts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.count >= MAX_ATTEMPTS && Date.now() < parsed.until) {
          return true;
        }
      }
    } catch {
      // ignore parse errors
    }
    return false;
  });
  const [lockedUntil, setLockedUntil] = useState(() => {
    try {
      const stored = localStorage.getItem('adminLoginAttempts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.count >= MAX_ATTEMPTS && Date.now() < parsed.until) {
          return parsed.until;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  useEffect(() => {
    if (lockedUntil > 0 && Date.now() < lockedUntil) {
      const timer = setInterval(() => {
        setIsLocked(Date.now() < lockedUntil);
        setError(`Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)}s.`);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < lockedUntil) {
      setError(`Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)}s.`);
      return;
    }

    if (!password) return;

    try {
      const res = await fetch(VERIFY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customer,
          password: password,
          redirectTo: window.location.origin + '/admin',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.valid) {
        localStorage.removeItem('adminLoginAttempts');
        setCookie('admin_session', `${customer}:${Date.now()}`);
        onLogin();
        return;
      }

      const newAttempts = (() => {
        try {
          const stored = localStorage.getItem('adminLoginAttempts');
          if (stored) return JSON.parse(stored).count + 1;
        } catch {
          // ignore
        }
        return 1;
      })();

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setIsLocked(true);
        localStorage.setItem('adminLoginAttempts', JSON.stringify({ count: newAttempts, until }));
        setError(`Too many attempts. Try again in ${LOCKOUT_MS / 1000}s.`);
      } else {
        setError(data.error || `Incorrect password (${newAttempts}/${MAX_ATTEMPTS})`);
      }
    } catch {
      setError('Verification failed. Please try again.');
    }

    setPassword('');
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>Admin Panel</h1>
        <p>Enter password to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            autoFocus
            disabled={isLocked}
          />
          {error && <div className="admin-login-error">{error}</div>}
          <button type="submit" className="admin-login-btn" disabled={isLocked}>
            {isLocked ? 'Locked' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export { getCookie, clearCookie, setCookie };
export default AdminLogin;