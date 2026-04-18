import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [
    solidPlugin(),
    vanillaExtractPlugin(),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: ['codemirror', '@codemirror/state', '@codemirror/view'],
          'cm-markdown': ['@codemirror/lang-markdown', '@codemirror/language-data'],
        },
      },
    },
  },
});
