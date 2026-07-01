import { test, expect, Locator, type Page } from '@playwright/test';
import { demoUserData } from '@/utils/demo';
import { dateToText, getDuration } from '@/utils/datetime';

export const actionTests = () =>
  test.describe('actionTests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/login');

      await page.getByRole('button', { name: /demo/i }).click();
    });

    test('displays tooltip on event hover', async ({ page }) => {
      const calendarEvent = page.locator('full-calendar').locator('.event-content').first();

      await expect(calendarEvent).toBeVisible();
      await calendarEvent.hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
    });

    test('drags calendar event', async ({ page }) => {
      const event = demoUserData.events[1];
      const src = page.locator('full-calendar').getByRole('gridcell', { name: '15' });
      const dest = page.locator('full-calendar').getByRole('gridcell', { name: '16' });
      await expect(src.locator('.event-content', { hasText: event.title })).toBeVisible();
      await expect(dest.locator('.event-content', { hasText: event.title })).toBeHidden();

      await src.locator('.event-content', { hasText: event.title }).dragTo(dest);

      await expect(src.locator('.event-content', { hasText: event.title })).toBeHidden();
      await expect(dest.locator('.event-content', { hasText: event.title })).toBeVisible();
    });

    test.describe('new events tab', () => {
      const firstContact = demoUserData.contacts[0];
      let tabpanel: Locator;
      test.beforeEach(async ({ page }) => {
        await page.getByRole('tab').nth(1).click();
        tabpanel = page.getByRole('tabpanel');
      });

      test('change current selected contact', async ({ page }) => {
        const secondContact = demoUserData.contacts[1];
        const contactSelect = tabpanel.locator('p-select');
        const selectDropdown = tabpanel.locator('.p-overlay');
        expect(await contactSelect.textContent()).toBe(demoUserData.contacts[0].name);

        await contactSelect.click();
        await expect(selectDropdown).toBeVisible();

        await tabpanel.getByText(secondContact.name).click();
        await expect(selectDropdown).toBeHidden();
        expect(await contactSelect.textContent()).toBe(secondContact.name);
        await expect(contactSelect.locator('.color-badge')).toBeVisible();
        if (secondContact.color) {
          await expect(contactSelect.locator('.color-badge')).toHaveCSS(
            '--contactColor',
            secondContact.color,
          );
        }
      });

      test('displays an edit dialog when contact edit option is selected', async ({ page }) => {
        await tabpanel.locator('.contact-list-container p-button[icon*="pi-ellipsis"]').click();
        await page
          .getByRole('dialog')
          .getByRole('button', { name: /szerkesztés/i })
          .click();

        const editDialog = page.getByRole('dialog').and(page.getByLabel(/kapcsolat szerkesztése/i));
        await expect(editDialog).toBeVisible();
        await expect(editDialog.getByLabel(/név/i)).toHaveValue(firstContact.name);
        if (firstContact.comment)
          await expect(editDialog.getByLabel(/megjegyzés/i)).toHaveValue(firstContact.comment);
        else await expect(editDialog.getByLabel(/megjegyzés/i)).toBeEmpty();
      });

      test('changes contact name', async ({ page }) => {
        const newName = 'New Contact Name';
        await tabpanel.locator('.contact-list-container p-button[icon*="pi-ellipsis"]').click();
        await page
          .getByRole('dialog')
          .getByRole('button', { name: /szerkesztés/i })
          .click();

        const editDialog = page.getByRole('dialog').and(page.getByLabel(/kapcsolat szerkesztése/i));
        await expect(editDialog).toBeVisible();
        await expect(editDialog.getByLabel(/név/i)).toHaveValue(firstContact.name);

        await editDialog.getByLabel(/név/i).fill(newName);
        await editDialog.getByRole('button', { name: /mentés/i }).click();

        await expect(editDialog).toBeHidden();
        expect(await tabpanel.locator('p-select').textContent()).toBe(newName);
      });

      test('creates new contact', async ({ page }) => {
        const newContactName = 'New Contact';
        const contactSelect = tabpanel.locator('p-select');
        const selectDropdown = tabpanel.locator('.p-overlay');
        await contactSelect.click();
        await expect(selectDropdown).toBeVisible();

        await tabpanel.getByText(/új kapcsolat/i).click();
        await expect(selectDropdown).toBeHidden();
        const newDialog = page.getByRole('dialog').and(page.getByLabel(/új kapcsolat hozzáadása/i));
        await expect(newDialog).toBeVisible();
        await newDialog.getByLabel(/név/i).fill(newContactName);
        await newDialog.getByRole('button', { name: /mentés/i }).click();
        await expect(newDialog).toBeHidden();

        await contactSelect.click();
        expect(await selectDropdown.textContent()).toContain(newContactName);
      });

      test('deletes active contact when contact delete option is selected', async ({ page }) => {
        const contactSelect = tabpanel.locator('p-select');
        expect(await contactSelect.textContent()).toBe(firstContact.name);
        await tabpanel.locator('.contact-list-container p-button[icon*="pi-ellipsis"]').click();
        await page
          .getByRole('dialog')
          .getByRole('button', { name: /törlés/i })
          .click();

        expect(await contactSelect.textContent()).not.toBe(firstContact.name);
        await contactSelect.click();
        expect(
          await tabpanel.locator('.p-overlay').describe('dropdown').textContent(),
        ).not.toContain(firstContact.name);
      });

      test('disables contact delete button if unscheduled events exist', async ({ page }) => {
        await tabpanel.getByRole('button', { name: /új esemény/i }).click();
        await tabpanel.locator('.contact-list-container p-button[icon*="pi-ellipsis"]').click();
        await expect(
          page.getByRole('dialog').getByRole('button', { name: /törlés/i }),
        ).toBeDisabled();
      });

      test('add one new event from toolbar', async ({ page }) => {
        await tabpanel.getByRole('button', { name: /új esemény/i }).click();
        await expect(tabpanel.locator('.event-content')).toBeVisible();
      });

      test('add multiple events from toolbar', async ({ page }) => {
        await tabpanel.locator('p-splitbutton button:nth-of-type(2)').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByRole('dialog').locator('button[data-pc-section="incrementbutton"]').click();
        await tabpanel.getByRole('button', { name: /új esemény/i }).click();
        expect((await tabpanel.locator('.event-content').all()).length).toBe(2);
      });

      test('drags new event from toolbar to calendar', async ({ page }) => {
        const dest = page.locator('full-calendar').getByRole('gridcell', { name: '22' });
        await tabpanel.getByRole('button', { name: /új esemény/i }).click();
        await expect(
          tabpanel.locator('.event-content', { hasText: firstContact.name }),
        ).toBeVisible();
        await tabpanel.locator('.event-content').dragTo(dest);

        await expect(tabpanel.locator('.event-content')).toBeHidden();
        await expect(dest.locator('.event-content', { hasText: firstContact.name })).toBeVisible();
      });

      test('deletes event from toolbar', async ({ page }) => {
        await tabpanel.getByRole('button', { name: /új esemény/i }).click();
        await expect(tabpanel.locator('.event-content')).toBeVisible();

        await tabpanel.locator('p-button[icon*="pi-trash"]').click();
        await expect(tabpanel.locator('.event-content')).toBeHidden();
      });
    });

    test.describe('event editing', () => {
      async function openContextMenu(page: Page, eventTitle?: string) {
        const calendarEvents = page.locator('full-calendar').locator('.event-content');
        const calendarEvent = eventTitle
          ? calendarEvents.getByText(eventTitle).first()
          : calendarEvents.first();
        await calendarEvent.click({ button: 'right' });
      }

      test('displays event context menu', async ({ page }) => {
        await openContextMenu(page);

        const contextMenu = page.getByRole('menu');
        await expect(contextMenu).toBeVisible();
        await expect(contextMenu.getByRole('menuitem', { name: /szerkesztés/i })).toBeVisible();
        await expect(contextMenu.getByRole('menuitem', { name: /törlés/i })).toBeVisible();
      });

      test('deletes an event when event delete option is selected', async ({ page }) => {
        const event = demoUserData.events[11];
        await openContextMenu(page, event.title);
        await page
          .getByRole('menu')
          .getByRole('menuitem', { name: /törlés/i })
          .click();

        const calendarEvent = page
          .locator('full-calendar')
          .locator('.event-content', { hasText: event.title });
        await expect(calendarEvent).toBeHidden();
      });

      test('displays an edit event dialog', async ({ page }) => {
        const event = demoUserData.events[6];
        const eventType = event.type === 'single' ? 'egyszeri' : 'rendszeres';
        const eventTime = dateToText(event.start!, { hour: '2-digit', minute: '2-digit' });
        const eventDuration = getDuration(event.start, event.end).toString();
        await openContextMenu(page, event.title);
        await page
          .getByRole('menu')
          .getByRole('menuitem', { name: /szerkesztés/i })
          .click();

        const editDialog = page.getByRole('dialog').and(page.getByLabel(/esemény szerkesztése/i));
        await expect(editDialog).toBeVisible();
        await expect(editDialog.getByText(eventType)).toBeVisible();
        await expect(editDialog.getByLabel(/címke/i)).toHaveValue(event.title);
        await expect(editDialog.locator('input#start-time')).toHaveValue(new RegExp(eventTime));
        const duration = await editDialog.locator('input#duration').inputValue();
        expect(duration.replace(',', '')).toBe(eventDuration);
        if (event.comment)
          await expect(editDialog.locator('textarea#comment')).toHaveValue(event.comment);
        else await expect(editDialog.locator('textarea#comment')).toBeEmpty();
      });

      test('edits event data', async ({ page }) => {
        const event = demoUserData.events[0];
        const newTitle = 'New Event Title';
        await openContextMenu(page, event.title);
        await page
          .getByRole('menu')
          .getByRole('menuitem', { name: /szerkesztés/i })
          .click();

        const editDialog = page.getByRole('dialog').and(page.getByLabel(/esemény szerkesztése/i));
        await expect(editDialog).toBeVisible();
        await expect(editDialog.getByLabel(/címke/i)).toHaveValue(event.title);

        await editDialog.getByLabel(/címke/i).fill(newTitle);
        await editDialog.locator('input#start-time').click();
        await editDialog.getByRole('gridcell', { name: '10' }).click();
        await editDialog.getByRole('button', { name: /mentés/i }).click();
        await expect(editDialog).toBeHidden();

        await expect(
          page.locator('full-calendar').locator('.event-content', { hasText: event.title }),
        ).toBeHidden();
        await expect(
          page
            .locator('full-calendar')
            .getByRole('gridcell', { name: '10' })
            .locator('.event-content', { hasText: newTitle }),
        ).toBeVisible();
      });
    });
  });
