import { useEffect, useState } from 'react';
import { useWebsiteContext } from './context/WebsiteContext';
import { syncContentToDOM, initReveal, updateCountdown } from './utils/contentSync';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

const ADMIN_API_URL = 'https://weddappvows.vercel.app';
const EXPECTED_ADMIN_TEMPLATE_ID = 'minimal';
const ADMIN_SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;

async function validateAdminCustomer(customer: string): Promise<boolean> {
  const trimmed = (customer || '').trim().toLowerCase();
  if (!trimmed || !ADMIN_SUBDOMAIN_REGEX.test(trimmed)) {
    return false;
  }

  try {
    const res = await fetch(
      `${ADMIN_API_URL}/api/site/lookup?customer=${encodeURIComponent(trimmed)}`,
    );
    if (!res.ok) {
      return false;
    }
    const site = (await res.json()) as { template_id?: string; status?: string };
    return site.template_id === EXPECTED_ADMIN_TEMPLATE_ID && site.status === 'active';
  } catch {
    return false;
  }
}

function App() {
  const { content, sections, site } = useWebsiteContext();
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);

  const viewSiteHref = (() => {
    if (typeof window === 'undefined') return '/';
    const params = new URLSearchParams(window.location.search);
    const customer = params.get('customer');
    return customer ? '/?customer=' + encodeURIComponent(customer) : '/';
  })();

  useEffect(() => {
    syncContentToDOM(content, sections);
    initReveal();
    (window as unknown as { __WD: typeof content }).__WD = content;
    document.documentElement.classList.remove('content-loading');
  }, [content, sections]);

  useEffect(() => {
    let countdownInterval: number | null = null;
    if (content.countdown.targetDate) {
      countdownInterval = updateCountdown(content.countdown.targetDate);
    }
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [content.countdown.targetDate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const path = window.location.pathname || '';
    if (!path.startsWith('/admin')) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const customer = params.get('customer');

    if (!customer) {
      setAdminOpen(true);
      return;
    }

    validateAdminCustomer(customer).then((valid) => {
      if (valid) {
        setAdminOpen(true);
      } else {
        window.location.href = `${ADMIN_API_URL}/dashboard?error=invalid_customer`;
      }
    });
  }, []);

  if (!adminOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#111',
        color: '#e5e5e5',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'auto',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 24, color: '#c9a84c' }}>✦</span>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Wedding Admin</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setAdminAuthed(false);
                setAdminOpen(false);
              }}
              style={{
                background: '#333',
                color: '#ccc',
                border: '1px solid #555',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <a href={viewSiteHref} target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 14 }}>
              ↗ View Site
            </a>
          </div>
        </div>
        {adminAuthed ? (
          <AdminPanel onClose={() => { setAdminAuthed(false); setAdminOpen(false); }} />
        ) : (
          <AdminLogin onLogin={() => setAdminAuthed(true)} />
        )}
      </div>
    </div>
  );
}

export default App;
