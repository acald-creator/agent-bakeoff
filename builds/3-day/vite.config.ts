import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [
    solid(),
    vanillaExtractPlugin(),
  ],
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split out CodeMirror language data so it loads lazily
          'cm-lang-data': ['@codemirror/language-data'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
