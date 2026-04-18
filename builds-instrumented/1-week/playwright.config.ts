import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Run tests sequentially in CI (parallel is fine locally)
  fullyParallel: false,
  // Fail the build on CI if test.only is accidentally committed
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL:  'http://localhost:3000',
    // Record trace on retry for debugging
    trace:    'on-first-retry',
    // Screenshot on failure
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name:    'chromium',
      use:     { ...devices['Desktop Chrome'] },
    },
  ],
  // Start the dev server before tests
  webServer: {
    command:    'pnpm dev',
    url:        'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout:    30_000,
  },
});
