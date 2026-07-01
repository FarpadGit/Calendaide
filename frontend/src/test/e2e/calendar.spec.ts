import { test, expect, Locator } from '@playwright/test';
import { expectLabeledComponentToBeVisible } from './util';

export const calendarTests = () =>
  test.describe('calendarTests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/login');

      await page.getByRole('button', { name: /demo/i }).click();
    });

    test('enter demo application', async ({ page }) => {
      const currentMonthDate = Intl.DateTimeFormat('hu-HU', {
        year: 'numeric',
        month: 'long',
      }).format(new Date());

      await expect(page.getByText('Demó felhasználó')).toBeVisible();
      await expect(page.getByRole('heading', { level: 2, name: currentMonthDate })).toBeVisible();
      await expect(page.locator('full-calendar')).toBeVisible();
      await expect(page.locator('full-calendar').locator('.event-content').first()).toBeVisible();
      expect((await page.getByRole('tab').all()).length).toBe(3);
    });

    test.describe('summary tab', () => {
      let tabpanel: Locator;
      test.beforeEach(async ({ page }) => {
        await page.getByRole('tab').nth(0).click();
        tabpanel = page.getByRole('tabpanel');
      });

      test('displays a date picker and at least one panel for current daily events', async ({
        page,
      }) => {
        await expect(tabpanel.locator('p-datepicker')).toBeVisible();
        await expect(tabpanel.getByText(/nap eseményei/i)).toBeVisible();
      });

      test('displays two panels for current daily events and future events if the latter exists', async ({
        page,
      }) => {
        await tabpanel.getByRole('gridcell', { name: '14' }).click();

        await expect(tabpanel.getByText(/nap eseményei/i)).toBeVisible();
        await expect(tabpanel.getByText(/események a közeljövőben/i)).toBeVisible();
      });

      test('displays the correct number of current events', async ({ page }) => {
        await tabpanel.getByRole('gridcell', { name: '10' }).click();

        const currentEventsPanel = tabpanel.locator('p-panel:nth-of-type(1)');
        await expect(currentEventsPanel).toBeVisible();
        expect(
          (await currentEventsPanel.locator('.event-field').all()).length,
        ).toBeGreaterThanOrEqual(2);
      });

      test('displays the correct number of future events', async ({ page }) => {
        await tabpanel.getByRole('gridcell', { name: '9', exact: true }).click();

        const futureEventsPanel = tabpanel.locator('p-panel:nth-of-type(2)');
        await expect(futureEventsPanel).toBeVisible();
        expect(
          (await futureEventsPanel.locator('.event-group').all()).length,
        ).toBeGreaterThanOrEqual(5);
        expect(
          (await futureEventsPanel.locator('.event-field').all()).length,
        ).toBeGreaterThanOrEqual(8);
      });
    });

    test.describe('new events tab', () => {
      let tabpanel: Locator;
      test.beforeEach(async ({ page }) => {
        await page.getByRole('tab').nth(1).click();
        tabpanel = page.getByRole('tabpanel');
      });

      test('displays unscheduled events panel with buttons', async ({ page }) => {
        await expect(tabpanel.locator('p-select').describe('contact selector')).toBeVisible();
        await expect(tabpanel.getByRole('button', { name: /új esemény/i })).toBeVisible();
        await expect(tabpanel.getByText(/ütemezetlen események/i)).toBeVisible();
        await expect(tabpanel.locator('.event-content')).toBeHidden();
      });

      test('displays actions for current selected contact', async ({ page }) => {
        await tabpanel.locator('.contact-list-container p-button[icon*="pi-ellipsis"]').click();
        const optionsDialog = page.getByRole('dialog');

        await expect(optionsDialog).toBeVisible();
        await expect(optionsDialog.getByRole('button', { name: /szerkesztés/i })).toBeVisible();
        await expect(optionsDialog.getByRole('button', { name: /törlés/i })).toBeVisible();
      });

      test('displays an edit dialog when contact edit option is selected', async ({ page }) => {
        await tabpanel.locator('.contact-list-container p-button[icon*="pi-ellipsis"]').click();
        await page
          .getByRole('dialog')
          .getByRole('button', { name: /szerkesztés/i })
          .click();

        const editDialog = page.getByRole('dialog').and(page.getByLabel(/kapcsolat szerkesztése/i));
        await expect(editDialog).toBeVisible();
      });

      test('displays a new contact dialog', async ({ page }) => {
        await tabpanel.locator('p-select').click();
        const selectDropdown = tabpanel.locator('.p-overlay');
        await expect(selectDropdown).toBeVisible();

        await tabpanel.getByText(/új kapcsolat/i).click();
        await expect(selectDropdown).toBeHidden();
        const newDialog = page.getByRole('dialog').and(page.getByLabel(/új kapcsolat hozzáadása/i));
        await expect(newDialog).toBeVisible();
        await expect(newDialog.getByLabel(/név/i)).toBeEmpty();
        await expect(newDialog.getByLabel(/megjegyzés/i)).toBeEmpty();
      });
    });

    test.describe('settings tab', () => {
      let tabpanel: Locator;
      test.beforeEach(async ({ page }) => {
        await page.getByRole('tab').nth(2).click();
        tabpanel = page.getByRole('tabpanel');
      });

      test('displays at least 2 input components for save mode, username and a Save settings button', async ({
        page,
      }) => {
        await expectLabeledComponentToBeVisible(tabpanel, /mentési mód/i, '#savemode');
        await expect(tabpanel.getByLabel(/felhasználó név/i)).toBeVisible();
        await expect(tabpanel.getByRole('button', { name: /beállítások mentése/i })).toBeVisible();
      });
    });
  });
