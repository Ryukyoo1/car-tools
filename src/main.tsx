import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register the service worker for offline support (PWA). Fails silently if unsupported.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline support unavailable — app still works online */
    })
  })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
