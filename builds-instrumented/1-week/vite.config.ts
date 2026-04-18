import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [
    // vanilla-extract must come before solid so CSS is processed first
    vanillaExtractPlugin(),
    solidPlugin(),
  ],
  build: {
    target: 'es2022',
    // No manualChunks — let Rollup/Vite decide chunk boundaries naturally.
    // The @codemirror/language-data dynamic import in extensions.ts already
    // creates a lazy chunk; forcing manual chunks for the codemirror barrel
    // duplicates code and inflates bundle size.
  },
  server: {
    port: 3000,
  },
});
