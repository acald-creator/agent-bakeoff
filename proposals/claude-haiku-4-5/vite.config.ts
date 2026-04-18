import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: ['codemirror', '@codemirror/lang-markdown'],
          markdown: ['marked']
        }
      }
    },
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true
  },
  ssr: false
});
