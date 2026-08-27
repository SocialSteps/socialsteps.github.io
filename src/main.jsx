import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initSemanticManager } from './utils/semanticManager';
import { registerSW } from 'virtual:pwa-register';

// Initialize the semantic search model immediately on app load
initSemanticManager();

// Register the service worker for PWA offline mode
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
