import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  use: { baseURL: 'http://localhost:4321/rational-points/' },
  webServer: {
    command: 'npm run build && node tests/serve.mjs',
    url: 'http://localhost:4321/rational-points/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
