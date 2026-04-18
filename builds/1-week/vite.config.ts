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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@codemirror/language-data')) {
            return 'cm-language-data';
          }
          if (id.includes('codemirror') || id.includes('@codemirror')) {
            return 'codemirror';
          }
          if (id.includes('solid-js')) {
            return 'solid';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
