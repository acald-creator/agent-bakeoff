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
    // Let Rollup split naturally — no manualChunks.
    // Previously, grouping all @codemirror/* into one named chunk forced a
    // 560 KB synchronous entry load. With no manualChunks, Rollup deduplicates
    // shared code on its own and the dynamic import in Editor.tsx can split
    // @codemirror/language-data into a lazy chunk.
  },
  server: {
    port: 3000,
  },
});
