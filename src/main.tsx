
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check if the script is being loaded as an embedded widget
const isEmbedded = window.location.search.includes('embedded=true');

// Only render the app if we're not in embedded mode
// (embedded mode is handled by embed.ts)
if (!isEmbedded) {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find the root element');

  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
