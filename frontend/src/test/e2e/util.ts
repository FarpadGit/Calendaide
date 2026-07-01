import { expect, type Locator, type Page } from '@playwright/test';

// sometimes Playwright has difficulties getting editables inside PrimeNG components with getByLabel(),
// so we replace them with getting the label by text and the element via CSS selector
export async function expectLabeledComponentToBeVisible(
  locator: Page | Locator,
  label: string | RegExp,
  selector: string,
) {
  const isComponentVisible =
    (await locator.getByText(label).isVisible()) && (await locator.locator(selector).isVisible());
  expect(isComponentVisible).toBe(true);
}
