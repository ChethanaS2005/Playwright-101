import { test, expect } from '../support/fixtures';
import { dragSliderTo } from '../support/drag-slider';

test.beforeEach(async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (window as any).next?.router?.isReady === true, undefined, { timeout: 45_000 });
});

test('Scenario 1 - Simple Form Demo echoes the message', async ({ page }) => {
  await test.step('Open Simple Form Demo and verify its URL', async () => {
    await page.getByRole('link', { name: 'Simple Form Demo', exact: true }).click();
    await expect(page).toHaveURL(/simple-form-demo/);
  });
  await test.step('Enter a variable, submit it, and verify the right-hand result', async () => {
    const message = 'Welcome to TestMu AI';
    // Retry this idempotent interaction while the site's delayed scripts hydrate.
    // Keep the exact output assertion: a broken page still fails the test.
    await expect(async () => {
      await page.getByPlaceholder('Please enter your Message', { exact: true }).fill(message);
      await page.getByRole('button', { name: 'Get Checked Value', exact: true }).click();
      await expect(page.getByText('Your Message:', { exact: true })).toBeVisible();
      await expect(page.locator('#message')).toHaveText(message, { timeout: 2_000 });
    }).toPass({ timeout: 45_000, intervals: [500, 1_000, 2_000] });
  });
});

test('Scenario 2 - Drag Default value 15 to 95', async ({ page }) => {
  await page.getByRole('link', { name: 'Drag & Drop Sliders', exact: true }).click();
  const group = page.locator('#slider3');
  await expect(group.getByText('Default value 15', { exact: true })).toBeVisible();
  const slider = group.getByRole('slider');
  // Wait for React to attach the real change handler before dragging.
  await expect.poll(() => slider.evaluate(element =>
    Object.keys(element).some(key => key.startsWith('__reactProps$') &&
      typeof (element as any)[key]?.onChange === 'function')
  ), { message: 'Slider React change handler is ready' }).toBe(true);
  await expect(slider).toHaveValue('15');
  await expect(group.locator('output')).toHaveText('15');
  await test.step('Drag the thumb with the mouse and verify 95', async () => {
    await dragSliderTo(page, slider, 95);
    await expect(group.locator('output')).toHaveText('95');
  });
});

test('Scenario 3 - Required-field validation and successful submission', async ({ page, browserName }, testInfo) => {
  await page.getByRole('link', { name: 'Input Form Submit', exact: true }).click();
  const form = page.locator('#seleniumform');
  await expect.poll(() => form.evaluate(element =>
    Object.keys(element).some(key => key.startsWith('jQuery') &&
      (element as any)[key]?.events?.submit?.length > 0)
  ), { timeout: 45_000, message: 'Form submit handler is attached' }).toBe(true);
  const name = form.getByPlaceholder('Name', { exact: true });
  const success = page.getByText('Thanks for contacting us, we will get back to you shortly.', { exact: true });

  await test.step('Submit the empty form and assert required-field validation', async () => {
    await form.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(name).toBeFocused();
    await expect(name).toHaveJSProperty('value', '');
    expect(await name.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
    expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false);
    await expect(success).toBeHidden();
    const actualMessage = await name.evaluate((input: HTMLInputElement) => input.validationMessage);
    const assignmentMessage = 'Please fill in the fields';
    // Native HTML validation messages are rendered by the browser, outside the DOM.
    const nativeMessage = 'Please fill out this field.';
    expect(actualMessage).toBe(nativeMessage);
    testInfo.annotations.push({ type: 'assignment-discrepancy', description: `PDF: "${assignmentMessage}"; native ${browserName}: "${actualMessage}". See docs/REQUIREMENTS.md.` });
    await testInfo.attach('Empty-form validation', {
      body: JSON.stringify({ assignmentMessage, actualMessage, browserName, valueMissing: true }, null, 2),
      contentType: 'application/json',
    });
    await testInfo.attach('Empty form screenshot', { body: await page.screenshot(), contentType: 'image/png' });
    if (process.env.STRICT_ASSIGNMENT_TEXT === 'true') {
      expect.soft(actualMessage, 'Literal PDF wording differs from the live site').toBe(assignmentMessage);
    }
  });

  await test.step('Fill every field and select United States by visible text', async () => {
    await name.fill('Alex Morgan');
    await form.getByLabel('Email*', { exact: true }).fill('alex.morgan@example.com');
    await form.getByPlaceholder('Password', { exact: true }).fill('DemoOnly!2026');
    await form.getByPlaceholder('Company', { exact: true }).fill('Example QA');
    await form.getByPlaceholder('Website', { exact: true }).fill('https://example.com');
    await form.getByRole('combobox').selectOption({ label: 'United States' });
    await expect(form.locator('select option:checked')).toHaveText('United States');
    await form.getByPlaceholder('City', { exact: true }).fill('San Francisco');
    await form.getByPlaceholder('Address 1', { exact: true }).fill('123 Example Street');
    await form.getByPlaceholder('Address 2', { exact: true }).fill('Suite 100');
    await form.getByPlaceholder('State', { exact: true }).fill('California');
    await form.getByPlaceholder('Zip code', { exact: true }).fill('94105');
    expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(true);
  });
  await test.step('Submit and verify the exact success message', async () => {
    await expect(async () => {
      await form.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(success).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 45_000, intervals: [500, 1_000, 2_000] });
    await expect(success).toHaveText('Thanks for contacting us, we will get back to you shortly.');
  });
});
