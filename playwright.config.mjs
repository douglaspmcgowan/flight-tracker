import { defineConfig, devices } from 'playwright/test';

const launchOptions = process.platform === 'win32'
  ? {
      executablePath:
        process.env.CHROME_PATH
        ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    }
  : {};

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  workers: process.platform === 'win32' ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3013',
    launchOptions,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_EXTERNAL_SERVER === '1'
    ? undefined
    : {
        command: 'node apps/web/scripts/e2e-server.mjs',
        url: 'http://localhost:3013/api/health',
        reuseExistingServer: false,
        timeout: 180_000,
      },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
      },
    },
  ],
});
