import { useEffect, useState } from 'react';
import { useWebsiteContext } from './context/WebsiteContext';
import { syncContentToDOM, initReveal, updateCountdown } from './utils/contentSync';
import AdminPanel from './components/AdminPanel';
// @ts-ignore - AdminPasswordGate is a JSX component without TypeScript declarations
import AdminPasswordGate from './components/admin-password-gate/AdminPasswordGate';

async function validateAdminCustomer(customer: string): Promise<boolean> {
  const trimmed = (customer || '').toLowerCase().trim();
  const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;

  if (!trimmed || !SUBDOMAIN_REGEX.test(trimmed)) {
    if (!import.meta.env.DEV) {
      window.location.href = 'https://weddappvows.vercel.app/dashboard?error=invalid_customer';
    }
    return false;
  }

  try {
    const res = await fetch(`https://weddappvows.vercel.app/api/site/lookup?customer=${encodeURIComponent(trimmed)}`);
    if (!res.ok) {
      if (!import.meta.env.DEV) {
        window.location.href = 'https://weddappvows.vercel.app/dashboard?error=site_not_found';
      }
      return false;
    }
    const site = await res.json();
    if (site.template_id !== 'minimal') {
      if (!import.meta.env.DEV) {
        window.location.href = 'https://weddappvows.vercel.app/dashboard?error=wrong_template';
      }
      return false;
    }
    if (site.status !== 'active') {
      if (!import.meta.env.DEV) {
        window.location.href = 'https://weddappvows.vercel.app/dashboard?error=site_inactive';
      }
      return false;
    }
    return true;
  } catch {
    if (!import.meta.env.DEV) {
      window.location.href = 'https://weddappvows.vercel.app/dashboard?error=validation_failed';
    }
    return false;
  }
}

function App() {
  const { content, sections, site } = useWebsiteContext();
  const [adminOpen, setAdminOpen] = useState(false);
  const [customer, setCustomer] = useState<string | null>(null);

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
    const handleKey = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        const customer = params.get('customer');
        if (customer) {
          const valid = await validateAdminCustomer(customer);
          if (!valid) return;
        }
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    async function checkAdminAccess() {
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

      const valid = await validateAdminCustomer(customer);
      if (valid) {
        setCustomer(customer);
        setAdminOpen(true);
      }
    }

    checkAdminAccess();
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
        <AdminPasswordGate customer={customer || ''}>
          <AdminPanel onClose={() => { setAdminOpen(false); }} />
        </AdminPasswordGate>
      </div>
    </div>
  );
}

export default App;