import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ensureOllamaReady } from './scripts/ensure-ollama.mjs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ollama-auto-launcher',
      configureServer() {
        ensureOllamaReady();
      }
    }
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/chat': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true
      },
      '/api/tags': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true
      }
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless'
    }
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless'
    }
  }
});
