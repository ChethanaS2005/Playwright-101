import { test as base, expect, type Browser, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { capabilitiesFor, type CloudTarget } from './capabilities';

export type AssignmentOptions = { cloudTarget: CloudTarget | undefined };

async function cloudAction(page: Page, action: string, args?: Record<string, string>): Promise<unknown> {
  // This is TestMu's documented executor hook, intercepted by the cloud service.
  return page.evaluate(() => {}, `lambdatest_action: ${JSON.stringify({ action, arguments: args })}`);
}

export const test = base.extend<AssignmentOptions>({
  cloudTarget: [undefined, { option: true }],
  page: async ({ playwright, browserName, channel, headless, baseURL, viewport, locale, actionTimeout, navigationTimeout, cloudTarget }, use, testInfo) => {
    await mkdir(testInfo.outputDir, { recursive: true });
    let browser: Browser;
    if (cloudTarget) {
      const capabilities = capabilitiesFor(cloudTarget, testInfo.title);
      try {
        // TestMu uses this connector for all supported browser capabilities.
        browser = await playwright.chromium.connect({
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`,
          timeout: 90_000,
        });
      } catch {
        // Playwright connection errors can echo the credential-bearing URL.
        throw new Error('Could not connect to TestMu AI. Check account access, available minutes, browser/OS support and network connectivity. Connection URL omitted to protect credentials.');
      }
    } else {
      browser = await playwright[browserName].launch({ headless, channel });
    }

    const consoleLog: unknown[] = [];
    const networkLog: unknown[] = [];
    const started = new Date().toISOString();
    const cleanupErrors: string[] = [];
    let session: Record<string, unknown> | undefined;
    try {
      const context = await browser.newContext({
        baseURL, viewport, locale,
        recordHar: { path: testInfo.outputPath('network.har'), content: 'omit' },
        // The cloud's own video:true capability records remote sessions.
        recordVideo: cloudTarget ? undefined : { dir: testInfo.outputDir, size: { width: 1280, height: 900 } },
      });
      context.setDefaultTimeout(actionTimeout);
      context.setDefaultNavigationTimeout(navigationTimeout);
      await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
      const page = await context.newPage();
      page.on('console', msg => consoleLog.push({ time: new Date().toISOString(), type: msg.type(), text: msg.text() }));
      page.on('pageerror', error => consoleLog.push({ time: new Date().toISOString(), type: 'pageerror', text: error.message }));
      page.on('request', request => networkLog.push({ time: new Date().toISOString(), event: 'request', method: request.method(), url: request.url(), resourceType: request.resourceType() }));
      page.on('response', response => networkLog.push({ time: new Date().toISOString(), event: 'response', status: response.status(), url: response.url() }));
      page.on('requestfailed', request => networkLog.push({ time: new Date().toISOString(), event: 'requestfailed', url: request.url(), error: request.failure()?.errorText }));
      const video = page.video();

      const capture = async (label: string, action: () => Promise<void>) => {
        try { await action(); } catch { cleanupErrors.push(label); }
      };
      try {
        if (cloudTarget) {
          const raw = await cloudAction(page, 'getTestDetails');
          const response = typeof raw === 'string' ? JSON.parse(raw) : raw;
          const data = response?.data;
          if (!data?.session_id && !data?.test_id) throw new Error('TestMu returned no session ID. Cloud evidence is incomplete.');
          // Store only submission metadata, not account data or signed media URLs.
          session = {
            sessionId: data.session_id || data.test_id,
            testId: data.test_id,
            project: testInfo.project.name,
            test: testInfo.title,
            platform: data.platform,
            browser: data.browser,
            browserVersion: data.browser_version,
            build: process.env.LT_BUILD_NAME,
            started,
          };
        }
        await use(page);
      } finally {
        await capture('final screenshot', async () => {
          const path = testInfo.outputPath('final.png');
          await page.screenshot({ path, fullPage: true, timeout: 10_000 });
          await testInfo.attach('Final screenshot', { path, contentType: 'image/png' });
        });
        await capture('trace', async () => {
          const path = testInfo.outputPath('trace.zip');
          await context.tracing.stop({ path });
          await testInfo.attach('trace', { path, contentType: 'application/zip' });
        });
        await capture('logs', async () => {
          for (const [name, content] of [['console', consoleLog], ['network', networkLog]] as const) {
            const path = testInfo.outputPath(`${name}.json`);
            await writeFile(path, JSON.stringify(content, null, 2));
            await testInfo.attach(`${name} log`, { path, contentType: 'application/json' });
          }
        });
        if (cloudTarget) {
          await capture('cloud status', async () => {
            const passed = testInfo.status === 'passed' && !cleanupErrors.length;
            await cloudAction(page, 'setTestStatus', { status: passed ? 'passed' : 'failed', remark: passed ? 'All scenario assertions passed.' : 'Scenario or evidence collection failed. See Playwright report.' });
          });
        }
        await capture('context close / HAR', async () => {
          await context.close();
          await testInfo.attach('Network HAR', { path: testInfo.outputPath('network.har'), contentType: 'application/json' });
        });
        if (video) {
          await capture('video', async () => {
            const path = await video.path();
            await testInfo.attach('video', { path, contentType: 'video/webm' });
          });
        }
        if (session) {
          session.status = testInfo.status === 'passed' && !cleanupErrors.length ? 'passed' : 'failed';
          session.finished = new Date().toISOString();
          const path = testInfo.outputPath('session.json');
          await writeFile(path, JSON.stringify(session, null, 2));
          await testInfo.attach('TestMu session', { path, contentType: 'application/json' });
        }
        await writeFile(testInfo.outputPath('run-info.json'), JSON.stringify({
          project: testInfo.project.name, test: testInfo.title, started,
          finished: new Date().toISOString(), browserVersion: browser.version(),
          execution: cloudTarget ? 'TestMu AI cloud' : 'local',
          hostOS: process.platform, cleanupErrors,
        }, null, 2));
        if (cleanupErrors.length) throw new Error(`Evidence collection failed: ${cleanupErrors.join(', ')}`);
      }
    } finally {
      await browser.close();
    }
  },
});

export { expect };
