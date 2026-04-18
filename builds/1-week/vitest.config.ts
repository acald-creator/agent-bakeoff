import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // jsdom provides localStorage and DOM APIs needed by persistence tests
    environment: 'jsdom',
    include: ['src/test/**/*.test.ts'],
    globals: false,
  },
});
