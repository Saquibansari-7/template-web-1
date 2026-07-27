import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebsiteProvider } from './context/WebsiteContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebsiteProvider>
      <App />
    </WebsiteProvider>
  </React.StrictMode>
);
