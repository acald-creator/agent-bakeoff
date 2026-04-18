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
    // Do NOT lump all @codemirror/* into one eager chunk — that makes the entry
    // bundle worse. Let Rollup's default splitting handle codemirror internals.
    // language-data is already lazy (dynamic import in Editor.tsx).
    rollupOptions: {
      output: {
        // Only pin solid-js so it doesn't accidentally split into micro-chunks.
        // Everything else: let Rollup decide.
        manualChunks(id) {
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
