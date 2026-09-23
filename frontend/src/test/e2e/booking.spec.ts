import { test, expect } from '@playwright/test';

const testUserEmail = 'E2ETestUser@email.com';
const testUserPassword = 'test';
const testBookingEndpoint = 'e2etest';
const testContactName = 'E2E Test Contact';
const testContactPassword = 'test';

export const bookingSetup = () =>
  test.describe('bookingSetup', () => {
    test('register test user', async ({ page }) => {
      await page.goto('http://localhost:4200/register');
      await page.locator('input[name="email"]').fill(testUserEmail);
      await page.locator('input[name="password"]').fill(testUserPassword);
      await page.getByRole('button', { name: /^((?!google).)*$/i }).click();

      // change settings
      await page.getByRole('tab').last().click();
      await page.getByLabel(/időpontfoglalás/i).click();
      await page.getByLabel('Időpontfoglalási azonosító').fill(testBookingEndpoint);
      await page.getByRole('button', { name: /mentés/i }).click();

      // edit default contact
      await page.getByRole('tab').nth(1).click();
      const tabpanel = page.getByRole('tabpanel');
      await tabpanel.locator('.contact-list-container p-button[icon*="pi-ellipsis"]').click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: /szerkesztés/i })
        .click();
      const editDialog = page.getByRole('dialog').and(page.getByLabel(/kapcsolat szerkesztése/i));
      await editDialog.getByLabel(/név/i).fill(testContactName);
      await editDialog.locator('#passwordSetter').click();
      await editDialog.getByLabel(/jelszó/i).fill(testContactPassword);
      await editDialog.getByRole('button', { name: /mentés/i }).click();

      // add 3 events
      await tabpanel.locator('p-splitbutton button:nth-of-type(2)').click();
      await page.getByRole('dialog').locator('button[data-pc-section="incrementbutton"]').click();
      await page.getByRole('dialog').locator('button[data-pc-section="incrementbutton"]').click();
      await tabpanel.getByRole('button', { name: /új esemény/i }).click();

      // log out
      await page.locator('p-avatar').click();
      await page.getByRole('button', { name: /kijelentkezés/i }).click();
    });
  });

export const bookingTeardown = () =>
  test.describe('bookingTeardown', () => {
    test('delete test user', async ({ page }) => {
      await page.goto('http://localhost:4200/login');
      await page.locator('input[name="email"]').fill(testUserEmail);
      await page.locator('input[name="password"]').fill(testUserPassword);
      await page.getByRole('button', { name: /^((?!google|demo).)*$/i }).click();

      await page.getByRole('tab').last().click();
      await page.getByRole('button', { name: 'Fiók Törlése' }).click();
      await page.getByRole('button', { name: 'Igen', exact: true }).click();
    });
  });

export const bookingTests = () =>
  test.describe('bookingTests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`http://localhost:4200/${testBookingEndpoint}/foglalas`);
    });

    test('booking page has title, calendar grid and toolbar controls', async ({ page }) => {
      await expect(page).toHaveTitle(/időpontfoglalás/i);
      await expect(page.getByRole('grid')).toBeVisible();
      await expect(page.locator('#bookingDestinationSelect')).toBeVisible();
      await expect(page.locator('app-calendar-event-content')).toBeVisible();
      expect((await page.locator('app-calendar-event-content').all()).length).toBe(1);
      await expect(page.getByLabel(/név/i)).toBeVisible();
      await expect(page.getByText(/kezdés/i)).toBeVisible();
      await expect(page.getByText(/vége/i)).toBeVisible();
      await expect(page.getByLabel(/megjegyzés/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /foglalás/i })).toBeVisible();
    });

    test('drags new event from toolbar to calendar', async ({ page }) => {
      const src = page.locator('.draggable-event-queue');
      const dest = page
        .getByRole('grid')
        .locator('.fc-timegrid-slots td.fc-timegrid-slot-lane[data-time="05:00:00"]');
      await src.locator('app-calendar-event-content').dragTo(dest);

      await expect(src.locator('app-calendar-event-content')).toBeHidden();
      await expect(page.getByRole('grid').locator('app-calendar-event-content')).toBeVisible();
      await expect(page.locator('#start + *')).toContainText(/05:00/i);
      await expect(page.locator('#end + *')).toContainText(/06:00/i);
    });

    test('resets event from calendar to toolbar', async ({ page }) => {
      const src = page.locator('.draggable-event-queue');
      const dest = page
        .getByRole('grid')
        .locator('.fc-timegrid-slots td.fc-timegrid-slot-lane[data-time="05:00:00"]');
      await src.locator('app-calendar-event-content').dragTo(dest);

      await page.locator('#reset-btn').click();

      await expect(src.locator('app-calendar-event-content')).toBeVisible();
      await expect(page.getByRole('grid').locator('app-calendar-event-content')).toBeHidden();
      await expect(page.locator('#start + *')).toContainText(/ismeretlen/i);
      await expect(page.locator('#end + *')).toContainText(/ismeretlen/i);
    });

    test('changes selected event title', async ({ page }) => {
      await page.getByLabel(/név/i).fill('New Title');

      await expect(page.locator('app-calendar-event-content')).toHaveText('New Title');
    });

    test.describe('contact tab', () => {
      test.beforeEach(async ({ page }) => {
        await page.locator('#bookingDestinationSelect').getByRole('button').nth(1).click();
      });

      test('shows a panel for contact name and password', async ({ page }) => {
        await expect(page.locator('app-calendar-event-content')).toBeHidden();
        await expect(page.getByLabel(/név/i)).toBeHidden();
        await expect(page.getByText(/kezdés/i)).toBeHidden();
        await expect(page.getByText(/vége/i)).toBeHidden();
        await expect(page.getByLabel(/megjegyzés/i)).toBeHidden();
        await expect(page.getByRole('button', { name: /foglalás/i })).toBeHidden();

        await expect(page.getByLabel(/kapcsolat neve/i)).toBeVisible();
        await expect(page.getByLabel(/jelszó/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /küldés/i })).toBeVisible();
      });

      test('fetches events belonging to contact', async ({ page }) => {
        await page.getByLabel(/kapcsolat neve/i).fill(testContactName);
        await page.getByLabel(/jelszó/i).fill(testContactPassword);
        await page.getByRole('button', { name: /küldés/i }).click();

        await page.waitForResponse(`http://localhost:8000/booking/${testBookingEndpoint}/contacts`);

        await expect(page.locator('.draggable-event-queue')).toBeVisible();
        const events = await page.locator('app-calendar-event-content').all();
        const texts = await page.locator('app-calendar-event-content').allInnerTexts();
        expect(events.length).toBe(3);
        texts.forEach((text) => expect(text).toBe(testContactName));
      });
    });
  });
