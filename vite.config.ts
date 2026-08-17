import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// CAR TOOLS — Vite configuration
// Relative paths are used so the app works behind a reverse proxy (Nginx Proxy Manager)
// at any sub-path without extra configuration.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    // Vite empties the output dir on every build. Keeping this explicit makes the
    // build resilient on systems where recursive deletes are sandboxed/interposed.
    emptyOutDir: false,
  },
})
