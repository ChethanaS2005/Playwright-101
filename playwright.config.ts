import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  // One file per project: both browser projects run concurrently, each in order.
  fullyParallel: false,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  outputDir: 'test-results/local',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/local', open: 'never' }],
    ['json', { outputFile: 'reports/local-results.json' }],
    ['junit', { outputFile: 'reports/local-junit.xml' }],
  ],
  use: {
    baseURL: 'https://www.testmuai.com/selenium-playground/',
    viewport: { width: 1440, height: 1000 },
    locale: 'en-US',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    headless: true,
  },
  projects: [
    { name: 'local-chromium', use: { browserName: 'chromium' } },
    { name: 'local-edge', use: { browserName: 'chromium', channel: 'msedge' } },
    // Optional: the current Windows Firefox bundle failed to launch on the authoring host.
    { name: 'local-firefox', default: false, use: { browserName: 'firefox' } },
  ],
});
