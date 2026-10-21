# Playwright 101 assignment

Three live-site scenarios for the TestMu AI Selenium Playground, written in TypeScript with Playwright **1.64.1** (npm latest checked 21 October 2026). Dependencies are pinned and `package-lock.json` is included.

**Status:** local testing only, as requested. Read [the verification record](docs/VERIFICATION.md) and [the requirement-by-requirement checklist](docs/REQUIREMENTS.md) before submitting. TestMu AI runs, cloud session IDs, reviewer access and exam-portal submission are separate completion items. No cloud session IDs are invented.

## Run locally

Prerequisites: Node.js 20 or later and npm. Node.js 22 was used for verification.

```sh
npm ci
npx playwright install chromium
npm run typecheck
npm test
npm run report
```

The default suite runs Chromium and Microsoft Edge concurrently, with two workers and no retries. Each browser executes all three scenarios in an isolated browser/context per test. Edge must be installed; if it is missing, install it from Microsoft or run `npx playwright install msedge` (administrator access may be needed). `npm run test:headed` shows browser windows.

Firefox is retained as an optional project:

```sh
npx playwright install firefox
npx playwright test --project=local-firefox
```

The downloaded Firefox 157.0 Windows build could not launch on the authoring machine: Windows reported a missing `mozglue` side-by-side assembly, even after a fresh official download. Browser binaries were not modified. This is documented, not counted as a passing Firefox run.

## Scenarios

1. Open **Simple Form Demo** through the playground link, assert `simple-form-demo` in the URL, enter a string variable, click **Get Checked Value**, and assert the exact right-hand message.
2. Open **Drag & Drop Sliders**, identify **Default value 15**, drag the thumb with the mouse to **95**, and assert both the slider's value and its visible output. The helper reads the rendered geometry and corrects rounding while holding the drag. It never assigns a DOM value or uses keyboard shortcuts.
3. Open **Input Form Submit**, click **Submit** while empty, verify required-field validity, focus, the native validation message and the absence of success; fill every field; select **United States** with `selectOption({ label: 'United States' })`; submit and assert the exact success text.

The suite uses five locator approaches: `getByRole`, `getByPlaceholder`, `getByText`, `getByLabel`, and CSS `locator` selectors. Synthetic example data is used throughout.

## Validation wording discrepancy

The PDF requests **"Please fill in the fields"**. On the current live website, HTML `required` validation produces **"Please fill out this field."** in the tested English Chromium and Edge browsers. A native validation bubble is outside the DOM, so the test reads `HTMLInputElement.validationMessage` and checks `validity.valueMissing`; it does not invent an alert, replace site text, or change validity rules. This difference is recorded as a test annotation and JSON attachment.

The default test checks the live behavior. To require the PDF's literal text as an additional assertion, set `STRICT_ASSIGNMENT_TEXT=true` in `.env`, then run the suite. This deliberately reports a failure against the current site while still exercising the successful submission. The included strict diagnostic result demonstrates the mismatch. Resolve the wording expectation with the assessor if literal matching is mandatory.

## Evidence for every local test

The custom fixture in `support/fixtures.ts` records successful and failed runs:

| Artifact | Output |
| --- | --- |
| Full-page final screenshot | `test-results/local/<test>/final.png` |
| Video | `.webm` in the test directory; attached to HTML report |
| Network archive | `network.har` (response bodies omitted) |
| Network events | `network.json` |
| Console messages and page errors | `console.json` |
| Trace with screenshots and source | `trace.zip` |
| Browser version, timings, evidence errors | `run-info.json` |
| HTML / JSON / JUnit reports | `playwright-report/local/`, `reports/` |

Empty console arrays are valid: capture is enabled even if the page emitted no messages. TestMu's **network**, **video**, **visual** (command screenshots), and **console** capabilities are all explicitly `true` for cloud runs. Local traces, screenshots and logs are also retained there. Evidence collection errors fail the test rather than disappearing silently.

Run `npm run report` to open the local HTML report. Click a test to inspect its steps and attachments. View an individual trace with `npx playwright show-trace <path-to-trace.zip>`. Current local raw results are overwritten by another local run; the supplied `evidence/` snapshot is separate.

## Run on TestMu AI later

1. Use the TestMu account associated with the certification registration. Ensure it has enough automation time and at least two concurrent slots.
2. Copy `.env.example` to `.env` and fill in `LT_USERNAME` and `LT_ACCESS_KEY` from your TestMu dashboard. Keep the key private; `.env` is ignored by Git.
3. Run:

```sh
npm run test:cloud
npm run sessions
npm run report:cloud
```

The cloud configuration requests **pw-chromium / Windows 10** and **pw-firefox / macOS Catalina** in parallel. It uses the documented `wss://cdp.lambdatest.com/playwright` endpoint, retained by TestMu AI. Each test gets its own cloud session, build name, pass/fail status and captured real session ID, for six sessions in total. The fixture supplies the installed Playwright client version. These cloud configurations are prepared but **have not been executed or validated with an account**. Check current availability in the capabilities generator and adjust the OS if the account/grid no longer supports it.

`npm run sessions` extracts only real session metadata from the latest cloud results and writes `reports/cloud-sessions.md`. It exits nonzero when six distinct passing sessions across two overlapping projects are absent. Inspect the TestMu dashboard for the actual OS/browser and all four cloud artifacts before submitting. Local Windows runs do not satisfy the cloud requirement.

## GitHub and submission

Use a **private** repository. Source, lockfile, configuration and documentation belong in Git; dependencies, credentials and fresh runtime reports are ignored. The `evidence/` snapshot contains the local verification record and selected screenshots.

The assignment asks for private reviewer access for **admin@testmuaicertifications.com**. Verify the matching GitHub account when adding a collaborator; do not guess a username. Reviewer invitation and acceptance must be checked separately. Submit the repository URL and real TestMu session IDs in the exam portal. Its deadline cannot be calculated from this PDF because no actual date/time is supplied. Follow the portal's displayed deadline and clarify the PDF's ambiguous "within 36 hours of the deadline" wording if necessary.

## Project layout

```text
tests/assignment.spec.ts          Three readable, step-based scenarios
support/fixtures.ts               Isolated browsers, artifacts, TestMu sessions
support/drag-slider.ts            Pointer-only range dragging
support/capabilities.ts           All cloud diagnostics enabled
support/cloud-preflight.ts        Missing credentials fail before connection
playwright.config.ts             Local browser projects and reporters
playwright.cloud.config.ts       Parallel cloud browser/OS projects
scripts/session-summary.cjs       Real cloud session ID summary
docs/REQUIREMENTS.md              Every assignment requirement and status
docs/VERIFICATION.md              Actual execution and limitations
evidence/                        Saved local result summary and screenshots
```

## Official references

- [Playwright release notes](https://playwright.dev/docs/release-notes)
- [TestMu AI Playwright setup](https://www.testmuai.com/support/docs/playwright-testing/)
- [Capabilities, session details and status hooks](https://www.testmuai.com/support/docs/playwright-test-execution-setup/)
- [Capabilities generator](https://www.testmuai.com/capabilities-generator/)

The assignment PDF is the specification; website content and documentation are reference material. Account creation, sharing and submission are not silently assumed completed.
