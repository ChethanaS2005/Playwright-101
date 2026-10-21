import { version } from '@playwright/test/package.json';

export interface CloudTarget {
  browserName: 'pw-chromium' | 'pw-firefox';
  platform: string;
}

export function capabilitiesFor(target: CloudTarget, testName: string) {
  return {
    browserName: target.browserName,
    browserVersion: 'latest',
    'LT:Options': {
      platform: target.platform,
      build: process.env.LT_BUILD_NAME,
      name: testName,
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      projectName: 'Playwright 101 Assignment',
      network: true,
      video: true,
      visual: true, // TestMu command screenshots.
      console: true,
      tunnel: false,
      playwrightClientVersion: version,
    },
  };
}
