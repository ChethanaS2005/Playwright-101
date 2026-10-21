# Assignment requirements and completion status

Source: all six pages of the supplied Playwright 101 assignment PDF, including the reference screenshots. This checklist distinguishes implemented behavior, observed results and account-dependent requirements.

| PDF requirement | Implementation / evidence | Status |
| --- | --- | --- |
| Open the exact TestMu Selenium Playground | Shared `beforeEach` uses the requested URL | Implemented; tested locally |
| Click Simple Form Demo | Role/link locator | Implemented; tested locally |
| URL contains simple-form-demo | `toHaveURL(/simple-form-demo/)` | Implemented; tested locally |
| Create and enter a string variable | `message = 'Welcome to TestMu AI'`; placeholder fill | Implemented; tested locally |
| Click Get Checked Value | Exact button role locator | Implemented; tested locally |
| Same text under Your Message | Visible section and exact `#message` assertion | Implemented; tested locally |
| Open Drag & Drop Sliders | Exact link role locator | Implemented; tested locally |
| Select Default value 15 | Scoped group with visible label; initial value 15 asserted | Implemented; tested locally |
| Drag slider to 95 | Mouse down, move and up; no value injection or keyboard shortcut | Implemented; tested locally |
| Range display shows 95 | Input and output independently asserted | Implemented; tested locally |
| Open Input Form Submit | Exact link role locator | Implemented; tested locally |
| Submit empty form | Click before any fields are filled | Implemented; tested locally |
| Assert "Please fill in the fields" | Live native text is "Please fill out this field."; validity and message asserted; optional literal assertion provided | Literal wording differs; documented exception |
| Fill Name, Email and all other fields | All 10 inputs plus country are filled using synthetic data | Implemented; tested locally |
| Select United States by text | `selectOption({ label: 'United States' })` and selected option assertion | Implemented; tested locally |
| Click Submit and verify exact success text | Visibility and exact text assertions | Implemented; tested locally |
| Playwright, preferably latest | Playwright 1.64.1, current npm stable when prepared | Met |
| At least 3 different locators | Role, placeholder, text, label, CSS | Met: 5 approaches |
| Parallel execution | 2 workers, independent projects and test isolation | Verified locally |
| At least 2 browser/OS combinations on TestMu AI | Chromium/Windows 10 and Firefox/macOS Catalina cloud projects | Configured; NOT cloud-executed |
| Network logs for all runs | Local HAR + JSON; cloud `network: true` | Local verified; cloud pending |
| Video for all runs | Local WebM; cloud `video: true` | Local verified; cloud pending |
| Screenshots for all runs | Final PNG + trace screenshots; cloud `visual: true` | Local verified; cloud pending |
| Console logs for all runs | Captured console/page errors; cloud `console: true` | Local verified; cloud pending |
| Push project to GitHub | Uploaded to Vasu-Behl/playwright-101-assignment | Complete; remote branch verified |
| Keep repository private and share with named reviewer | Owner requested Public visibility on 22 October 2026 for sharing; no assessor invitation sent | Private requirement not currently met; invitation deferred |
| Submit repository URL and real TestMu session IDs | `npm run sessions` produces actual IDs only after cloud runs | Pending cloud execution and portal submission |
| Submit within stated time window | PDF gives no actual deadline date/time | Must check exam portal |
| Account email matches certification registration | No TestMu account supplied; user requested local testing | Not verified |
| Trial/extension if needed | Follow TestMu dashboard entitlement; PDF lists certification/support contact addresses | No account or trial change performed |

## Why the empty-form text is not silently changed

Browser-native validation is not a normal DOM alert. Reading `validationMessage` is the correct way to inspect its text. The suite checks the browser's actual message and missing-value state, documents the PDF discrepancy, and provides `STRICT_ASSIGNMENT_TEXT=true` to reproduce the literal failure. No application content is mocked, replaced or altered to manufacture a passing assertion.

## What the local result proves

It verifies all three functional flows on the actual public site in the named local browsers, plus artifact generation and concurrent execution. It does not prove the TestMu connection, macOS behavior, cloud capabilities delivery, reviewer access or exam submission. Chromium and Edge share an engine; the optional Firefox project provides a separate-engine target when its runtime is available.
