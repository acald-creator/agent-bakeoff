import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // jsdom environment provides localStorage, window, document
    environment: 'jsdom',
    include:     ['src/tests/**/*.test.ts'],
    globals:     false,
  },
});
