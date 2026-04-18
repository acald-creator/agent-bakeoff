import { defineConfig } from 'vite';
import inferno from 'vite-plugin-inferno';

export default defineConfig({
  plugins: [inferno()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: true,
  },
  server: { port: 5173 },
});
