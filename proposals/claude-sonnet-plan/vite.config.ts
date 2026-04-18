import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],

  build: {
    target: 'es2022',
    // Single output chunk for this app's size; no need for code-splitting.
    // If the collab sync module is added later, split it here:
    //   rollupOptions: { output: { manualChunks: { sync: ['./src/sync/room'] } } }
    rollupOptions: {},
  },

  server: {
    port: 5173,
    // In dev, serve a fallback for the SPA so ?note= URLs resolve to index.html
    historyApiFallback: true,
  },

  // Vite resolves CodeMirror's ESM sub-packages correctly without additional aliases.
  // If a dep ships only CJS, add it here:
  //   optimizeDeps: { include: ['some-cjs-dep'] }
});
