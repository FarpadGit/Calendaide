import { test, expect } from '@playwright/test';
import { expectLabeledComponentToBeVisible } from './util';

export const pageTests = () =>
  test.describe('pageTests', () => {
    test('login page has title, 2 inputs for username/password, 3 buttons for logging in with password, google or demo application and link to register page', async ({
      page,
    }) => {
      await page.goto('https://calendaide.vercel.app/login');

      await expect(page).toHaveTitle(/Calendaide/);
      await expectLabeledComponentToBeVisible(page, /email cím/i, 'input[name="email"]');
      await expectLabeledComponentToBeVisible(page, /jelszó/i, 'input[name="password"]');
      expect((await page.getByRole('button').all()).length).toBe(3);
      await expect(page.getByRole('button').nth(0)).toHaveText(/belépés/i);
      await expect(page.getByRole('button').nth(1)).toHaveText(/google/i);
      await expect(page.getByRole('button').nth(2)).toHaveText(/demo/i);
      await expect(page.locator('a[href="/register"]')).toBeVisible();
    });

    test('register page has title, 2 inputs for username/password, 2 buttons for signing up with password or google account and link to login page', async ({
      page,
    }) => {
      await page.goto('https://calendaide.vercel.app/register');

      await expect(page).toHaveTitle(/Calendaide/);
      await expectLabeledComponentToBeVisible(page, /email cím/i, 'input[name="email"]');
      await expectLabeledComponentToBeVisible(page, /jelszó/i, 'input[name="password"]');
      expect((await page.getByRole('button').all()).length).toBe(2);
      await expect(page.getByRole('button').nth(0)).toHaveText(/fiók létrehozása/i);
      await expect(page.getByRole('button').nth(1)).toHaveText(/google/i);
      await expect(page.locator('a[href="/login"]')).toBeVisible();
    });
  });
