import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebsiteProvider } from './context/WebsiteContext';
import App from './App';

if (location.protocol === 'file:') {
  console.warn('[wedding] Running from file:// — ES modules may be blocked by the browser. Use `npm run dev` or `npm run preview` instead.');
}

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <WebsiteProvider>
        <App />
      </WebsiteProvider>
    </React.StrictMode>
  );
  console.log('[wedding] React mounted, path:', location.pathname);
} catch (e) {
  console.error('[wedding] Failed to mount React:', e);
}

// Force fresh load on hard refresh by invalidating old cached image srcs
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      if (name.includes('wedding') || name.includes('static')) {
        caches.delete(name);
      }
    });
  });
}

