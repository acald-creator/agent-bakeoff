import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
    // CodeMirror ships ESM; no CommonJS transform needed
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunk so CodeMirror is cached independently
          'codemirror': ['codemirror', '@codemirror/lang-markdown'],
          'marked': ['marked', 'dompurify'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    transformMode: {
      // vite-plugin-solid needs to transform .tsx in test mode
      web: [/\.[jt]sx?$/],
    },
  },
});
