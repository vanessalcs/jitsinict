import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: {
    // Generic placeholder for the Gemini API key; requests go through the
    // local Vertex AI proxy, so the real key is never used in the browser.
    'process.env.API_KEY': JSON.stringify('api-key-this-is-not-used-can-be-ignored!'),
  },
  server: {
    proxy: {
      // Target the Node.js backend
      '/api-proxy': 'http://localhost:5000',
      '/ws-proxy': { target: 'ws://localhost:5000', ws: true },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
});
