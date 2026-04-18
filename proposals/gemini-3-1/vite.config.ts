import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'codemirror': ['codemirror', '@codemirror/lang-markdown', '@codemirror/language-data'],
          'solid': ['solid-js']
        }
      }
    }
  }
});
