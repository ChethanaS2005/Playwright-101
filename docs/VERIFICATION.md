# Verification record

Prepared 21 October 2026. These are actual results from the live public TestMu AI Playground, with no mocked pages or fabricated sessions.

## Final local run

- Command: `npm test`
- Result: **6 passed; 0 failed; 0 skipped; 0 flaky; 0 retries**.
- Elapsed time: **34.4 seconds**.
- Started: **21 October 2026, 23:53:36 IST** (18:23:36 UTC).
- Host: Windows, OS build **10.0.26300**.
- Playwright: **1.64.1**; Node.js: **22.20.0**.
- Execution: **2 workers**, concurrent browser projects.

| Scenario | Chromium 156.0.8078.4 | Microsoft Edge 155.0.4283.62 |
| --- | --- | --- |
| 1 - Message echoed exactly | Pass | Pass |
| 2 - Real pointer drag 15 to 95 | Pass | Pass |
| 3 - Empty validation, all fields, success | Pass with documented PDF wording difference | Pass with documented PDF wording difference |

Concurrency is visible in `evidence/verification-summary.json`: the first Chromium test ran from 18:23:38.482Z to 18:23:46.990Z and the first Edge test from 18:23:38.597Z to 18:23:46.995Z. These overlapping intervals demonstrate simultaneous local execution.

For **all six tests**, the final PNG, WebM video, network HAR, network event JSON, console JSON and trace ZIP were present. Every `run-info.json` recorded zero evidence-collection errors. HAR files contained 144 to 214 entries per test. Selected screenshots were inspected: the visible message matched, the selected slider displayed 95 and the form showed the success confirmation.

## Additional checks

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Pass |
| Cloud configuration test discovery | Six tests across the two requested cloud browser/OS projects |
| Cloud preflight without credentials | Correctly exits with an actionable missing-credentials error before connecting |
| `npm run sessions` before cloud runs | Correctly exits nonzero and reports that no real cloud IDs exist |
| Strict literal PDF validation | Expected failure: requested "Please fill in the fields"; actual "Please fill out this field." |
| Strict diagnostic positive submission | The subsequent success step still ran and passed |

The strict diagnostic is intentional, separate from the six-test local acceptance run, and retained in `evidence/strict-wording-results.json`. It demonstrates that the default suite has not secretly satisfied a nonexistent literal text requirement. Native behavior and literal wording are distinguished explicitly.

## Issues found and handled

1. The email label includes an asterisk: `Email*`. The locator was corrected to the observed accessible label and the final test passed.
2. The official Firefox 157.0 Windows bundle failed to launch with `spawn UNKNOWN`. The Windows SideBySide event log identified a missing `mozglue` assembly. A fresh official reinstall reproduced it. Firefox was not counted as passed; the optional Firefox project remains available, and the completed local run used Chromium and Edge. Browser binaries and system security were not modified.
3. The PDF's empty-form error phrase differs from live HTML validation. The suite records and tests the actual browser text; strict mode reproduces the literal discrepancy.

## Scope limits

- The user requested local execution because TestMu credentials were unavailable. No TestMu cloud sessions were started, and no cloud session IDs exist.
- Local Chromium and Edge share the Chromium engine and run on the same Windows host. This does not prove Firefox/macOS support or satisfy the assignment's cloud execution requirement.
- Cloud connection, cloud artifact delivery and account-specific browser/OS availability require a later real cloud run.
- Repository access for the assessor, the certification-account email and exam-portal submission are separate administrative requirements.
- The PDF supplies no actual deadline. This record makes no claim about timeliness or certification acceptance.

## Evidence locations

- `evidence/verification-summary.json`: concise version, timing and artifact inventory.
- `evidence/local-results.json`: original Playwright machine-readable result.
- `evidence/local-junit.xml`: JUnit results.
- `evidence/local-*-scenario-*.png`: screenshots from the final run.
- `evidence/strict-wording-results.json`: diagnostic literal-message failure.
- Delivered ZIP: also includes the full HTML report and per-test raw evidence under `playwright-report/local/` and `test-results/local/`.

The HTML report is best viewed with `npm run report` after `npm ci`. Click any result to view its trace, video, logs and screenshot.
