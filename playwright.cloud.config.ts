import { defineConfig } from '@playwright/test';
import localConfig from './playwright.config';
import type { AssignmentOptions } from './support/fixtures';

// Config runs before workers are spawned, so both projects share this build name.
process.env.LT_BUILD_NAME ||= `Playwright 101 - ${new Date().toISOString()}`;

export default defineConfig<AssignmentOptions>({
  ...localConfig,
  globalSetup: require.resolve('./support/cloud-preflight'),
  timeout: 150_000,
  outputDir: 'test-results/cloud',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/cloud', open: 'never' }],
    ['json', { outputFile: 'reports/cloud-results.json' }],
    ['junit', { outputFile: 'reports/cloud-junit.xml' }],
  ],
  projects: [
    {
      name: 'testmu-chromium-windows-10',
      use: { browserName: 'chromium', cloudTarget: { browserName: 'pw-chromium', platform: 'Windows 10' } },
    },
    {
      name: 'testmu-firefox-macos-catalina',
      use: { browserName: 'firefox', cloudTarget: { browserName: 'pw-firefox', platform: 'macOS Catalina' } },
    },
  ],
});
