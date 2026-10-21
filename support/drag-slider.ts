import { expect, type Locator, type Page } from '@playwright/test';

/** Real pointer drag with feedback; never assigns value or dispatches synthetic input events. */
export async function dragSliderTo(page: Page, slider: Locator, target: number): Promise<void> {
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  if (!box) throw new Error('Slider is not visible.');
  const min = Number(await slider.getAttribute('min') ?? 0);
  const max = Number(await slider.getAttribute('max') ?? 100);
  if (target < min || target > max) throw new Error('Target is outside the slider range.');
  const start = Number(await slider.inputValue());
  // The thumb is 16px in the current page stylesheet. Feedback below absorbs
  // differences in browser thumb geometry without changing application state.
  const inset = 8;
  const usable = box.width - 2 * inset;
  const toX = (value: number) => box.x + inset + ((value - min) / (max - min)) * usable;
  const y = box.y + box.height / 2;
  await page.mouse.move(toX(start), y);
  await page.mouse.down();
  try {
    let x = toX(target);
    await page.mouse.move(x, y, { steps: 30 });
    // Keep the same drag held and correct small rounding differences by feedback.
    for (let attempt = 0; attempt < 8; attempt++) {
      const actual = Number(await slider.inputValue());
      if (actual === target) break;
      x += (target - actual) * usable / (max - min);
      x = Math.max(box.x + inset, Math.min(box.x + box.width - inset, x));
      await page.mouse.move(x, y, { steps: 3 });
    }
  } finally {
    await page.mouse.up();
  }
  await expect(slider).toHaveValue(String(target));
}
